export type QuestionType = 'text' | 'number' | 'singleSelect' | 'multiSelect' | 'slider' | 'group';

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

export interface QuestionModel {
  id: string;
  label: string;
  description?: string;
  type: QuestionType;
  options?: QuestionOption[];
  validation: ValidationRule;
  metadata?: Record<string, any>;
  showIf?: string;
  children?: QuestionModel[];
  skipOnRetake?: boolean;
}
