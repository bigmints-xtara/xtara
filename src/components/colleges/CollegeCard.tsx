import Link from "next/link";

export interface College {
    objectID: string;
    name: string;
    basic_info: {
        name: string;
        short_form?: string;
        state: string;
        city: string;
        type_of_college: string;
        logo?: string;
        website?: string;
        phone_no?: string | string[];
        address?: string | { address: string };
    };
    // Add other fields as needed
}

interface CollegeCardProps {
    college: College;
}

export default function CollegeCard({ college }: CollegeCardProps) {
    const { name, short_form, city, state, type_of_college } = college.basic_info;
    const displayName = short_form || name;

    return (
        <Link href={`/colleges/${college.objectID}`} className="block">
            <div className="bg-[#1A2342] hover:bg-[#232D53] transition-colors rounded-lg overflow-hidden  p-4 border border-gray-700/50">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{displayName}</h3>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-1">{name}</p>
                        <div className="flex items-center text-sm text-gray-400 space-x-2">
                            <span className="bg-[#2A3455] px-2 py-0.5 rounded text-xs text-blue-300 border border-blue-500/30">
                                {type_of_college}
                            </span>
                            <span>•</span>
                            <span>{city}, {state}</span>
                        </div>
                    </div>
                    {/* Logo placeholder if available */}
                    {/* <div className="w-12 h-12 bg-gray-600 rounded-full flex-shrink-0"></div> */}
                </div>
            </div>
        </Link>
    );
}
