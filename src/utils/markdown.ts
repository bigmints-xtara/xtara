import { marked } from 'marked';

export interface AboutPageData {
  title: string;
  description: string;
  image: string;
  content: string;
}

export async function parseAboutMarkdown(markdown: string): Promise<AboutPageData> {
  // Split frontmatter and content
  const parts = markdown.split('---');
  
  if (parts.length < 3) {
    throw new Error('Invalid markdown format: missing frontmatter');
  }
  
  const frontmatter = parts[1].trim();
  const content = parts.slice(2).join('---').trim();
  
  // Parse frontmatter
  const frontmatterLines = frontmatter.split('\n');
  const metadata: Record<string, string> = {};
  
  frontmatterLines.forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      metadata[key.trim()] = value;
    }
  });
  
  return {
    title: metadata.title || 'About Us',
    description: metadata.description || '',
    image: metadata.image || '',
    content: await marked.parse(content)
  };
} 