export type QuestionType =
    | 'text'
    | 'number'
    | 'singleSelect'
    | 'multiSelect'
    | 'slider'
    | 'group';

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    minSelect?: number;
    maxSelect?: number;
    pattern?: string;
    errorMessage?: string;
}

export interface QuestionOption {
    id: string;
    label: string;
    description?: string;
    value?: any;
    metadata?: Record<string, any>;
}

export interface Question {
    id: string;
    label: string;
    description?: string;
    fieldType: QuestionType; // mapped from 'fieldType' in JSON
    options?: QuestionOption[];
    validation?: ValidationRule;
    metadata?: Record<string, any>;
    showIf?: string;
    children?: Question[];
    skipOnRetake?: boolean;
}

export interface AssessmentAnswers {
    [key: string]: any;
}

export interface LocationData {
    state: string;
    district: string;
    city: string;
    locationPreference: string;
}
