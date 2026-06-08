import { TrendingUp } from "lucide-react";
import { CareerPath } from "@/lib/firebase/career-helpers";

interface RelatedCareersCardProps {
    careerPath: CareerPath;
}

export default function RelatedCareersCard({ careerPath }: RelatedCareersCardProps) {
    // For now, show placeholder related careers
    // In future, can fetch based on archetypes or career cluster
    const relatedCareers = [
        { title: "Surgeon", matchScore: 82 },
        { title: "Medical Researcher", matchScore: 78 },
        { title: "Pharmacist", matchScore: 75 },
    ];

    return (
        <div className="bg-white rounded-xl p-6  border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-green-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900">Related Careers</h3>
            </div>
            <div className="space-y-2">
                {relatedCareers.map((career, idx) => (
                    <a
                        key={idx}
                        href={`/careers`}
                        className="block p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-100 hover:border-blue-200"
                    >
                        <div className="flex items-center justify-between">
                            <div className="font-semibold text-gray-900 text-sm">{career.title}</div>
                            <div className="text-xs font-bold text-orange-600 px-2 py-1 bg-orange-50 rounded">
                                {career.matchScore}%
                            </div>
                        </div>
                    </a>
                ))}
                <a href="/careers" className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1 mt-3">
                    Explore all careers →
                </a>
            </div>
        </div>
    );
}
