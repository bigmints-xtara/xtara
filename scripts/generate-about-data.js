const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Read the markdown file
const markdownPath = path.join(__dirname, '../src/data/about.md');
const markdownContent = fs.readFileSync(markdownPath, 'utf8');

// Parse frontmatter and content
const parts = markdownContent.split('---');

if (parts.length < 3) {
  console.error('Invalid markdown format: missing frontmatter');
  process.exit(1);
}

const frontmatter = parts[1].trim();
const content = parts.slice(2).join('---').trim();

// Parse YAML frontmatter
const frontmatterLines = frontmatter.split('\n');
const metadata = {};

frontmatterLines.forEach(line => {
  const [key, ...valueParts] = line.split(':');
  if (key && valueParts.length > 0) {
    const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
    metadata[key.trim()] = value;
  }
});

// Generate TypeScript file
const tsContent = `// Auto-generated from about.md - DO NOT EDIT MANUALLY
export interface AboutPageData {
  title: string;
  description: string;
  image: string;
  content: string;
}

export const aboutData: AboutPageData = {
  title: ${JSON.stringify(metadata.title || 'About Us')},
  description: ${JSON.stringify(metadata.description || '')},
  image: ${JSON.stringify(metadata.image || '')},
  content: ${JSON.stringify(marked(content))}
};
`;

// Write the TypeScript file
const outputPath = path.join(__dirname, '../src/data/aboutData.ts');
fs.writeFileSync(outputPath, tsContent);

console.log('✅ About data generated successfully from about.md'); 