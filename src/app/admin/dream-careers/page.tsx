'use client';

import AdminMasterDetail from '@/components/admin/AdminMasterDetail';
import CareerPathEditor from '@/components/admin/editors/CareerPathEditor';
import { dreamCareersConfig } from '@/lib/admin/configs/dreamCareersConfig';
import type { AdminCareerPath } from '@/types/admin';

export default function AdminDreamCareersPage() {
  return (
    <div className="h-full">
      <AdminMasterDetail<AdminCareerPath>
        config={dreamCareersConfig}
        renderEditor={(careerPath, onSave, onCancel) => (
          <CareerPathEditor
            careerPath={careerPath}
            onSave={onSave}
            onCancel={onCancel}
          />
        )}
      />
    </div>
  );
}
