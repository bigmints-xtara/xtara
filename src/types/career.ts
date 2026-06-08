export type VisualizationType = 'list' | 'timeline' | 'carousel' | 'bento' | 'intro';

export type SlideType =
    | 'meetDreamCareer'
    | 'whyItMatters'
    | 'whyCareerFits'
    | 'careerPath'
    | 'realWorldExperience'
    | 'startLearning'
    | 'xtaraHelps'
    | 'futureToolkit';

export interface SlideContent {
    title: string;
    subtitle: string;
    icon: string;
    titlesOnly?: boolean;
}

export interface CareerSlideData {
    type: SlideType;
    title: string;
    subtitle: string;
    buttonLabel: string;
    visualization: VisualizationType;
    slideIcon: string;
    content: SlideContent[];
}

export interface SlideshowData {
    slides: CareerSlideData[];
}

// Additional types for career path details
export interface CareerPathwayStep {
    title: string;
    duration: string;
    note?: string;
}

export interface RelatedCareer {
    title: string;
    reason: string;
}

export interface ROIInsight {
    investmentLevel: string;
    expectedSalaryRange: string;
    paybackPeriod: string;
    verdict: string;
}


export interface CareerPath {
    id: string;
    userId: string;
    careerName: string; // Document field is likely 'title' or 'careerName'. Flutter maps from 'title' usually but let's check. 
    // Flutter code uses 'careerName' or 'title' implicitly via mapping logic. 
    // Wait, `SlideshowData.fromCareerPath` uses specific keys like `whatYouDo`, `matchScore`.
    // Let's add all the raw fields we expect from Firestore.
    title?: string;
    whatYouDo?: string;
    whyItMatters?: string;
    matchScore?: number | double;
    streamSuggestions?: string[];
    expectedSalaryRange?: string;
    matchReasoning?: string;
    archetypes?: string[];
    careerPathway?: CareerPathwayStep[];
    internshipExamples?: any[];
    onlineTrainings?: any[];
    topInstitutions?: any[];
    relatedCareers?: RelatedCareer[];
    toolsAndSoftware?: any[];
    strengths?: string[];
    description?: string;
    createdAt: any;
}

type double = number;
