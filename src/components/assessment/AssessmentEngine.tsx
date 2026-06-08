"use client";

import { useState, useEffect } from "react";
import { Question, AssessmentAnswers } from "@/types/assessment";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface AssessmentEngineProps {
    questions: Question[];
    onComplete: (answers: AssessmentAnswers) => void;
    isRetake?: boolean;
}

export default function AssessmentEngine({ questions, onComplete, isRetake = false }: AssessmentEngineProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<AssessmentAnswers>({});
    const [visibleQuestions, setVisibleQuestions] = useState<Question[]>([]);

    // Filter visible questions (handle conditional logic)
    useEffect(() => {
        // Basic implementation of showIf logic
        // We assume showIf strings are simple enough (e.g. "currentGrade == 'grade12'")
        // We need to replace .contains with .includes for JS compatibility if needed

        // Flatten helper - since the logic is "Dynamic Assessment Engine", usually it shows one by one or groups.
        // Assuming simple linear flow for now, filtering out those that don't meet criteria.
        // However, dependencies might refer to *future* answers? No, usually previous.
        // We'll re-calculate the "active" list of questions whenever answers change.

        const evaluateShowIf = (condition: string, context: any) => {
            try {
                // Replace simple Python-like/Dart-like syntax with JS
                let jsCondition = condition
                    .replace(/ and /g, ' && ')
                    .replace(/ or /g, ' || ')
                    .replace(/.contains\(/g, '.includes('); // Very basic heuristic

                // Create a function with context keys as variables
                const keys = Object.keys(context);
                const values = Object.values(context);
                const func = new Function(...keys, `return ${jsCondition};`);
                return func(...values);
            } catch (e) {
                console.warn(`Failed to evaluate condition: ${condition}`, e);
                return true; // fail safe
            }
        };

        const filtered = questions.filter(q => {
            if (isRetake && q.skipOnRetake) return false;
            if (!q.showIf) return true;
            return evaluateShowIf(q.showIf, answers);
        });

        setVisibleQuestions(filtered);

        // Adjust current index if it went out of bounds after filtering
        // Actually, this is tricky. If we filter 'on the fly', the index '5' might mean a different question.
        // Better strategy: Keep original questions, skip them during navigation if condition not met.

    }, [questions, answers, isRetake]);


    const currentQuestion = visibleQuestions[currentIndex];

    const handleNext = () => {
        if (currentIndex < visibleQuestions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete(answers);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleAnswer = (val: any) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: val
        }));
    };

    if (!currentQuestion) return <div>Loading...</div>;

    const currentAnswer = answers[currentQuestion.id];
    const progress = ((currentIndex + 1) / visibleQuestions.length) * 100;

    return (
        <div className="max-w-2xl mx-auto px-4 pb-28">
            <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Step {currentIndex + 1} of {visibleQuestions.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="mt-2 h-2" />
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{currentQuestion.label}</h2>
                    {currentQuestion.description && (
                        <p className="text-sm text-gray-500 mt-2">{currentQuestion.description}</p>
                    )}
                </div>

                <QuestionInput
                    question={currentQuestion}
                    value={currentAnswer}
                    onChange={handleAnswer}
                />
            </div>

            <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white px-4 py-3">
                <div className="mx-auto max-w-2xl flex items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="shrink-0"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        type="button"
                        onClick={handleNext}
                        disabled={!isValid(currentQuestion, currentAnswer)}
                        className="ml-auto bg-primary text-white"
                        size="lg"
                    >
                        {currentIndex === visibleQuestions.length - 1 ? "Finish" : "Next"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function isValid(question: Question, answer: any): boolean {
    if (!question.validation?.required) return true;
    if (answer === undefined || answer === null || answer === '') return false;
    if (Array.isArray(answer) && answer.length === 0) return false;
    return true;
}

function QuestionInput({ question, value, onChange }: { question: Question, value: any, onChange: (val: any) => void }) {
    switch (question.fieldType) {
        case 'text':
            return (
                <Input
                    type="text"
                    placeholder="Type your answer here..."
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        case 'number':
            return (
                <Input
                    type="number"
                    placeholder="Enter a number..."
                    value={value || ''}
                    onChange={(e) => onChange(Number(e.target.value))}
                />
            );
        case 'singleSelect':
            return (
                <div className="space-y-3">
                    {question.options?.map(opt => {
                        const isSelected = value === opt.id;
                        return (
                            <button
                                type="button"
                                key={opt.id}
                                onClick={() => onChange(opt.id)}
                                className={`w-full rounded-lg border px-4 py-3 text-left transition ${isSelected ? 'border-sky-500 bg-sky-500/10 text-foreground' : 'border-gray-200 bg-white text-gray-700 hover:border-sky-500/50'}`}
                            >
                                <span className="font-medium">{opt.label}</span>
                                {isSelected && (
                                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
                                        <Check size={12} />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            );
        case 'multiSelect':
            return (
                <div className="space-y-3">
                    {question.options?.map(opt => {
                        const current = (value as string[]) || [];
                        const isSelected = current.includes(opt.id);
                        return (
                            <button
                                type="button"
                                key={opt.id}
                                onClick={() => {
                                    if (isSelected) {
                                        onChange(current.filter(id => id !== opt.id));
                                    } else {
                                        onChange([...current, opt.id]);
                                    }
                                }}
                                className={`w-full rounded-lg border px-4 py-3 text-left transition ${isSelected ? 'border-sky-500 bg-sky-500/10 text-foreground' : 'border-gray-200 bg-white text-gray-700 hover:border-sky-500/50'}`}
                            >
                                <span className="font-medium">{opt.label}</span>
                                <span className={`ml-2 inline-flex h-5 w-5 items-center justify-center rounded border ${isSelected ? 'bg-sky-500 border-sky-500 text-white' : 'border-gray-300 text-transparent'}`}>
                                    <Check size={12} />
                                </span>
                            </button>
                        );
                    })}
                </div>
            );
        case 'slider':
            // Basic slider implementation
            return (
                <div className="py-6">
                    <input
                        type="range"
                        min={question.validation?.minValue || 0}
                        max={question.validation?.maxValue || 100}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        value={value || 0}
                        onChange={(e) => onChange(Number(e.target.value))}
                    />
                    <div className="mt-3 text-center text-xl font-semibold text-foreground">{value || 0}</div>
                </div>
            );
        default:
            return <div className="text-red-400">Unsupported question type: {question.fieldType}</div>;
    }
}
