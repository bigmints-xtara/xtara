'use client';

import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import type { Story } from '@/types/admin';

interface StoryEditorProps {
    story: Story | null;
    onSave: (data: Partial<Story>) => Promise<void>;
    onCancel: () => void;
}

export default function StoryEditor({ story, onSave, onCancel }: StoryEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Story>>({
        title: '',
        description: '',
        image: '',
        career_clusters: [],
        careerRelevance: [],
        slides: [],
        published: false,
        draft: true,
        inReview: false,
        featured: false,
        ad: false,
        byXtara: false,
    });

    const [clusterInput, setClusterInput] = useState('');
    const [relevanceInput, setRelevanceInput] = useState('');

    useEffect(() => {
        if (story) {
            setFormData(story);
            setClusterInput(story.career_clusters[0] || '');
        } else {
            // Reset to blank state when creating a new story
            setFormData({
                title: '',
                description: '',
                image: '',
                career_clusters: [],
                careerRelevance: [],
                slides: [],
                published: false,
                draft: true,
                inReview: false,
                featured: false,
                ad: false,
                byXtara: false,
            });
            setClusterInput('');
            setRelevanceInput('');
        }
    }, [story]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await onSave(formData);
        } catch (error) {
            alert(`Error saving story: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const addCluster = () => {
        if (clusterInput.trim() && !formData.career_clusters?.includes(clusterInput.trim())) {
            setFormData({
                ...formData,
                career_clusters: [...(formData.career_clusters || []), clusterInput.trim()],
            });
            setClusterInput('');
        }
    };

    const removeCluster = (cluster: string) => {
        setFormData({
            ...formData,
            career_clusters: formData.career_clusters?.filter((c) => c !== cluster),
        });
    };

    const addRelevance = () => {
        if (relevanceInput.trim() && !formData.careerRelevance?.includes(relevanceInput.trim())) {
            setFormData({
                ...formData,
                careerRelevance: [...(formData.careerRelevance || []), relevanceInput.trim()],
            });
            setRelevanceInput('');
        }
    };

    const removeRelevance = (relevance: string) => {
        setFormData({
            ...formData,
            careerRelevance: formData.careerRelevance?.filter((r) => r !== relevance),
        });
    };

    const getStatus = () => {
        if (formData.published) return 'published';
        if (formData.inReview) return 'inReview';
        return 'draft';
    };

    const setStatus = (status: string) => {
        setFormData({
            ...formData,
            published: status === 'published',
            draft: status === 'draft',
            inReview: status === 'inReview',
        });
    };

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b bg-white flex items-center justify-between">
                <h2 className="text-xl font-bold">
                    {story ? 'Edit Story' : 'Create New Story'}
                </h2>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={18} />
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-lg p-6 border">
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter story title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter story description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Image URL</label>
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={getStatus()}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="inReview">In Review</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Career Clusters */}
                <div className="bg-white rounded-lg p-6 border">
                    <h3 className="text-lg font-semibold mb-4">
                        Career Clusters <span className="text-red-500">*</span>
                    </h3>

                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={clusterInput}
                            onChange={(e) => setClusterInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCluster())}
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add career cluster"
                        />
                        <button
                            type="button"
                            onClick={addCluster}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.career_clusters?.map((cluster) => (
                            <span
                                key={cluster}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                            >
                                {cluster}
                                <button
                                    type="button"
                                    onClick={() => removeCluster(cluster)}
                                    className="hover:text-blue-900"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Career Relevance */}
                <div className="bg-white rounded-lg p-6 border">
                    <h3 className="text-lg font-semibold mb-4">Career Relevance</h3>

                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={relevanceInput}
                            onChange={(e) => setRelevanceInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRelevance())}
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add career relevance"
                        />
                        <button
                            type="button"
                            onClick={addRelevance}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.careerRelevance?.map((relevance) => (
                            <span
                                key={relevance}
                                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2"
                            >
                                {relevance}
                                <button
                                    type="button"
                                    onClick={() => removeRelevance(relevance)}
                                    className="hover:text-purple-900"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Flags */}
                <div className="bg-white rounded-lg p-6 border">
                    <h3 className="text-lg font-semibold mb-4">Options</h3>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.featured || false}
                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm">Featured Story</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.byXtara || false}
                                onChange={(e) => setFormData({ ...formData, byXtara: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm">By Xtara</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.ad || false}
                                onChange={(e) => setFormData({ ...formData, ad: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm">Advertisement</span>
                        </label>
                    </div>
                </div>

                {/* Slides Info */}
                <div className="bg-white rounded-lg p-6 border">
                    <h3 className="text-lg font-semibold mb-2">Slides</h3>
                    <p className="text-sm text-gray-600">
                        This story has {formData.slides?.length || 0} slides.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Note: Slide editing will be available in a future update.
                    </p>
                </div>
            </div>
        </form>
    );
}
