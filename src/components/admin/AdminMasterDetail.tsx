'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Filter, X } from 'lucide-react';
import type { AdminEntity, AdminConfig, EntityStatus } from '@/types/admin';
import { AdminService } from '@/lib/services/adminService';
import { formatSnakeCaseToTitleCase } from '@/lib/utils';
import AdminListTile from './AdminListTile';

interface AdminMasterDetailProps<T extends AdminEntity> {
    config: AdminConfig<T>;
    renderEditor: (
        entity: T | null,
        onSave: (data: Partial<T>) => Promise<void>,
        onCancel: () => void
    ) => React.ReactNode;
}

export default function AdminMasterDetail<T extends AdminEntity>({
    config,
    renderEditor,
}: AdminMasterDetailProps<T>) {
    const [entities, setEntities] = useState<T[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<EntityStatus>('all');
    const [domainFilter, setDomainFilter] = useState('all');

    const service = useMemo(() => new AdminService(config), [config]);

    // Load entities
    useEffect(() => {
        const unsubscribe = service.streamAll((loadedEntities) => {
            // Deduplicate by ID to prevent React Strict Mode double-mounting issues.
            // In dev, Strict Mode unmounts/remounts the component, which can cause
            // multiple onSnapshot listeners to fire concurrently, potentially producing
            // duplicate entries if the same snapshot is processed twice before React
            // reconciles state.
            const uniqueEntities = Object.values(
                loadedEntities.reduce((acc, entity) => {
                    acc[entity.id] = entity;
                    return acc;
                }, {} as Record<string, T>)
            ) as T[];
            setEntities(uniqueEntities);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [service]);

    // Filtered entities
    const filteredEntities = useMemo(() => {
        return entities.filter((entity) => {
            // Status filter
            if (statusFilter !== 'all' && config.getStatus(entity) !== statusFilter) {
                return false;
            }

            // Domain filter
            if (domainFilter !== 'all' && config.getDomain(entity) !== domainFilter) {
                return false;
            }

            // Search filter
            if (searchQuery && !config.getSearchText(entity).includes(searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }, [entities, statusFilter, domainFilter, searchQuery, config]);

    // Available domains
    const availableDomains = useMemo(
        () => config.getAvailableDomains(entities),
        [entities, config]
    );

    const handleCreate = () => {
        setSelectedEntity(null);
        setIsCreating(true);
    };

    const handleSelect = (entity: T) => {
        setSelectedEntity(entity);
        setIsCreating(false);
    };

    const handleSave = async (data: Partial<T>) => {
        try {
            if (isCreating) {
                await service.create(data);
            } else if (selectedEntity) {
                await service.update(selectedEntity.id, data);
            }
            setIsCreating(false);
        } catch (err) {
            console.error('Error saving entity:', err);
            throw err;
        }
    };

    const handleCancel = () => {
        setIsCreating(false);
        setSelectedEntity(null);
    };

    const handleAction = async (action: string, entity: T) => {
        try {
            switch (action) {
                case 'edit':
                    handleSelect(entity);
                    break;
                case 'duplicate':
                    if (confirm(`Duplicate "${config.getTitle(entity)}"?`)) {
                        await service.duplicate(entity.id);
                    }
                    break;
                case 'publish':
                    await service.publish(entity.id);
                    break;
                case 'unpublish':
                    await service.unpublish(entity.id);
                    break;
                case 'delete':
                    if (confirm(`Delete "${config.getTitle(entity)}"? This cannot be undone.`)) {
                        await service.delete(entity.id);
                        if (selectedEntity?.id === entity.id) {
                            setSelectedEntity(null);
                        }
                    }
                    break;
            }
        } catch (err) {
            console.error('Error performing action:', err);
            alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setDomainFilter('all');
    };

    const getStatusLabel = (status: EntityStatus) => {
        const labels: Record<EntityStatus, string> = {
            all: 'All Statuses',
            published: 'Published',
            draft: 'Draft',
            inReview: 'In Review',
            created: 'Created',
            updated: 'Updated',
            archived: 'Archived',
        };
        return labels[status];
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full">
            {/* Left Panel - List */}
            <div className="w-1/3 border-r flex flex-col">
                {/* Header */}
                <div className="p-4 border-b bg-white sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">{config.entityNamePlural}</h2>
                        {!config.hideNewButton && (
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus size={18} />
                                New
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${config.entityNamePlural.toLowerCase()}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                    >
                        <Filter size={16} />
                        Filters
                        {(statusFilter !== 'all' || domainFilter !== 'all') && (
                            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {(statusFilter !== 'all' ? 1 : 0) + (domainFilter !== 'all' ? 1 : 0)}
                            </span>
                        )}
                    </button>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as EntityStatus)}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {config.availableStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {getStatusLabel(status)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Domain</label>
                                <select
                                    value={domainFilter}
                                    onChange={(e) => setDomainFilter(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {availableDomains.map((domain) => (
                                        <option key={domain} value={domain}>
                                            {domain === 'all' ? 'All Domains' : formatSnakeCaseToTitleCase(domain)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={clearFilters}
                                className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    <p className="text-sm text-gray-600 mt-2">
                        Showing {filteredEntities.length} of {entities.length}
                    </p>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    ) : filteredEntities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                            <p>No {config.entityNamePlural.toLowerCase()} found</p>
                        </div>
                    ) : (
                        filteredEntities.map((entity) => (
                            <AdminListTile
                                key={config.getId(entity)}
                                title={config.getTitle(entity)}
                                subtitle={config.getSubtitle(entity)}
                                domain={config.getDomain(entity)}
                                status={getStatusLabel(config.getStatus(entity))}
                                isSelected={selectedEntity?.id === entity.id}
                                onTap={() => handleSelect(entity)}
                                onAction={(action) => handleAction(action, entity)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel - Detail */}
            <div className="flex-1 bg-gray-50">
                {isCreating || selectedEntity ? (
                    <div key={isCreating ? 'new' : selectedEntity?.id} className="h-full">
                        {renderEditor(isCreating ? null : selectedEntity, handleSave, handleCancel)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p className="text-xl mb-2">Select {config.entityName}</p>
                        <p className="text-sm">
                            Choose {config.entityName.toLowerCase()} from the list to view and edit
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
