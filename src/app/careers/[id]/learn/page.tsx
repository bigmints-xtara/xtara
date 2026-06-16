"use client";

import { useParams, useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Video, Wrench, Search, ArrowRight } from "lucide-react";
import CareerHubLayout from "@/components/careers/CareerHubLayout";
import { useCareerPathQuery } from "@/lib/query/useCareerPath";


export default function LearnHubPage() {
    const { id } = useParams();
    const router = useRouter();

    const { data: careerPath } = useCareerPathQuery(id as string);

    const sections = [
        {
            title: "Recommended Courses",
            description: "Curated academic and professional courses to build your foundation.",
            icon: <GraduationCap size={24} />,
            path: "courses",
            count: (careerPath?.courses?.length || careerPath?.recommendedCourses?.length || 0),
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            title: "Tools & Software",
            description: "Industry-standard tools you need to master.",
            icon: <Wrench size={24} />,
            path: "tools",
            count: (careerPath?.toolsAndSoftware?.length || 0),
            color: "text-emerald-400",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Online Training",
            description: "Flexible online certifications and skill-building modules.",
            icon: <Video size={24} />,
            path: "trainings",
            count: (careerPath?.onlineTrainings?.length || 0),
            color: "text-purple-400",
            bg: "bg-purple-500/10"
        },
        {
            title: "Scholarships",
            description: "Financial aid opportunities for your studies.",
            icon: <Search size={24} />,
            path: "scholarships",
            count: (careerPath?.scholarships?.length || 0),
            color: "text-yellow-400",
            bg: "bg-yellow-500/10"
        }
    ];

    return (
        <CareerHubLayout
            title="Learn"
            subtitle="Build Your Foundation"
            description="Essential courses, tools, and skills to master this career path."
            icon={<BookOpen size={32} />}
            colorClass="text-blue-400"
            bgClass="bg-blue-500/10"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <div
                        key={section.path}
                        onClick={() => router.push(`/careers/${id}/learn/${section.path}`)}
                        className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all cursor-pointer group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${section.bg} ${section.color}`}>
                                {section.icon}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 bg-white/5 px-2 py-1 rounded">
                                {section.count} Items
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                            {section.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-6 min-h-[40px]">
                            {section.description}
                        </p>
                        <div className="flex items-center text-blue-400 font-bold text-sm uppercase tracking-wide group-hover:translate-x-1 transition-transform">
                            Explore <ArrowRight size={16} className="ml-2" />
                        </div>
                    </div>
                ))}
            </div>
        </CareerHubLayout>
    );
}
