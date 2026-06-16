"use client";

import { useParams } from "next/navigation";
import { useCareerPathQuery } from "@/lib/query/useCareerPath";

import CareerHubLayout from "@/components/careers/CareerHubLayout";
import ResourceList from "@/components/careers/ResourceList";
import { Wrench } from "lucide-react";

export default function ToolsListPage() {
    const { id } = useParams();

    const { data: careerPath } = useCareerPathQuery(id as string);

    const getItems = () => {
        if (!careerPath) return [];
        const tools = careerPath.toolsAndSoftware || [];

        return tools.map((t: any, idx: number) => ({
            id: `tool-${idx}`,
            title: t.name,
            description: t.description,
            tag: "Tool",
            icon: <Wrench size={20} />
        }));
    };

    return (
        <CareerHubLayout
            title="Tools & Software"
            subtitle="Industry Standards"
            description="The key software and physical tools professionals use daily."
            icon={<Wrench size={32} />}
            colorClass="text-emerald-400"
            bgClass="bg-emerald-500/10"
        >
            <ResourceList items={getItems()} emptyMessage="No specific tools listed for this career." />
        </CareerHubLayout>
    );
}
