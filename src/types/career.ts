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

// --- Sub-interfaces for CareerPath ---

export interface CareerPathwayStep {
    id?: string;
    title: string;
    description: string;
    duration?: string;
    order?: number;
    [key: string]: unknown;
}

export interface CourseItem {
    course?: string;
    name?: string;
    title?: string;
    description?: string;
    details?: string;
    course_type?: string;
    degree_type?: string;
    level?: string;
    type?: string;
    duration_year?: number;
    durationYear?: number;
    duration?: string;
    degreeType?: string;
    stream?: Array<{
        name?: string;
        display_course_name?: string;
        course_name?: string;
    }>;
    [key: string]: unknown;
}

export interface TrainingItem {
    title?: string;
    name?: string;
    provider?: string;
    description?: string;
    platform?: string;
    link?: string;
    [key: string]: unknown;
}

export interface ScholarshipItem {
    name?: string;
    type?: string;
    level?: string;
    note?: string;
    country?: string;
    link?: string;
    [key: string]: unknown;
}

export interface ToolItem {
    id?: string;
    name?: string;
    toolName?: string;
    description?: string;
    clusters?: string | string[];
    isActive?: boolean;
    [key: string]: unknown;
}

export interface PrimaryCareer {
    courses?: CourseItem[];
    careerCluster?: string;
    [key: string]: unknown;
}

export interface RagOutput {
    learn?: {
        courses?: CourseItem[];
        toolsAndSoftware?: ToolItem[];
        onlineTrainings?: TrainingItem[];
        scholarships?: ScholarshipItem[];
        [key: string]: unknown;
    };
    connect?: Record<string, unknown>;
    grow?: Record<string, unknown>;
    [key: string]: unknown;
}

export interface RelatedCareer {
    id?: string;
    title?: string;
    reason?: string;
    [key: string]: unknown;
}

// --- Unified CareerPath Interface ---
// Merged from src/types/career.ts and src/lib/firebase/career-helpers.ts
export interface CareerPath {
    // Required fields
    id: string;

    // Core career info (merged from both definitions)
    userId?: string;
    assessmentId?: string;
    careerName?: string;
    title?: string;
    description?: string;
    whatYouDo?: string;
    whyItMatters?: string;

    // Match data
    matchScore?: number;
    matchReasoning?: string;
    archetypes?: string[];

    // Career details
    salary?: string;
    expectedSalaryRange?: string;
    education?: string;
    streamSuggestions?: string[];
    strengths?: string[];
    double?: boolean;

    // Skills
    technicalSkills?: string[];
    softSkills?: string[];

    // Learning resources - typed arrays (no more any[])
    courses?: CourseItem[];
    careerPathway?: CareerPathwayStep[];
    topInstitutions?: string[];
    onlineTrainings?: TrainingItem[];
    toolsAndSoftware?: ToolItem[];
    scholarships?: ScholarshipItem[];

    // Related / supplementary data
    relatedCareers?: RelatedCareer[];
    internshipExamples?: Record<string, unknown>[];
    governmentExams?: Record<string, unknown>[];
    quote?: string;
    dreamTitle?: string;
    notablePeople?: Record<string, unknown>[];
    careerCluster?: string;
    recommendedCourses?: CourseItem[];
    learn?: {
        courses?: CourseItem[];
        scholarships?: ScholarshipItem[];
        [key: string]: unknown;
    };
    primaryCareer?: PrimaryCareer;
    grow?: {
        careerPathway?: CareerPathwayStep[];
        expectedSalaryRange?: string;
        [key: string]: unknown;
    };
    ragOutput?: RagOutput;

    // Metadata
    createdAt?: string | number | Date;

    // Catch-all for Firestore flexibility
    [key: string]: unknown;
}
