"use client";

import { useParams, useRouter } from "next/navigation";
import { TrendingUp, Briefcase, DollarSign, ListOrdered, FileSpreadsheet, ArrowRight } from "lucide-react";
import CareerHubLayout from "@/components/careers/CareerHubLayout";
import { useCareerPathQuery } from "@/lib/query/useCareerPath";


export default function GrowHubPage() {
    const { id } = useParams();
    const router = useRouter();

    const { data: careerPath } = useCareerPathQuery(id as string);

    const sections = [
        {
            title: "Career Pathway",
            description: "A step-by-step roadmap for your career progression.",
            icon: <ListOrdered size={24} />,
            path: "pathway",
            count: (careerPath?.careerPathway?.length || 0),
            color: "text-emerald-400",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Internships",
            description: "Gain practical experience with these roles.",
            icon: <Briefcase size={24} />,
            path: "internships",
            count: (careerPath?.internshipExamples?.length || careerPath?.ragOutput?.grow?.internshipRoles?.length || 0),
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            title: "Government Exams",
            description: "Opportunities in the public sector.",
            icon: <FileSpreadsheet size={24} />,
            path: "exams",
            count: (careerPath?.governmentExams?.length || 0),
            color: "text-orange-400",
            bg: "bg-orange-500/10"
        },
        {
            title: "Salary Insights",
            description: "Understand earning potential and growth.",
            icon: <DollarSign size={24} />,
            path: "salary",
            count: 1, // Usually just one salary block
            color: "text-green-400",
            bg: "bg-green-500/10"
        }
    ];

    return (
        <CareerHubLayout
            title="Grow"
            subtitle="Advance Your Career"
            description="Internships, career progression, and opportunities to excel."
            icon={<TrendingUp size={32} />}
            colorClass="text-emerald-400"
            bgClass="bg-emerald-500/10"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <div
                        key={section.path}
                        onClick={() => router.push(`/careers/${id}/grow/${section.path}`)}
                        className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all cursor-pointer group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${section.bg} ${section.color}`}>
                                {section.icon}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 bg-white/5 px-2 py-1 rounded">
                                {section.count} Items
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                            {section.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-6 min-h-[40px]">
                            {section.description}
                        </p>
                        <div className="flex items-center text-emerald-400 font-bold text-sm uppercase tracking-wide group-hover:translate-x-1 transition-transform">
                            Explore <ArrowRight size={16} className="ml-2" />
                        </div>
                    </div>
                ))}
            </div>
        </CareerHubLayout>
    );
}
