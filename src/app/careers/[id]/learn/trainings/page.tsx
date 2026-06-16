"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCareerPathById } from "@/lib/firebase/career-helpers";
import { CareerPath } from "@/types/career";
import CareerHubLayout from "@/components/careers/CareerHubLayout";
import ResourceList from "@/components/careers/ResourceList";
import { Video } from "lucide-react";

export default function TrainingsListPage() {
    const { id } = useParams();
    const [careerPath, setCareerPath] = useState<CareerPath | null>(null);

    useEffect(() => {
        const fetchPath = async () => {
            if (id) {
                const path = await getCareerPathById(id as string);
                setCareerPath(path);
            }
        };
        fetchPath();
    }, [id]);

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
