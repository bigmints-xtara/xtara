"use client";

import { useState } from "react";
import { CareerPath } from "@/types/career";
import ResourceList, { ResourceItem } from "@/components/careers/ResourceList";
import ResourceDetailModal from "@/components/careers/ResourceDetailModal";
import { Users, Star } from "lucide-react";

interface ConnectSectionProps {
    careerPath: CareerPath;
    id: string;
}

export default function ConnectSection({ careerPath, id }: ConnectSectionProps) {
    const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleItemClick = (item: ResourceItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const getCommunities = () => {
        const communities = careerPath.careerCommunities || (careerPath.connect && careerPath.connect.careerCommunities) || [];
        return communities.map((c: any, idx: number) => ({
            id: `community-${idx}`,
            title: c.name,
            subtitle: c.platform,
            description: c.description,
            tag: c.type || "Community",
            link: c.link,
            icon: <Users size={20} />
        }));
    };

    const getNotablePeople = () => {
        const people = careerPath.notablePeople || (careerPath.ragOutput && careerPath.ragOutput.notablePeople) || [];
        return people.map((p: any, idx: number) => ({
            id: `person-${idx}`,
            title: p.name,
            subtitle: p.role || "Industry Leader",
            description: p.bio || p.description,
            tag: "Influence",
            icon: <Star size={20} />
        }));
    };

    return (
        <div className="space-y-6">
            {/* Career Communities Card */}
            <div className="bg-white rounded-xl p-6  border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Career Communities</h3>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">{getCommunities().length} Available</span>
                </div>
                <ResourceList items={getCommunities()} emptyMessage="No communities listed." onItemClick={handleItemClick} />
            </div>

            {/* Notable People Card */}
            <div className="bg-white rounded-xl p-6  border border-gray-200">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Notable People</h3>
                </div>
                <ResourceList items={getNotablePeople()} emptyMessage="No notable people listed." onItemClick={handleItemClick} />
            </div>

            <ResourceDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={selectedItem}
            />
        </div>
    );
}
