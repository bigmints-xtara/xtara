import { INewsArticle, INewsMeta } from '@/types';

export const newsData: INewsMeta[] = [
    {
        "slug": "ai-career-algorithm",
        "title": "New AI-Powered Career Matching Algorithm",
        "date": "2025-03-25",
        "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "description": "We've launched our latest AI-powered career matching algorithm that provides even more accurate recommendations. This advanced system analyzes your skills, inte"
    },
    {
        "slug": "student-success-stories",
        "title": "Student Success Stories: Meet Our Graduates",
        "date": "2025-03-20",
        "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "description": "Discover how Xtara has helped students find their perfect career paths. From engineering to healthcare, our platform has guided thousands of students toward ful"
    },
    {
        "slug": "career-workshop",
        "title": "Career Workshop Series Announced",
        "date": "2025-03-15",
        "image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "description": "We're excited to announce our new career workshop series starting next month. These hands-on sessions will cover everything from resume writing to interview pre"
    },
    {
        "slug": "events",
        "title": "Upcoming Career Events",
        "date": "2025-03-10",
        "description": "Join us for a series of webinars and workshops designed to help you make informed career choices."
    },
    {
        "slug": "update",
        "title": "New Features Added to Xtara",
        "date": "2025-02-15",
        "image": "https://images.unsplash.com/photo-1751175092226-8e69d27ac1c7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "description": "We've rolled out new features including detailed college matching and a redesigned dashboard. These improvements make it easier to explore your options and plan"
    },
    {
        "slug": "launch",
        "title": "Xtara Launches Career Guidance Platform",
        "date": "2025-01-01",
        "image": "https://images.unsplash.com/photo-1751175092226-8e69d27ac1c7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "description": "Welcome to the official launch of Xtara, your new companion for finding the perfect career path. Our platform uses advanced assessments and personalized recomme"
    }
];

export const newsContent: Record<string, string> = {
    "ai-career-algorithm": "We've launched our latest AI-powered career matching algorithm that provides even more accurate recommendations. This advanced system analyzes your skills, interests, and personality traits to suggest careers that truly fit your unique profile.\n\nThe new algorithm considers market trends, salary data, and job satisfaction metrics to give you the most comprehensive career guidance available.",
    "career-workshop": "We're excited to announce our new career workshop series starting next month. These hands-on sessions will cover everything from resume writing to interview preparation, giving you the skills you need to succeed in today's competitive job market.\n\nEach workshop will be led by industry professionals and include practical exercises to help you build confidence and develop your career toolkit.",
    "events": "Join us for a series of webinars and workshops designed to help you make informed career choices.\nOur experts will cover resume building, interview tips, and more throughout the spring.",
    "launch": "Welcome to the official launch of Xtara, your new companion for finding the perfect career path. Our platform uses advanced assessments and personalized recommendations to guide students and professionals toward fulfilling careers.\n\nStay tuned for updates and success stories as we grow!",
    "student-success-stories": "Discover how Xtara has helped students find their perfect career paths. From engineering to healthcare, our platform has guided thousands of students toward fulfilling careers that match their skills and passions.\n\nRead inspiring stories from recent graduates who used our assessment tools and career guidance to make informed decisions about their future.",
    "update": "We've rolled out new features including detailed college matching and a redesigned dashboard. These improvements make it easier to explore your options and plan your future.\n\nTry them out today and let us know what you think!"
};

export const getAllNews = (): INewsMeta[] => {
    return newsData;
};

export const getNewsBySlug = (slug: string): INewsArticle => {
    const article = newsData.find(item => item.slug === slug);
    if (!article) {
        throw new Error(`News article with slug "${slug}" not found`);
    }
    
    return {
        ...article,
        content: newsContent[slug] || ""
    };
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
