"use client";

import { MapPin, BookOpen, Sparkles } from "lucide-react";

interface PreviewStat {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
}

interface PreviewStatsCardProps {
    stats: PreviewStat[];
}

export default function PreviewStatsCard({ stats }: PreviewStatsCardProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="relative bg-white border border-gray-200 rounded-xl p-4 overflow-hidden group hover: transition-all"
                >
                    {/* Subtle blur effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent backdrop-blur-[2px] pointer-events-none" />

                    <div className="relative flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                {stat.label}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stat.value}
                            </p>
                        </div>
                    </div>

                    {/* Preview badge */}
                    <div className="absolute top-2 right-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">
                            Preview
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Helper function to create stats
export function createPreviewStats(
    collegesCount: number = 50,
    coursesCount: number = 200,
    resourcesCount: number = 500
): PreviewStat[] {
    return [
        {
            icon: <MapPin size={20} className="text-blue-600" />,
            label: "Colleges Nearby",
            value: `${collegesCount}+`,
            color: "bg-blue-50"
        },
        {
            icon: <BookOpen size={20} className="text-green-600" />,
            label: "Courses Available",
            value: `${coursesCount}+`,
            color: "bg-green-50"
        },
        {
            icon: <Sparkles size={20} className="text-purple-600" />,
            label: "Learning Resources",
            value: `${resourcesCount}+`,
            color: "bg-purple-50"
        }
    ];
}
