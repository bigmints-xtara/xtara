const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Function to parse markdown content and extract sections
function parseMarkdownContent(content) {
  const sections = {};
  const lines = content.split('\n');
  let currentSection = '';
  let currentSubsection = '';
  let currentContent = [];
  let bulletCounter = 0;

  for (let line of lines) {
    // Check for main sections (##)
    if (line.startsWith('## ')) {
      if (currentSection && currentContent.length > 0) {
        if (currentSubsection) {
          if (!sections[currentSection]) {
            sections[currentSection] = {};
          }
          sections[currentSection][currentSubsection] = currentContent.join('\n').trim();
        } else {
          sections[currentSection] = currentContent.join('\n').trim();
        }
      }
      currentSection = line.replace('## ', '').trim();
      currentSubsection = '';
      currentContent = [];
    }
    // Check for subsections (###)
    else if (line.startsWith('### ')) {
      if (currentSection && currentContent.length > 0) {
        if (currentSubsection) {
          if (!sections[currentSection]) {
            sections[currentSection] = {};
          }
          sections[currentSection][currentSubsection] = currentContent.join('\n').trim();
        } else {
          sections[currentSection] = currentContent.join('\n').trim();
        }
      }
      currentSubsection = line.replace('### ', '').trim();
      currentContent = [];
    }
    // Check for sub-subsections (####)
    else if (line.startsWith('#### ')) {
      if (currentSubsection && currentContent.length > 0) {
        if (!sections[currentSection]) {
          sections[currentSection] = {};
        }
        sections[currentSection][currentSubsection] = currentContent.join('\n').trim();
      }
      // Handle bullets with unique keys
      if (line.includes('Bullets:')) {
        bulletCounter++;
        currentSubsection = `Bullets ${bulletCounter}:`;
      } else {
        currentSubsection = line.replace('#### ', '').trim();
      }
      currentContent = [];
    }
    // Regular content
    else if (line.trim() !== '' && !line.startsWith('---')) {
      currentContent.push(line);
    }
  }

  // Add the last section
  if (currentSection && currentContent.length > 0) {
    if (currentSubsection) {
      if (!sections[currentSection]) {
        sections[currentSection] = {};
      }
      sections[currentSection][currentSubsection] = currentContent.join('\n').trim();
    } else {
      sections[currentSection] = currentContent.join('\n').trim();
    }
  }

  return sections;
}

// Function to extract benefits from markdown
function extractBenefits(content) {
  const benefits = [];
  const lines = content.split('\n');
  let currentBenefit = null;
  let currentBullets = [];

  for (let line of lines) {
    if (line.startsWith('### Benefit ')) {
      if (currentBenefit) {
        currentBenefit.bullets = currentBullets;
        benefits.push(currentBenefit);
      }
      const title = line.replace('### Benefit ', '').split(':')[0];
      currentBenefit = { title };
      currentBullets = [];
    } else if (line.startsWith('- **') && currentBenefit) {
      const bulletMatch = line.match(/\*\*(.*?)\*\*: (.*)/);
      if (bulletMatch) {
        currentBullets.push({
          title: bulletMatch[1],
          description: bulletMatch[2]
        });
      }
    } else if (line.trim() && !line.startsWith('####') && currentBenefit && !currentBenefit.description) {
      currentBenefit.description = line.trim();
    }
  }

  if (currentBenefit) {
    currentBenefit.bullets = currentBullets;
    benefits.push(currentBenefit);
  }

  return benefits;
}

// Function to extract features from markdown
function extractFeatures(content) {
  const features = [];
  const lines = content.split('\n');
  let currentFeature = null;

  for (let line of lines) {
    if (line.startsWith('### Feature ')) {
      if (currentFeature) {
        features.push(currentFeature);
      }
      const title = line.replace('### Feature ', '').split(':')[0];
      currentFeature = { title };
    } else if (line.trim() && !line.startsWith('###') && currentFeature && !currentFeature.description) {
      currentFeature.description = line.trim();
    }
  }

  if (currentFeature) {
    features.push(currentFeature);
  }

  return features;
}

// Function to extract features from sections
function extractFeaturesFromSections(sections) {
  const features = [];
  Object.keys(sections).forEach(key => {
    if (key.startsWith('Feature ')) {
      const title = key.replace('Feature ', '').split(':')[0];
      features.push({
        title,
        description: sections[key]
      });
    }
  });
  return features;
}

// Function to extract benefits from sections
function extractBenefitsFromSections(sections) {
  const benefits = [];
  const benefitsSection = sections['Benefits Section'];
  
  if (benefitsSection && typeof benefitsSection === 'object') {
    let currentBenefit = null;
    let benefitIndex = 0;
    
    Object.keys(benefitsSection).forEach(key => {
      if (key.startsWith('Benefit ')) {
        // Save previous benefit if exists
        if (currentBenefit) {
          benefits.push(currentBenefit);
        }
        
        const titleMatch = key.match(/Benefit \d+: (.+)/);
        const title = titleMatch ? titleMatch[1] : key.replace('Benefit ', '');
        const description = benefitsSection[key];
        
        benefitIndex++;
        currentBenefit = {
          title,
          description,
          bullets: []
        };
      } else if (key.startsWith('Bullets ') && currentBenefit) {
        const bulletsText = benefitsSection[key];
        const bulletLines = bulletsText.split('\n');
        bulletLines.forEach(line => {
          if (line.startsWith('- **')) {
            const match = line.match(/\*\*(.*?)\*\*: (.*)/);
            if (match) {
              currentBenefit.bullets.push({
                title: match[1],
                description: match[2]
              });
            }
          }
        });
      }
    });
    
    // Add the last benefit
    if (currentBenefit) {
      benefits.push(currentBenefit);
    }
  }
  
  return benefits;
}

// Generate data for each page
function generatePageData() {
  const pagesDir = path.join(__dirname, '../src/data/pages');
  const outputDir = path.join(__dirname, '../src/data');

  // Read all markdown files except news.md (handled separately)
  const files = fs.readdirSync(pagesDir).filter(file => file.endsWith('.md') && file !== 'news.md');

  files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: markdownContent } = matter(content);
    
    const pageName = file.replace('.md', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const sections = parseMarkdownContent(markdownContent);

    // Extract features if this is the download page
    let features = [];
    if (pageName === 'download') {
      features = extractFeaturesFromSections(sections);
    }

    // Extract benefits if this is the home page
    let benefits = [];
    if (pageName === 'home') {
      benefits = extractBenefitsFromSections(sections);
    }

    // Generate TypeScript content
    let tsContent = `// Auto-generated from ${file} - DO NOT EDIT MANUALLY
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PageData {
  metadata: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    canonicalUrl: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any; // Auto-generated content structure
  features?: Array<{
    title: string;
    description: string;
  }>;
  benefits?: Array<{
    title: string;
    description: string;
    bullets: Array<{
      title: string;
      description: string;
    }>;
  }>;
}

export const ${pageName}Data: PageData = {
  metadata: ${JSON.stringify(frontmatter, null, 2)},
  content: ${JSON.stringify(sections, null, 2)}${features.length > 0 ? `,
  features: ${JSON.stringify(features, null, 2)}` : ''}${benefits.length > 0 ? `,
  benefits: ${JSON.stringify(benefits, null, 2)}` : ''}
};
`;

    // Write the TypeScript file
    const outputPath = path.join(outputDir, `${pageName}Data.ts`);
    fs.writeFileSync(outputPath, tsContent);
    console.log(`Generated ${outputPath}`);
  });
}

// Run the script
generatePageData(); 