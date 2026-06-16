"use client";

import { useParams } from "next/navigation";
import CareerHubLayout from "@/components/careers/CareerHubLayout";
import { useCareerPathQuery } from "@/lib/query/useCareerPath";
import ResourceList from "@/components/careers/ResourceList";
import { Search } from "lucide-react";

export default function ScholarshipsListPage() {
    const { id } = useParams();

    const { data: careerPath } = useCareerPathQuery(id as string);

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
