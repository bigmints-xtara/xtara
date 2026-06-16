"use client";

import { useState } from "react";
import { CareerPath, CareerPathwayStep, InternshipExample, GovernmentExam } from "@/types/career";
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

    const getPathway = (): CareerPathwayStep[] => {
        // Get pathway data from multiple possible locations
        const pathwayData =
            careerPath.grow?.careerPathway ||
            careerPath.careerPathway ||
            careerPath.ragOutput?.grow?.careerPathway ||
            [];

        // If it's an array of strings, convert to objects
        if (Array.isArray(pathwayData) && pathwayData.length > 0 && typeof pathwayData[0] === 'string') {
            return (pathwayData as string[]).map((step: string) => ({
                step: step,
                title: step,
                duration: '',
                note: ''
            }));
        }

        return pathwayData as CareerPathwayStep[];
    };

    const getInternships = () => {
        const internships: InternshipExample[] = 
            careerPath.internshipExamples || 
            careerPath.ragOutput?.grow?.internshipRoles || 
            [];
            
        return internships.map((i, idx) => ({
            id: `internship-${idx}`,
            title: i.role || i.title || "Internship",
            subtitle: i.company || i.organization,
            description: i.description,
            link: i.link,
        }));
    };

    const getExams = () => {
        const exams: GovernmentExam[] = careerPath.governmentExams || [];
        return exams.map((e, idx) => ({
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
            careerPath.grow?.expectedSalaryRange ||
            careerPath.ragOutput?.grow?.expectedSalaryRange;

        if (!salaryData) return [];

        const salaryRange = typeof salaryData === 'string' ? salaryData : JSON.stringify(salaryData);
        const investmentLevel = careerPath.investmentLevel || careerPath.ragOutput?.grow?.investmentLevel;

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
