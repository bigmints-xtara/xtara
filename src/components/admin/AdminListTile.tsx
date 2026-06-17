'use client';

import { MoreVertical } from 'lucide-react';
import { formatSnakeCaseToTitleCase } from '@/lib/utils';

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
        'in review': 'bg-blue-100 text-blue-800',
    };

    return (
        <div
            className={`w-full border-b transition-all relative group/tile ${
                isSelected
                    ? 'bg-blue-50 border-l-4 border-l-blue-600'
                    : 'hover:bg-gray-50 hover:border-l-4 hover:border-l-gray-300'
            }`}
        >
            <button
                type="button"
                aria-pressed={isSelected}
                onClick={onTap}
                className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            >
                <div className="flex items-start justify-between pr-8">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{formatSnakeCaseToTitleCase(title)}</h3>
                        {domain && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {formatSnakeCaseToTitleCase(domain)}
                            </span>
                        )}
                        <p className="text-sm text-gray-600 mt-1">{formatSnakeCaseToTitleCase(subtitle)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`px-2 py-1 text-xs rounded font-medium ${
                                statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            {status}
                        </span>
                    </div>
                </div>
            </button>

            <div className="absolute right-4 top-4 z-20">
                <div className="relative group">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500"
                    >
                        <MoreVertical size={18} />
                    </button>

                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border hidden group-hover:block shadow-lg">
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
    );
}
