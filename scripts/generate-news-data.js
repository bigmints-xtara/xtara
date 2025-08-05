const fs = require('fs');
const path = require('path');

const newsDirectory = path.join(process.cwd(), 'src', 'data', 'news');

const parseFrontMatter = (fileContents) => {
    const delimiter = '---';
    if (!fileContents.startsWith(delimiter)) {
        return { data: {}, content: fileContents };
    }
    const end = fileContents.indexOf(delimiter, delimiter.length);
    const raw = fileContents.slice(delimiter.length, end).trim();
    const content = fileContents.slice(end + delimiter.length).trim();

    const data = {};
    raw.split('\n').forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key) {
            data[key.trim()] = rest.join(':').trim().replace(/^"|"$/g, '');
        }
    });

    return { data, content };
};

const getExcerpt = (content) => {
    const line = content
        .split('\n')
        .find(l => l.trim() && !l.startsWith('#')) || '';
    return line.trim().slice(0, 160);
};

const generateNewsData = () => {
    const files = fs.readdirSync(newsDirectory);
    const newsData = [];
    const newsContent = {};

    files
        .filter(file => file.endsWith('.md') && file !== 'index.ts')
        .forEach(file => {
            const fullPath = path.join(newsDirectory, file);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data, content } = parseFrontMatter(fileContents);
            const slug = file.replace(/\.md$/, '');

            newsData.push({
                slug,
                title: data.title,
                date: data.date,
                image: data.image,
                description: getExcerpt(content),
            });

            newsContent[slug] = content;
        });

    // Sort by date (newest first)
    newsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const output = `import { INewsArticle, INewsMeta } from '@/types';

export const newsData: INewsMeta[] = ${JSON.stringify(newsData, null, 4)};

export const newsContent: Record<string, string> = ${JSON.stringify(newsContent, null, 4)};

export const getAllNews = (): INewsMeta[] => {
    return newsData;
};

export const getNewsBySlug = (slug: string): INewsArticle => {
    const article = newsData.find(item => item.slug === slug);
    if (!article) {
        throw new Error(\`News article with slug "\${slug}" not found\`);
    }
    
    return {
        ...article,
        content: newsContent[slug] || ""
    };
};

export const markdownToHtml = (markdown: string): string => {
    const lines = markdown.split('\\n');
    const html = lines
        .map(line => {
            if (line.startsWith('### ')) {
                return \`<h3>\${line.substring(4)}</h3>\`;
            }
            if (line.startsWith('## ')) {
                return \`<h2>\${line.substring(3)}</h2>\`;
            }
            if (line.startsWith('# ')) {
                return \`<h1>\${line.substring(2)}</h1>\`;
            }
            if (line.trim() === '') {
                return '';
            }
            return \`<p>\${line}</p>\`;
        })
        .join('\\n');

    return html;
};
`;

    fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'newsData.ts'), output);
    console.log(`✅ Generated news data with ${newsData.length} articles`);
};

generateNewsData(); 