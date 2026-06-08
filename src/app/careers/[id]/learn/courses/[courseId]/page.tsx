"use client";

import { useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import CareerHubLayout from "@/components/careers/CareerHubLayout";

export default function CourseDetailPage() {
    const searchParams = useSearchParams();
    const dataString = searchParams.get("data");
    const item = dataString ? JSON.parse(decodeURIComponent(dataString)) : null;

    if (!item) {
        return <div className="p-8 text-white">Course data not found.</div>;
    }

    return (
        <CareerHubLayout
            title={item.title}
            subtitle={item.subtitle}
            description={item.description || "Course Details"}
            icon={<BookOpen size={32} />}
            colorClass="text-blue-400"
            bgClass="bg-blue-500/10"
        >
            <div className="space-y-6">
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">Finding Colleges</h3>
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400">Searching for colleges offering this course...</p>
                        <p className="text-xs text-gray-500 mt-2">(College search integration coming soon)</p>
                    </div>
                </div>

                <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">Course Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="p-4 bg-white/5 rounded-xl">
                            <span className="block text-gray-400 mb-1">Duration</span>
                            <span className="text-white font-bold">{item.subtitle.split("•")[1]?.trim() || "N/A"}</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl">
                            <span className="block text-gray-400 mb-1">Level</span>
                            <span className="text-white font-bold">{item.subtitle.split("•")[0]?.trim() || "Degree"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </CareerHubLayout>
    );
}
