"use client";

import { CareerPath, CareerPathwayStep, RelatedCareer } from "@/types/career";

interface CareerPathPreviewProps {
    careerPath: CareerPath;
}

export default function CareerPathPreview({ careerPath }: CareerPathPreviewProps) {
    return (
        <div className="space-y-6">
            {/* Header Section */}
            {(careerPath.whatYouDo || careerPath.whyItMatters) && (
                <div className="mb-6">
                    <p className="text-lg text-gray-700 mb-4">
                        Based on the analysis we did, here's a summary of our recommended career path for you.
                    </p>
                </div>
            )}

            {/* Career Title Card */}
            <div className="bg-[#12192E] text-white rounded-2xl p-6 ">
                <div className="mb-4">
                    <p className="text-base opacity-90">You could become a</p>
                    <h2 className="text-3xl font-bold mt-2">{careerPath.title || careerPath.careerName}</h2>
                </div>
                {careerPath.whatYouDo && (
                    <p className="text-base opacity-90 leading-relaxed">
                        {careerPath.whatYouDo}
                    </p>
                )}
            </div>

            {/* Career Pathway Section */}
            {careerPath.careerPathway && careerPath.careerPathway.length > 0 && (
                <div className="bg-white rounded-2xl p-6  border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <h3 className="text-2xl font-bold text-gray-900">Career Pathway</h3>
                    </div>
                    <div className="space-y-4">
                        {careerPath.careerPathway.map((step: CareerPathwayStep, index: number) => (
                            <div key={index} className="relative pl-8 pb-6 last:pb-0">
                                {/* Timeline line */}
                                {index < careerPath.careerPathway!.length - 1 && (
                                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-blue-200"></div>
                                )}
                                {/* Timeline dot */}
                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                    {index + 1}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg text-gray-900">{step.title}</h4>
                                    <p className="text-sm text-blue-600 font-medium mt-1">{step.duration}</p>
                                    {step.note && (
                                        <p className="text-sm text-gray-600 mt-2">{step.note}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Related Careers Section */}
            {careerPath.relatedCareers && careerPath.relatedCareers.length > 0 && (
                <div className="bg-white rounded-2xl p-6  border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <h3 className="text-2xl font-bold text-gray-900">Related Careers</h3>
                    </div>
                    <div className="space-y-4">
                        {careerPath.relatedCareers.map((career: RelatedCareer, index: number) => (
                            <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                                <h4 className="font-semibold text-lg text-gray-900">{career.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{career.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
