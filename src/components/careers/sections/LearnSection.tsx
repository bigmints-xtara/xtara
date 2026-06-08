"use client";

import { useState, useEffect } from "react";
import { CareerPath, getCareerTools } from "@/lib/firebase/career-helpers";
import ResourceList, { ResourceItem } from "@/components/careers/ResourceList";
import ToolsGrid from "@/components/careers/ToolsGrid";
import ResourceDetailModal from "@/components/careers/ResourceDetailModal";
import { GraduationCap, Video, Wrench, Search } from "lucide-react";

interface LearnSectionProps {
    careerPath: CareerPath;
    id: string; // Career ID
}

export default function LearnSection({ careerPath, id }: LearnSectionProps) {
    const [tools, setTools] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleItemClick = (item: ResourceItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchTools = async () => {
            console.log('🔧 [LearnSection] useEffect triggered');
            console.log('🔧 [LearnSection] careerPath:', careerPath);
            console.log('🔧 [LearnSection] primaryCareer:', careerPath.primaryCareer);

            // Get cluster from primaryCareer or fallback
            const cluster = careerPath.primaryCareer?.careerCluster || careerPath.careerCluster;
            console.log('🔧 [LearnSection] cluster:', cluster);

            if (cluster) {
                console.log('🔧 [LearnSection] Fetching tools for cluster:', cluster);
                const fetchedTools = await getCareerTools(cluster);
                console.log('🔧 [LearnSection] Fetched tools:', fetchedTools);
                setTools(fetchedTools);
            } else {
                console.warn('🔧 [LearnSection] No cluster found!');
            }
        };
        fetchTools();
    }, [careerPath]);

    // Data Transformation Helpers
    // Helper to format course name (replicates Flutter logic)
    // Helper to format course name (replicates Flutter logic)
    const parseCourseName = (courseName: string) => {
        if (!courseName) return { title: 'Course', specialization: '' };

        // Remove square brackets like [B.Sc], [BA], etc.
        let formatted = courseName.replace(/\[.*?\]/g, '').trim();
        let specialization = '';

        // Handle parentheses - extract the main subject
        const parenMatch = formatted.match(/\(([^)]+)\)/);
        if (parenMatch) {
            specialization = parenMatch[1];
            // Remove the parentheses part from title
            formatted = formatted.replace(/\([^)]+\)/, '').trim();
        }

        // Clean up any extra spaces
        formatted = formatted.replace(/\s+/g, ' ').trim();

        // Capitalize properly
        const title = formatted.split(' ').map(word => {
            if (!word) return word;
            return word[0].toUpperCase() + word.substring(1).toLowerCase();
        }).join(' ');

        return { title, specialization };
    };

    const getCourses = () => {
        const rawCourses =
            (careerPath.primaryCareer && careerPath.primaryCareer.courses) ||
            careerPath.courses ||
            careerPath.recommendedCourses ||
            (careerPath.learn && careerPath.learn.courses) ||
            (careerPath.ragOutput && careerPath.ragOutput.learn && careerPath.ragOutput.learn.courses) ||
            [];

        const expandedCourses: ResourceItem[] = [];

        rawCourses.forEach((c: any, idx: number) => {
            // Check if course has streams
            const streams = c.stream;

            if (streams && Array.isArray(streams) && streams.length > 0) {
                // Create a recommended course for each stream
                streams.forEach((stream: any, sIdx: number) => {
                    const streamName = stream.name || stream.display_course_name || stream.course_name;
                    const courseName = c.course || c.name || c.title || "Course";

                    const level = c.course_type || c.degree_type || c.level || c.type || 'Degree';
                    const duration = c.duration_year || c.durationYear ? `${c.duration_year || c.durationYear} years` : c.duration || 'N/A';

                    // Parse the course name to see if we can extract a clean title
                    const { title: cleanTitle, specialization } = parseCourseName(stream.display_course_name || courseName);

                    // Construct a clean display
                    // Title: "Bachelor of Arts"
                    // Subtitle: "Economics, Philosophy, Political Science • 3 years" or similar

                    // If streamName is available and distinct, prefer it for specialization
                    let finalSpecialization = streamName;
                    if (!finalSpecialization && specialization) {
                        finalSpecialization = specialization;
                    }

                    // Format specialization with bullets if comma separated for better readability? 
                    // Or keep commas. Let's keep commas but ensure it's distinct.

                    const subtitleParts = [];
                    if (level) {
                        subtitleParts.push(level);
                    }
                    if (finalSpecialization && !cleanTitle.toLowerCase().includes(finalSpecialization.toLowerCase())) {
                        subtitleParts.push(finalSpecialization);
                    }
                    subtitleParts.push(`${duration}`);

                    expandedCourses.push({
                        id: `course-${idx}-stream-${sIdx}`,
                        title: cleanTitle,
                        subtitle: subtitleParts.join(' • '),
                        description: c.description || c.details || `Degree Type: ${c.degree_type || 'Standard'}`,
                        tag: c.examMode || "On-Campus",
                        icon: <GraduationCap size={20} />,
                        type: 'course',
                        originalData: {
                            ...c,
                            streamNameForSearch: stream.name || stream.course_name,
                            selectedStream: stream
                        }
                    });
                });
            } else {
                // Standard course (no streams)
                const level = c.course_type || c.degree_type || c.level || c.type || 'Degree';
                const duration = c.duration_year || c.durationYear ? `${c.duration_year || c.durationYear} years` : c.duration || 'N/A';

                const courseNameRaw = c.course || c.name || c.title || "Course Name";
                const { title, specialization } = parseCourseName(courseNameRaw);

                const subtitleParts = [];
                if (level) {
                    subtitleParts.push(level);
                }
                if (specialization) {
                    subtitleParts.push(specialization);
                }
                subtitleParts.push(duration);

                expandedCourses.push({
                    id: `course-${idx}`,
                    title: title,
                    subtitle: subtitleParts.join(' • '),
                    description: c.description || c.details || `Degree Type: ${c.degree_type || 'Standard'}`,
                    tag: c.examMode || "On-Campus",
                    icon: <GraduationCap size={20} />,
                    type: 'course',
                    originalData: c
                });
            }
        });

        return expandedCourses;
    };

    const getTools = () => {
        // Combine fetched tools with any fallback data
        const mergedTools = [
            ...tools,
            ...(careerPath.toolsAndSoftware || []),
            ...((careerPath.ragOutput && careerPath.ragOutput.learn && careerPath.ragOutput.learn.toolsAndSoftware) || [])
        ];

        console.log('🔧 [getTools] State tools:', tools.length);
        console.log('🔧 [getTools] Merged tools:', mergedTools.length);

        // Dedup by id? For now just return all
        const result = mergedTools.map((t: any, idx: number) => ({
            id: t.id || `tool-${idx}`,
            title: t.name || t.toolName,
            description: t.description,
            tag: "Tool",
            icon: <Wrench size={20} />
        }));

        console.log('🔧 [getTools] Final result:', result.length, 'tools');
        return result;
    };

    const getScholarships = () => {
        const scholarships = careerPath.scholarships || (careerPath.learn && careerPath.learn.scholarships) || [];
        return scholarships.map((s: any, idx: number) => ({
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
        const trainings =
            careerPath.onlineTrainings ||
            (careerPath.ragOutput && careerPath.ragOutput.learn && careerPath.ragOutput.learn.onlineTrainings) ||
            [];
        return trainings.map((t: any, idx: number) => ({
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
            {/* Courses Card */}
            <div className="bg-white rounded-xl p-6  border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Recommended Courses</h3>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">{getCourses().length} Available</span>
                </div>
                <ResourceList
                    items={getCourses()}
                    emptyMessage="No courses listed."
                    onItemClick={handleItemClick}
                />
            </div>

            {/* Scholarships Card */}
            <div className="bg-white rounded-xl p-6  border border-gray-200">
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

            {/* Tools & Software Card */}
            <div className="bg-white rounded-xl p-6  border border-gray-200">
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

            {/* Online Training Card */}
            <div className="bg-white rounded-xl p-6  border border-gray-200">
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
