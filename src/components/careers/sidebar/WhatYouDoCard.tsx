import { Briefcase } from "lucide-react";
import { CareerPath } from "@/types/career";

interface WhatYouDoCardProps {
    careerPath: CareerPath;
}

export default function WhatYouDoCard({ careerPath }: WhatYouDoCardProps) {
    if (!careerPath.whatYouDo) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl p-6  border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Briefcase className="text-blue-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">What You Will Do</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
                {careerPath.whatYouDo}
            </p>
        </div>
    );
}
