"use client";

interface CareerPathwayStep {
    step?: string;
    title?: string;
    location?: string;
    duration?: string;
    description?: string;
    note?: string;
}

interface CareerPathwayTimelineProps {
    steps: CareerPathwayStep[];
}

export default function CareerPathwayTimeline({ steps }: CareerPathwayTimelineProps) {
    if (steps.length === 0) {
        return (
            <div className="p-8 text-center border border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-500">No pathway steps listed.</p>
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                const title = step.step || step.title || `Step ${index + 1}`;
                const note = step.note || step.description || "";
                const duration = step.duration || step.location || "";

                return (
                    <div key={index} className="flex gap-0">
                        {/* Timeline column */}
                        <div className="flex flex-col items-center pt-6">
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            {!isLast && (
                                <div className="w-0.5 h-12 bg-gradient-to-b from-blue-600 to-gray-200 my-1"></div>
                            )}
                        </div>

                        {/* Content column */}
                        <div className="flex-1 pb-8 pl-4">
                            <div className="pt-5">
                                <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                                {note && (
                                    <p className="text-sm text-gray-600 mb-2">{note}</p>
                                )}
                                {duration && (
                                    <p className="text-xs font-medium text-blue-600">{duration}</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
