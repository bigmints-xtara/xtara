import fs from 'fs';
import path from 'path';
import { INewsArticle, INewsMeta } from '@/types';

const newsDirectory = path.join(process.cwd(), 'src', 'data', 'news');

interface FrontMatterResult {
    data: Record<string, string>;
    content: string;
}

const parseFrontMatter = (fileContents: string): FrontMatterResult => {
    const delimiter = '---';
    if (!fileContents.startsWith(delimiter)) {
        return { data: {}, content: fileContents };
    }
    const end = fileContents.indexOf(delimiter, delimiter.length);
    const raw = fileContents.slice(delimiter.length, end).trim();
    const content = fileContents.slice(end + delimiter.length).trim();

    const data: Record<string, string> = {};
    raw.split('\n').forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key) {
            data[key.trim()] = rest.join(':').trim().replace(/^"|"$/g, '');
        }
    });

    return { data, content };
};

export const getAllNews = (): INewsMeta[] => {
    const files = fs.readdirSync(newsDirectory);
    const items: INewsMeta[] = files
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const fullPath = path.join(newsDirectory, file);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data } = parseFrontMatter(fileContents);
            return {
                slug: file.replace(/\.md$/, ''),
                title: data.title,
                date: data.date,
                image: data.image,
            } as INewsMeta;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
};

export const getNewsBySlug = (slug: string): INewsArticle => {
    const fullPath = path.join(newsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = parseFrontMatter(fileContents);
    return {
        slug,
        title: data.title,
        date: data.date,
        image: data.image,
        content,
    } as INewsArticle;
};

export const markdownToHtml = (markdown: string): string => {
    const lines = markdown.split('\n');
    const html = lines
        .map(line => {
            if (line.startsWith('### ')) {
                return `<h3>${line.substring(4)}</h3>`;
            }
            if (line.startsWith('## ')) {
                return `<h2>${line.substring(3)}</h2>`;
            }
            if (line.startsWith('# ')) {
                return `<h1>${line.substring(2)}</h1>`;
            }
            if (line.trim() === '') {
                return '';
            }
            return `<p>${line}</p>`;
        })
        .join('\n');

    return html;
};


