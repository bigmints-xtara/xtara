"use client";

import { useParams } from "next/navigation";
import { useCareerPathQuery } from "@/lib/query/useCareerPath";

import CareerHubLayout from "@/components/careers/CareerHubLayout";
import ResourceList from "@/components/careers/ResourceList";
import { Video } from "lucide-react";

export default function TrainingsListPage() {
    const { id } = useParams();

    const { data: careerPath } = useCareerPathQuery(id as string);

    const getItems = () => {
        if (!careerPath) return [];
        const trainings = careerPath.onlineTrainings || [];

        return trainings.map((t: any, idx: number) => ({
            id: `training-${idx}`,
            title: t.title || t.name,
            subtitle: t.provider,
            description: t.description,
            tag: t.platform || "Online",
            link: t.link,
            icon: <Video size={20} />
        }));
    };

    return (
        <CareerHubLayout
            title="Online Training"
            subtitle="Certifications & Skills"
            description="Flexible learning options to enhance your skillset."
            icon={<Video size={32} />}
            colorClass="text-purple-400"
            bgClass="bg-purple-500/10"
        >
            <ResourceList items={getItems()} emptyMessage="No online trainings listed for this career." />
        </CareerHubLayout>
    );
}
