export interface IMenuItem {
    text: string;
    url: string;
}

export interface IBenefit {
    title: string;
    description: string;
    imageSrc: string;
    bullets: IBenefitBullet[]
}

export interface IBenefitBullet {
    title: string;
    description: string;
    icon: JSX.Element;
}

export interface IPricing {
    name: string;
    price: number | string;
    features: string[];
}

export interface IFAQ {
    question: string;
    answer: string;
}

export interface ITestimonial {
    name: string;
    role: string;
    message: string;
    avatar: string;
}

export interface IStats {
    title: string;
    icon: JSX.Element;
    description: string;
}

export interface ISocials {
    facebook?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
    threads?: string;
    twitter?: string;
    youtube?: string;
    x?: string;
    [key: string]: string | undefined;
}

export interface INewsMeta {
    slug: string;
    title: string;
    date: string;

    image?: string;
    description: string;

}

export interface INewsArticle extends INewsMeta {
    content: string;
}

// Content Models for xTara Platform
export interface IGoodRead {
    id: string;
    title: string;
    image: string;
    domain: string;
    published: boolean;
    draft: boolean;
    inReview: boolean;
    hyperlink?: string;
    hyperlinkText?: string;
    careerRelevance: string[];
    type: string;
    content: string;
    createdAt: string;
    publishedAt?: string;
    publishedUntil?: string;
    updatedAt: string;
}

export interface IStory {
    id: string;
    title: string;
    description: string;
    image: string;
    domain: string;
    published: boolean;
    draft: boolean;
    inReview: boolean;
    callToAction?: string;
    hyperlink?: string;
    hyperlinkText?: string;
    careerRelevance: string[];
    slides: IStorySlide[];
    createdAt: string;
    publishedAt?: string;
    publishedUntil?: string;
    updatedAt: string;
}

export interface IStorySlide {
    title: string;
    description: string;
    image?: string;
    hyperlink?: string;
    hyperlinkText?: string;
    date?: string;
}

export interface IChallenge {
    id: string;
    title: string;
    image: string;
    domain: string;
    published: boolean;
    draft: boolean;
    inReview: boolean;
    hyperlink?: string;
    hyperlinkText?: string;
    careerRelevance: string[];
    callToAction?: string;
    type: string;
    rewardPerQuestion: number;
    instructions: string;
    questions: IChallengeQuestion[];
    createdAt: string;
    publishedAt?: string;
    publishedUntil?: string;
    updatedAt: string;
}

export interface IChallengeQuestion {
    title: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}
