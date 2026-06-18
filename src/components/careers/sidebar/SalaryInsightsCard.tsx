import { DollarSign } from "lucide-react";
import { CareerPath } from "@/types/career";

interface SalaryInsightsCardProps {
    careerPath: CareerPath;
}

export default function SalaryInsightsCard({ careerPath }: SalaryInsightsCardProps) {
    // Try multiple locations for salary data
    const salaryData = careerPath.salary ||
        careerPath.expectedSalaryRange ||
        (careerPath.grow && careerPath.grow.expectedSalaryRange) ||
        (careerPath.ragOutput && careerPath.ragOutput.grow && careerPath.ragOutput.grow.expectedSalaryRange);

    const investmentLevel = careerPath.investmentLevel ||
        (careerPath.ragOutput && careerPath.ragOutput.grow && careerPath.ragOutput.grow.investmentLevel);

    if (!salaryData) {
        return null;
    }

    const salaryRange = typeof salaryData === 'string' ? salaryData : JSON.stringify(salaryData);

    return (
        <div className="bg-white rounded-xl p-6  border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="text-green-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Salary Insights</h3>
            </div>
            <div className="space-y-3">
                <div>
                    <p className="text-xs text-gray-500 mb-1">Expected Range</p>
                    <p className="text-sm font-semibold text-gray-900">{salaryRange}</p>
                </div>
                {investmentLevel && (
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Investment Level</p>
                        <p className="text-sm font-medium text-gray-700">{investmentLevel}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
