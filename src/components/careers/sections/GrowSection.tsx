"use client";

import { useState } from "react";
import { CareerPath } from "@/lib/firebase/career-helpers";
import ResourceList, { ResourceItem } from "@/components/careers/ResourceList";
import ResourceDetailModal from "@/components/careers/ResourceDetailModal";
import CareerPathwayTimeline from "@/components/careers/CareerPathwayTimeline";

interface GrowSectionProps {
    careerPath: CareerPath;
    id: string;
}

export default function GrowSection({ careerPath, id }: GrowSectionProps) {
    const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleItemClick = (item: ResourceItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const getPathway = (): any[] => {
        // Get pathway data from multiple possible locations
        const pathwayData =
            (careerPath.grow && careerPath.grow.careerPathway) ||
            careerPath.careerPathway ||
            (careerPath.ragOutput && careerPath.ragOutput.grow && careerPath.ragOutput.grow.careerPathway) ||
            [];

        // If it's already an array of objects, return directly
        if (Array.isArray(pathwayData) && pathwayData.length > 0 && typeof pathwayData[0] === 'object') {
            return pathwayData;
        }

        // If it's an array of strings, convert to objects
        if (Array.isArray(pathwayData) && typeof pathwayData[0] === 'string') {
            return pathwayData.map((step: string, idx: number) => ({
                step: step,
                title: step,
                duration: '',
                note: ''
            }));
        }

        return [];
    };

    const getInternships = () => {
        const internships = careerPath.internshipExamples || (careerPath.ragOutput && careerPath.ragOutput.grow && careerPath.ragOutput.grow.internshipRoles) || [];
        return internships.map((i: any, idx: number) => ({
            id: `internship-${idx}`,
            title: i.role || i.title,
            subtitle: i.company || i.organization,
            description: i.description,
            link: i.link,
        }));
    };

    const getExams = () => {
        const exams = careerPath.governmentExams || [];
        return exams.map((e: any, idx: number) => ({
            id: `exam-${idx}`,
            title: e.name,
            subtitle: e.examRequired ? "Required" : "Optional",
            description: e.details,
        }));
    };

    const getSalary = () => {
        // Try multiple locations for salary data
        let salaryData = careerPath.salary ||
            careerPath.expectedSalaryRange ||
            (careerPath.grow && careerPath.grow.expectedSalaryRange) ||
            (careerPath.ragOutput && careerPath.ragOutput.grow && careerPath.ragOutput.grow.expectedSalaryRange);

        if (!salaryData) return [];

        const salaryRange = typeof salaryData === 'string' ? salaryData : JSON.stringify(salaryData);
        const investmentLevel = careerPath.investmentLevel || (careerPath.ragOutput && careerPath.ragOutput.grow && careerPath.ragOutput.grow.investmentLevel);

        return [{
            id: 'salary',
            title: 'Expected Salary Range',
            subtitle: salaryRange,
            description: `Investment Level: ${investmentLevel || 'Medium'}`,
        }];
    };

    return (
        <div className="space-y-6">
            {/* Career Pathway Card */}
            <div className="bg-white rounded-xl p-6  border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Career Pathway</h3>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">{getPathway().length} Steps</span>
                </div>
                <CareerPathwayTimeline steps={getPathway()} />
            </div>

            {/* Internships Card */}
            <div className="bg-white rounded-xl p-6  border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Internship Opportunities</h3>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">{getInternships().length} Available</span>
                </div>
                <ResourceList items={getInternships()} emptyMessage="No internships listed." onItemClick={handleItemClick} />
            </div>

            {/* Government Exams Card */}
            <div className="bg-white rounded-xl p-6  border border-gray-200">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Government Exams</h3>
                </div>
                <ResourceList items={getExams()} emptyMessage="No government exams listed." onItemClick={handleItemClick} />
            </div>

            <ResourceDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={selectedItem}
            />
        </div>
    );
}
