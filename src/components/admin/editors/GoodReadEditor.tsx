'use client';

import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import type { GoodRead } from '@/types/admin';
import { formatSnakeCaseToTitleCase } from '@/lib/utils';

interface GoodReadEditorProps {
  goodRead: GoodRead | null;
  onSave: (data: Partial<GoodRead>) => Promise<void>;
  onCancel: () => void;
}

export default function GoodReadEditor({ goodRead, onSave, onCancel }: GoodReadEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<GoodRead>>(() => ({
    title: goodRead?.title || '',
    type: goodRead?.type || '',
    domain: goodRead?.domain || '',
    content: goodRead?.content || '',
    image: goodRead?.image || '',
    hyperlink: goodRead?.hyperlink || '',
    hyperlinkText: goodRead?.hyperlinkText || '',
    careerRelevance: goodRead?.careerRelevance || [],
    published: goodRead?.published || false,
    draft: goodRead?.draft ?? true,
    inReview: goodRead?.inReview || false,
    publishedAt: goodRead?.publishedAt,
    publishedUntil: goodRead?.publishedUntil,
  }));

  const [relevanceInput, setRelevanceInput] = useState('');

  useEffect(() => {
    if (goodRead) {
      setFormData(goodRead);
    }
  }, [goodRead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(formData);
    } catch (error) {
      alert(`Error saving good read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
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

  const setStatus = (status: 'draft' | 'published' | 'inReview') => {
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
          {goodRead ? 'Edit Good Read' : 'Create New Good Read'}
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
                placeholder="Enter title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., article, video, podcast"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter domain"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter content"
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
              <label className="block text-sm font-medium mb-1">Hyperlink</label>
              <input
                type="url"
                value={formData.hyperlink}
                onChange={(e) => setFormData({ ...formData, hyperlink: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hyperlink Text</label>
              <input
                type="text"
                value={formData.hyperlinkText}
                onChange={(e) => setFormData({ ...formData, hyperlinkText: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Read more"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.published ? 'published' : formData.inReview ? 'inReview' : 'draft'}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'inReview')}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="inReview">In Review</option>
                <option value="published">Published</option>
              </select>
            </div>
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
                {formatSnakeCaseToTitleCase(relevance)}
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

        {/* Publishing Schedule */}
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">Publishing Schedule</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Published At</label>
              <input
                type="datetime-local"
                value={
                  formData.publishedAt instanceof Date
                    ? new Date(formData.publishedAt.getTime() - formData.publishedAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                    : formData.publishedAt
                      ? ''
                      : ''
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publishedAt: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Published Until</label>
              <input
                type="datetime-local"
                value={
                  formData.publishedUntil instanceof Date
                    ? new Date(formData.publishedUntil.getTime() - formData.publishedUntil.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                    : formData.publishedUntil
                      ? ''
                      : ''
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publishedUntil: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
