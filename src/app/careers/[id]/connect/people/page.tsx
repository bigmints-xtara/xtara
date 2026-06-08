"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCareerPathById, CareerPath } from "@/lib/firebase/career-helpers";
import CareerHubLayout from "@/components/careers/CareerHubLayout";
import ResourceList from "@/components/careers/ResourceList";
import { Users2 } from "lucide-react";

export default function PeopleListPage() {
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
        const people = careerPath.notablePeople || (careerPath.ragOutput && careerPath.ragOutput.notablePeople) || [];

        return people.map((p: any, idx: number) => ({
            id: `person-${idx}`,
            title: p.name,
            subtitle: p.role || "Industry Leader",
            description: p.bio || p.description,
            tag: "Influence",
            icon: <Users2 size={20} />
        }));
    };

    return (
        <CareerHubLayout
            title="Notable People"
            subtitle="Industry Leaders"
            description="Inspirational figures who have shaped this field."
            icon={<Users2 size={32} />}
            colorClass="text-purple-400"
            bgClass="bg-purple-500/10"
        >
            <ResourceList items={getItems()} emptyMessage="No notable people listed yet." />
        </CareerHubLayout>
    );
}
