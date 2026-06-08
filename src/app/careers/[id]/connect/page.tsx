"use client";

import { useParams, useRouter } from "next/navigation";
import { Users, Users2, ArrowRight } from "lucide-react";
import CareerHubLayout from "@/components/careers/CareerHubLayout";
import { useEffect, useState } from "react";
import { getCareerPathById, CareerPath } from "@/lib/firebase/career-helpers";

export default function ConnectHubPage() {
    const { id } = useParams();
    const router = useRouter();
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

    const sections = [
        {
            title: "Career Communities",
            description: "Join professional groups and forums to network with peers.",
            icon: <Users size={24} />,
            path: "communities",
            count: (careerPath?.connect?.careerCommunities?.length || careerPath?.careerCommunities?.length || 0),
            color: "text-orange-400",
            bg: "bg-orange-500/10"
        },
        {
            title: "Notable People",
            description: "Learn from the journeys of industry leaders and pioneers.",
            icon: <Users2 size={24} />,
            path: "people",
            count: (careerPath?.notablePeople?.length || careerPath?.ragOutput?.notablePeople?.length || 0),
            color: "text-purple-400",
            bg: "bg-purple-500/10"
        }
    ];

    return (
        <CareerHubLayout
            title="Connect"
            subtitle="Build Your Network"
            description="Join communities, find mentors, and connect with like-minded professionals."
            icon={<Users size={32} />}
            colorClass="text-orange-400"
            bgClass="bg-orange-500/10"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <div
                        key={section.path}
                        onClick={() => router.push(`/careers/${id}/connect/${section.path}`)}
                        className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-all cursor-pointer group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${section.bg} ${section.color}`}>
                                {section.icon}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 bg-white/5 px-2 py-1 rounded">
                                {section.count} Items
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                            {section.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-6 min-h-[40px]">
                            {section.description}
                        </p>
                        <div className="flex items-center text-orange-400 font-bold text-sm uppercase tracking-wide group-hover:translate-x-1 transition-transform">
                            Explore <ArrowRight size={16} className="ml-2" />
                        </div>
                    </div>
                ))}
            </div>
        </CareerHubLayout>
    );
}
