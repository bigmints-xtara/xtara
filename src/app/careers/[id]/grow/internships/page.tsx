"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCareerPathById, CareerPath } from "@/lib/firebase/career-helpers";
import CareerHubLayout from "@/components/careers/CareerHubLayout";
import ResourceList from "@/components/careers/ResourceList";
import { Briefcase } from "lucide-react";

export default function InternshipsListPage() {
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
        const internships = careerPath.internshipExamples || (careerPath.ragOutput && careerPath.ragOutput.grow && careerPath.ragOutput.grow.internshipRoles) || [];

        return internships.map((i: any, idx: number) => ({
            id: `internship-${idx}`,
            title: i.role || i.title,
            subtitle: i.company || i.organization,
            description: i.description,
            tag: "Internship",
            link: i.link,
            icon: <Briefcase size={20} />
        }));
    };

    return (
        <CareerHubLayout
            title="Internship Opportunities"
            subtitle="Gain Experience"
            description="Practical roles to help you apply your knowledge."
            icon={<Briefcase size={32} />}
            colorClass="text-blue-400"
            bgClass="bg-blue-500/10"
        >
            <ResourceList items={getItems()} emptyMessage="No internships listed." />
        </CareerHubLayout>
    );
}
