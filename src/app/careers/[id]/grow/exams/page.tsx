"use client";

import { useParams } from "next/navigation";
import { useCareerPathQuery } from "@/lib/query/useCareerPath";

import CareerHubLayout from "@/components/careers/CareerHubLayout";
import ResourceList from "@/components/careers/ResourceList";
import { FileSpreadsheet } from "lucide-react";

export default function ExamsListPage() {
    const { id } = useParams();

    const { data: careerPath } = useCareerPathQuery(id as string);

    const getItems = () => {
        if (!careerPath) return [];
        const exams = careerPath.governmentExams || [];

        return exams.map((e: any, idx: number) => ({
            id: `exam-${idx}`,
            title: e.name,
            subtitle: e.examRequired ? "Required" : "Optional",
            description: e.details,
            tag: "Govt Exam",
            icon: <FileSpreadsheet size={20} />
        }));
    };

    return (
        <CareerHubLayout
            title="Government Exams"
            subtitle="Public Sector Opportunities"
            description="Examinations required for government roles in this field."
            icon={<FileSpreadsheet size={32} />}
            colorClass="text-orange-400"
            bgClass="bg-orange-500/10"
        >
            <ResourceList items={getItems()} emptyMessage="No government exams listed." />
        </CareerHubLayout>
    );
}
