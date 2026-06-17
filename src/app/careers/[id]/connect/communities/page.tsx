"use client";

import { useParams } from "next/navigation";

import CareerHubLayout from "@/components/careers/CareerHubLayout";
import ResourceList from "@/components/careers/ResourceList";
import { Users } from "lucide-react";
import { useCareerPathQuery } from "@/lib/query/useCareerPath";

export default function CommunitiesListPage() {
    const { id } = useParams();
    const { data: careerPath } = useCareerPathQuery(id as string);

    const getItems = () => {
        if (!careerPath) return [];
        const communities = careerPath.careerCommunities || (careerPath.connect && careerPath.connect.careerCommunities) || [];

        return communities.map((c: any, idx: number) => ({
            id: `community-${idx}`,
            title: c.name,
            subtitle: c.platform,
            description: c.description,
            tag: c.type || "Community",
            link: c.link,
            icon: <Users size={20} />
        }));
    };

    return (
        <CareerHubLayout
            title="Career Communities"
            subtitle="Professional Networks"
            description="Engage with peers and mentors in these active communities."
            icon={<Users size={32} />}
            colorClass="text-orange-400"
            bgClass="bg-orange-500/10"
        >
            <ResourceList items={getItems()} emptyMessage="No career communities listed yet." />
        </CareerHubLayout>
    );
}
