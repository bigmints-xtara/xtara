"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCareerPathById } from "@/lib/firebase/career-helpers";
import { CareerPath } from "@/types/career";
import CareerHubLayout from "@/components/careers/CareerHubLayout";
import ResourceList from "@/components/careers/ResourceList";
import { DollarSign } from "lucide-react";

export default function SalaryListPage() {
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
        if (!careerPath || !careerPath.salary) return [];

        return [{
            id: 'salary-1',
            title: "Estimated Salary Range",
            subtitle: "Annual Compensation",
            description: careerPath.salary,
            tag: "Income",
            icon: <DollarSign size={20} />
        }];
    };

    return (
        <CareerHubLayout
            title="Salary Insights"
            subtitle="Earning Potential"
            description="Understand the financial prospects of this career path."
            icon={<DollarSign size={32} />}
            colorClass="text-green-400"
            bgClass="bg-green-500/10"
        >
            <ResourceList items={getItems()} emptyMessage="No salary data available." />
        </CareerHubLayout>
    );
}
