'use client';

import { MoreVertical } from 'lucide-react';

interface AdminListTileProps {
    title: string;
    subtitle: string;
    domain: string;
    status: string;
    isSelected: boolean;
    onTap: () => void;
    onAction: (action: string) => void;
}

export default function AdminListTile({
    title,
    subtitle,
    domain,
    status,
    isSelected,
    onTap,
    onAction,
}: AdminListTileProps) {
    const statusColors: Record<string, string> = {
        published: 'bg-green-100 text-green-800',
        draft: 'bg-orange-100 text-orange-800',
        inReview: 'bg-blue-100 text-blue-800',
    };

    return (
        <div
            onClick={onTap}
            className={`p-4 border-b cursor-pointer transition-all ${isSelected
                    ? 'bg-blue-50 border-l-4 border-l-blue-600'
                    : 'hover:bg-gray-50'
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
                    {domain && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {domain}
                        </span>
                    )}
                    <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                    <span
                        className={`px-2 py-1 text-xs rounded font-medium ${statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
                            }`}
                    >
                        {status}
                    </span>

                    <div className="relative group">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                        >
                            <MoreVertical size={18} />
                        </button>

                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg  border hidden group-hover:block z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction('edit');
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction('duplicate');
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                                Duplicate
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction(status === 'Published' ? 'unpublish' : 'publish');
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                                {status === 'Published' ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction('delete');
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
