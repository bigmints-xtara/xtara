"use client";

import { useParams } from "next/navigation";
import { useCareerPathQuery } from "@/lib/query/useCareerPath";

import CareerHubLayout from "@/components/careers/CareerHubLayout";
import ResourceList from "@/components/careers/ResourceList";
import { ListOrdered } from "lucide-react";

export default function PathwayListPage() {
    const { id } = useParams();

    const { data: careerPath } = useCareerPathQuery(id as string);

    const getItems = () => {
        if (!careerPath) return [];
        const pathway = careerPath.careerPathway || [];

        return pathway.map((step: any, idx: number) => {
            const titleText = typeof step === 'string' ? step : (step.title || step.step || '');
            const descText = typeof step === 'string' ? "Follow this milestone to progress in your career." : (step.note || step.duration || "Follow this milestone to progress in your career.");
            return {
                id: `step-${idx}`,
                title: `Step ${idx + 1}: ${titleText}`,
                description: descText,
                tag: "Milestone",
                icon: <ListOrdered size={20} />
            };
        });
    };

    return (
        <CareerHubLayout
            title="Career Pathway"
            subtitle="Roadmap to Success"
            description="A clear, step-by-step path to achieving your career goals."
            icon={<ListOrdered size={32} />}
            colorClass="text-emerald-400"
            bgClass="bg-emerald-500/10"
        >
            <ResourceList items={getItems()} emptyMessage="No pathway steps listed." />
        </CareerHubLayout>
    );
}
