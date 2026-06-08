import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";

interface CareerSummaryProps {
    careerData: any;
}

export default function CareerSummary({ careerData }: CareerSummaryProps) {
    if (!careerData) return null;

    const { title, whatYouDo, careerPathway } = careerData;

    return (
        <div className="mb-8">
            <div className="mb-6 px-2">
                <p className="text-indigo-200 text-sm font-medium mb-1">Based on your analysis</p>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                    You could become a <span className="text-blue-400">{title}</span>
                </h2>
            </div>

            <div className="bg-[#1A2342] border border-white/10 rounded-2xl overflow-hidden ">
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">🌟</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">What will you do?</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {whatYouDo || "Help make a difference in this field using your unique skills and talents."}
                            </p>
                        </div>
                    </div>

                    {careerPathway && careerPathway.length > 0 && (
                        <div className="border-t border-white/10 pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Route size={18} className="text-blue-400" />
                                <h3 className="font-bold text-white">Career Pathway</h3>
                            </div>
                            <div className="space-y-4">
                                {careerPathway.slice(0, 3).map((step: any, index: number) => (
                                    <div key={index} className="flex gap-4 relative">
                                        {/* Vertical Line */}
                                        {index !== Math.min(careerPathway.length, 3) - 1 && (
                                            <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] bg-white/10" />
                                        )}

                                        <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center flex-shrink-0 text-xs text-blue-300 font-bold z-10 mt-1">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium text-sm">{step.title}</h4>
                                            <p className="text-gray-400 text-xs mt-0.5">{step.duration}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Link
                    href={`/assessment/results/${careerData.id}`}
                    className="block w-full py-4 bg-white/5 hover:bg-white/10 text-center text-blue-300 font-semibold text-sm transition-colors border-t border-white/5"
                >
                    View Full Career Details <ArrowRight size={16} className="inline ml-1" />
                </Link>
            </div>
        </div>
    );
}
