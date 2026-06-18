"use client";

import { useState, useEffect } from "react";
import { getCareerTools } from "@/lib/firebase/career-helpers";
import type {
    CareerPath,
    CourseItem,
    ToolItem,
    TrainingItem,
    ScholarshipItem,
    ToolRecord,
} from "@/types/career";
import ResourceList, { ResourceItem } from "@/components/careers/ResourceList";
import ToolsGrid from "@/components/careers/ToolsGrid";
import ResourceDetailModal from "@/components/careers/ResourceDetailModal";
import { GraduationCap, Video, Wrench, Search } from "lucide-react";

interface LearnSectionProps {
    careerPath: CareerPath;
    id: string;
}

// --- Typed accessors ---

function getSafeCourseItems(cp: CareerPath): CourseItem[] {
    return cp.primaryCareer?.courses
        ?? cp.recommendedCourses
        ?? cp.courses
        ?? [];
}

function getSafeToolItems(cp: CareerPath): ToolItem[] {
    return cp.toolsAndSoftware ?? [];
}

function getSafeTrainingItems(cp: CareerPath): TrainingItem[] {
    return cp.onlineTrainings ?? [];
}

function getSafeScholarshipItems(cp: CareerPath): ScholarshipItem[] {
    return cp.scholarships ?? [];
}

function getSafeCoursesForStream(course: CourseItem): string[] {
    const streams = course.stream;
    if (streams && Array.isArray(streams) && streams.length > 0) {
        return streams.map(
            s => s.name ?? s.display_course_name ?? s.course_name ?? "Course"
        );
    }
    return [];
}

export default function LearnSection({ careerPath }: LearnSectionProps) {
    const [tools, setTools] = useState<ToolItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleItemClick = (item: ResourceItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchTools = async () => {
            const cluster = careerPath.primaryCareer?.careerCluster || careerPath.careerCluster;
            if (cluster) {
                const fetchedTools = await getCareerTools(cluster);
                setTools(fetchedTools);
            }
        };
        fetchTools();
    }, [careerPath]);

    // Data Transformation Helpers
    const parseCourseName = (courseName: string) => {
        if (!courseName) return { title: 'Course', specialization: '' };

        let formatted = courseName.replace(/\[.*?\]/g, '').trim();
        let specialization = '';

        const parenMatch = formatted.match(/\(([^)]+)\)/);
        if (parenMatch) {
            specialization = parenMatch[1];
            formatted = formatted.replace(/\([^)]+\)/, '').trim();
        }

        formatted = formatted.replace(/\s+/g, ' ').trim();

        const title = formatted.split(' ').map(word => {
            if (!word) return word;
            return word[0].toUpperCase() + word.substring(1).toLowerCase();
        }).join(' ');

        return { title, specialization };
    };

    const getCoursesList = (): ResourceItem[] => {
        const rawCourses = getSafeCourseItems(careerPath);
        const expandedCourses: ResourceItem[] = [];

        for (const course of rawCourses) {
            const streamNames = getSafeCoursesForStream(course);

            if (streamNames.length > 0) {
                for (const streamName of streamNames) {
                    const { title: cleanTitle, specialization } = parseCourseName(streamName);

                    let finalSpecialization: string | undefined = streamName;
                    if (!finalSpecialization && specialization) {
                        finalSpecialization = specialization;
                    }

                    const level = course.course_type || course.degree_type || course.level || course.type || 'Degree';
                    const duration = course.duration_year || course.durationYear
                        ? `${course.duration_year || course.durationYear} years`
                        : course.duration || 'N/A';

                    const subtitleParts: string[] = [];
                    if (level) subtitleParts.push(level);
                    if (finalSpecialization && !cleanTitle.toLowerCase().includes((finalSpecialization).toLowerCase())) {
                        subtitleParts.push(finalSpecialization);
                    }
                    subtitleParts.push(duration);

                    expandedCourses.push({
                        id: `course-stream-${streamName || 'unknown'}`,
                        title: cleanTitle,
                        subtitle: subtitleParts.join(' • '),
                        description: course.description || course.details || `Degree Type: ${course.degree_type || 'Standard'}`,
                        tag: course.examMode || "On-Campus",
                        icon: <GraduationCap size={20} />,
                        type: 'course',
                        originalData: {
                            ...course,
                            streamNameForSearch: streamName,
                            selectedStream: { name: streamName }
                        }
                    });
                }
            } else {
                const level = course.course_type || course.degree_type || course.level || course.type || 'Degree';
                const duration = course.duration_year || course.durationYear
                    ? `${course.duration_year || course.durationYear} years`
                    : course.duration || 'N/A';

                const courseNameRaw = course.course || course.name || course.title || "Course Name";
                const { title, specialization } = parseCourseName(courseNameRaw);

                const subtitleParts: string[] = [];
                if (level) subtitleParts.push(level);
                if (specialization) subtitleParts.push(specialization);
                subtitleParts.push(duration);

                expandedCourses.push({
                    id: `course-${Math.random()}`,
                    title,
                    subtitle: subtitleParts.join(' • '),
                    description: course.description || course.details || `Degree Type: ${course.degree_type || 'Standard'}`,
                    tag: course.examMode || "On-Campus",
                    icon: <GraduationCap size={20} />,
                    type: 'course',
                    originalData: course
                });
            }
        }

        return expandedCourses;
    };

    const getTools = () => {
        const safeTools = getSafeToolItems(careerPath);
        const mergedTools = [...tools, ...safeTools];

        return mergedTools.map((t: ToolItem, idx: number) => ({
            id: t.id || `tool-${idx}`,
            title: t.name || t.toolName,
            description: t.description,
            tag: "Tool",
            icon: <Wrench size={20} />
        }));
    };

    const getScholarships = () => {
        const scholarships = getSafeScholarshipItems(careerPath);
        return scholarships.map((s, idx) => ({
            id: `scholarship-${idx}`,
            title: s.name,
            subtitle: `${s.type} • ${s.level}`,
            description: s.note,
            tag: s.country || "Scholarship",
            icon: <Search size={20} />,
            link: s.link,
            originalData: s,
            type: 'scholarship'
        }));
    };

    const getTrainings = () => {
        const trainings = getSafeTrainingItems(careerPath);
        return trainings.map((t, idx) => ({
            id: `training-${idx}`,
            title: t.title || t.name,
            subtitle: t.provider,
            description: t.description,
            tag: t.platform || "Online",
            link: t.link,
            icon: <Video size={20} />,
            type: 'training'
        }));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Recommended Courses</h3>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">{getCoursesList().length} Available</span>
                </div>
                <ResourceList
                    items={getCoursesList()}
                    emptyMessage="No courses listed."
                    onItemClick={handleItemClick}
                />
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Scholarships</h3>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">{getScholarships().length} Available</span>
                </div>
                <ResourceList
                    items={getScholarships()}
                    emptyMessage="No scholarships listed."
                    onItemClick={handleItemClick}
                />
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Tools & Software</h3>
                </div>
                <ToolsGrid
                    items={getTools()}
                    emptyMessage="No specific tools listed."
                    onItemClick={handleItemClick}
                    initialDisplay={6}
                />
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Online Training</h3>
                </div>
                <ResourceList items={getTrainings()} emptyMessage="No online trainings listed." onItemClick={handleItemClick} />
            </div>

            <ResourceDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={selectedItem}
            />
        </div>
    );
}
