"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCareerPathById } from "@/lib/firebase/career-helpers";
import { CareerPath } from "@/types/career";
import CareerHubLayout from "@/components/careers/CareerHubLayout";
import ResourceList from "@/components/careers/ResourceList";
import { Search } from "lucide-react";

export default function ScholarshipsListPage() {
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
        const scholarships = careerPath.scholarships || (careerPath.learn && careerPath.learn.scholarships) || [];

        return scholarships.map((s: any, idx: number) => ({
            id: `scholarship-${idx}`,
            title: s.name,
            subtitle: s.provider,
            description: s.description,
            tag: s.amount ? `Avg: ${s.amount}` : "Financial Aid",
            link: s.link,
            icon: <Search size={20} />
        }));
    };

    return (
        <CareerHubLayout
            title="Scholarships"
            subtitle="Financial Support"
            description="Opportunities to fund your education and research."
            icon={<Search size={32} />}
            colorClass="text-yellow-400"
            bgClass="bg-yellow-500/10"
        >
            <ResourceList items={getItems()} emptyMessage="No scholarships listed for this career." />
        </CareerHubLayout>
    );
}
