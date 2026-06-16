"use client";

import { useParams } from "next/navigation";

import CareerHubLayout from "@/components/careers/CareerHubLayout";
import { useCareerPathQuery } from "@/lib/query/useCareerPath";
import ResourceList from "@/components/careers/ResourceList";
import { GraduationCap } from "lucide-react";

export default function CoursesListPage() {
    const { id } = useParams();

    const { data: careerPath } = useCareerPathQuery(id as string);

    const getItems = () => {
        if (!careerPath) return [];
        // Support both old and new structure or normalize it
        const courses = careerPath.courses || careerPath.recommendedCourses || [];

        return courses.map((c: any, idx: number) => {
            // Normalize data (some might be strings, some objects with different fields)
            const title = c.course || c.name || "Course Name";
            const level = c.level || c.type || "Degree";
            const duration = c.durationYear ? `${c.durationYear} years` : c.duration;

            return {
                id: `course-${idx}`,
                title: title,
                subtitle: `${level} • ${duration || 'Duration N/A'}`,
                description: c.description,
                tag: c.examMode || "On-Campus",
                icon: <GraduationCap size={20} />
            };
        });
    };

    return (
        <CareerHubLayout
            title="Recommended Courses"
            subtitle="Academic Pathways"
            description="University degrees and diploma courses to get you started."
            icon={<GraduationCap size={32} />}
            colorClass="text-blue-400"
            bgClass="bg-blue-500/10"
        >
            <ResourceList items={getItems()} emptyMessage="No recommended courses found for this career yet." />
        </CareerHubLayout>
    );
}
