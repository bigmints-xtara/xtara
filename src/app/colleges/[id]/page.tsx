"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CollegeInfo, CollegeService } from "@/lib/firebase/college-service";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
    ArrowLeft,
    MapPin,
    Globe,
    Phone,
    Info,
    Calendar,
    Building2,
    GraduationCap,
    ChevronRight,
    Loader2,
    BookOpen
} from "lucide-react";

export default function CollegeDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [college, setCollege] = useState<CollegeInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchCollege = async () => {
                const data = await CollegeService.getCollegeById(id as string);
                setCollege(data);
                setLoading(false);
            };
            fetchCollege();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                    <Loader2 className="animate-spin mb-4" size={48} />
                    <p className="text-lg font-medium">Loading college details...</p>
                </div>
            </div>
        );
    }

    if (!college) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 max-w-7xl py-20 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">College Not Found</h1>
                    <p className="text-gray-600 mb-8">We couldn't find the college you're looking for.</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section - Full Width Gradient */}
            <header className="bg-gradient-to-br from-[#1e2746] via-[#2a3a5f] to-[#1e2746] text-white py-12">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Back Link */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-400 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>

                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider">
                                {college.type || 'College'}
                            </span>
                            {college.shortName && (
                                <span className="px-3 py-1 bg-white/10 text-white/80 text-xs font-bold rounded-full uppercase tracking-wider">
                                    {college.shortName}
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl">
                            {college.name}
                        </h1>

                        <div className="flex flex-wrap gap-6 items-center text-gray-300">
                            <div className="flex items-center gap-2">
                                <MapPin size={20} className="text-blue-400" />
                                <span className="text-lg">{college.city}, {college.state}</span>
                            </div>
                            {college.university && (
                                <div className="flex items-center gap-2">
                                    <Building2 size={20} className="text-blue-400" />
                                    <span className="text-lg">Affiliated to {college.university}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 max-w-7xl py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Detailed Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-white rounded-2xl p-6  border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Info size={20} className="text-blue-600" />
                                Basic Information
                            </h2>
                            <div className="space-y-4">
                                <InfoRow icon={<Building2 size={18} />} label="Type" value={college.type} />
                                <InfoRow
                                    icon={<Globe size={18} />}
                                    label="Website"
                                    value={college.website}
                                    isLink
                                />
                                <InfoRow icon={<Phone size={18} />} label="Phone" value={college.phone} />
                                <InfoRow icon={<MapPin size={18} />} label="Address" value={college.address} />
                                <InfoRow icon={<Calendar size={18} />} label="Established" value={college.yearFounded} />
                                <InfoRow icon={<BookOpen size={18} />} label="Major Stream" value={college.majorStream} />
                            </div>
                        </section>

                        <section className="bg-blue-600 rounded-2xl p-6  text-white">
                            <h3 className="text-lg font-bold mb-2">Interested in this college?</h3>
                            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                                Get in touch with our career counselors to learn more about application deadlines and admission processes.
                            </p>
                            <button className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
                                Talk to Counselor
                            </button>
                        </section>
                    </div>

                    {/* Right Column - Courses */}
                    <div className="lg:col-span-2">
                        <section className="bg-white rounded-2xl p-8  border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <GraduationCap size={28} className="text-blue-600" />
                                    Available Courses
                                </h2>
                                <span className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg">
                                    {college.courses.length} {college.courses.length === 1 ? 'Course' : 'Courses'}
                                </span>
                            </div>

                            {college.courses.length > 0 ? (
                                <div className="space-y-4">
                                    {college.courses.map((course, idx) => (
                                        <div
                                            key={idx}
                                            className="p-6 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-blue-200 hover: transition-all group"
                                        >
                                            {/* Course Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                                                        {course.course}
                                                    </h3>
                                                    {course.level && (
                                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                                            {course.level}
                                                        </span>
                                                    )}
                                                </div>
                                                <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors mt-1" />
                                            </div>

                                            {/* Course Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                {course.duration && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar size={16} className="text-blue-500" />
                                                        <span className="text-sm font-medium">{course.duration}</span>
                                                    </div>
                                                )}
                                                {course.fees && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <span className="text-sm font-bold text-orange-600">
                                                            Fees: ₹{course.fees}
                                                        </span>
                                                    </div>
                                                )}
                                                {course.degreeType && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <BookOpen size={16} className="text-blue-500" />
                                                        <span className="text-sm font-medium">{course.degreeType}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Streams Section */}
                                            {course.streams && course.streams.length > 0 && (
                                                <div className="pt-4 border-t border-gray-200">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                                        Available Streams ({course.streams.length})
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {course.streams.map((stream: any, sIdx: number) => {
                                                            const streamName = stream.name || stream.display_course_name || stream.course_name;

                                                            return (
                                                                <div
                                                                    key={sIdx}
                                                                    className="flex items-center gap-2 text-sm text-gray-700"
                                                                >
                                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                                                                    <span>{streamName}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
                                    <p className="text-gray-500 text-lg font-medium mb-2">No Course Information Available</p>
                                    <p className="text-gray-400 text-sm">Detailed course information will be updated soon.</p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function InfoRow({ icon, label, value, isLink = false }: { icon: any, label: string, value?: string, isLink?: boolean }) {
    if (!value) return null;

    return (
        <div className="flex gap-3">
            <div className="mt-1 text-blue-500 flex-shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                {isLink ? (
                    <a
                        href={value.startsWith('http') ? value : `https://${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline break-all"
                    >
                        {value}
                    </a>
                ) : (
                    <p className="text-sm font-medium text-gray-800 leading-relaxed">{value}</p>
                )}
            </div>
        </div>
    );
}
