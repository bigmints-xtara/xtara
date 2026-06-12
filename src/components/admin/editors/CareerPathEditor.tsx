'use client';

import { useState } from 'react';
import type { AdminCareerPath } from '@/types/admin';

interface CareerPathEditorProps {
  careerPath: AdminCareerPath | null;
  onSave: (data: Partial<AdminCareerPath>) => Promise<void>;
  onCancel: () => void;
}

export default function CareerPathEditor({ careerPath, onSave, onCancel }: CareerPathEditorProps) {
  const [title, setTitle] = useState(careerPath?.title || '');
  const [description, setDescription] = useState(careerPath?.description || '');
  const [whatYouDo, setWhatYouDo] = useState(careerPath?.whatYouDo || '');
  const [whyItMatters, setWhyItMatters] = useState(careerPath?.whyItMatters || '');
  const [matchReasoning, setMatchReasoning] = useState(careerPath?.matchReasoning || '');

  // Reset form when careerPath changes
  if (careerPath) {
    setTitle(careerPath.title || '');
    setDescription(careerPath.description || '');
    setWhatYouDo(careerPath.whatYouDo || '');
    setWhyItMatters(careerPath.whyItMatters || '');
    setMatchReasoning(careerPath.matchReasoning || '');
  }

  const handleSave = async () => {
    await onSave({
      title,
      description,
      whatYouDo,
      whyItMatters,
      matchReasoning,
    });
  };

  if (!careerPath) {
    return <div className="p-6 text-gray-500">Select a career path to view details.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Overview - Read Only */}
      <section className="bg-gray-50 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-gray-700 border-b pb-2">Overview</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-medium">User ID:</span> {careerPath.userId}</div>
          <div><span className="font-medium">Career:</span> {careerPath.careerName}</div>
          <div><span className="font-medium">Match Score:</span> {careerPath.matchScore ?? '—'}</div>
          <div><span className="font-medium">Salary Range:</span> {careerPath.expectedSalaryRange || '—'}</div>
        </div>
      </section>

      {/* Editable Fields */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-700 border-b pb-2">Editable Fields</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">What You Do</label>
          <textarea
            value={whatYouDo}
            onChange={(e) => setWhatYouDo(e.target.value)}
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Why It Matters</label>
          <textarea
            value={whyItMatters}
            onChange={(e) => setWhyItMatters(e.target.value)}
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Match Reasoning</label>
          <textarea
            value={matchReasoning}
            onChange={(e) => setMatchReasoning(e.target.value)}
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </section>

      {/* Read-Only Lists */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-700 border-b pb-2">AI-Generated Data (Read-Only)</h3>
        
        {careerPath.strengths?.length && (
          <div>
            <span className="text-sm font-medium text-gray-600">Strengths:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {careerPath.strengths.map((s, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}

        {careerPath.archetypes?.length && (
          <div>
            <span className="text-sm font-medium text-gray-600">Archetypes:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {careerPath.archetypes.map((a, i) => (
                <span key={i} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">{a}</span>
              ))}
            </div>
          </div>
        )}

        {careerPath.streamSuggestions?.length && (
          <div>
            <span className="text-sm font-medium text-gray-600">Stream Suggestions:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {careerPath.streamSuggestions.map((s, i) => (
                <span key={i} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Career Pathway - Read Only */}
      {careerPath.careerPathway?.length && (
        <section className="space-y-2">
          <h3 className="font-semibold text-gray-700 border-b pb-2">Career Pathway</h3>
          {careerPath.careerPathway.map((step, i) => (
            <div key={i} className="bg-gray-50 rounded px-3 py-2 text-sm">
              <span className="font-medium">{step.title}</span> — {step.duration}
              {step.note && <span className="text-gray-500 ml-2">({step.note})</span>}
            </div>
          ))}
        </section>
      )}

      {/* Related Careers - Read Only */}
      {careerPath.relatedCareers?.length && (
        <section className="space-y-2">
          <h3 className="font-semibold text-gray-700 border-b pb-2">Related Careers</h3>
          {careerPath.relatedCareers.map((rc, i) => (
            <div key={i} className="bg-gray-50 rounded px-3 py-2 text-sm">
              <span className="font-medium">{rc.title}</span>: {rc.reason}
            </div>
          ))}
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
