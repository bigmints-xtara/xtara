import { BookOpen, Award } from "lucide-react";

export default function FeaturedCoursesCard() {
    const courses = [
        { title: "Medical Entrance Prep", provider: "Vedantu", duration: "6 months" },
        { title: "NEET Coaching", provider: "Unacademy", duration: "1 year" },
        { title: "Biology Mastery", provider: "Khan Academy", duration: "3 months" },
    ];

    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6  border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
                <Award className="text-purple-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900">Featured Courses</h3>
            </div>
            <div className="space-y-3">
                {courses.map((course, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg hover: transition-shadow border border-gray-100">
                        <div className="flex items-start gap-2">
                            <BookOpen size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 text-sm line-clamp-1">{course.title}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{course.provider}</div>
                                <div className="text-xs text-blue-600 font-medium mt-1">{course.duration}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
