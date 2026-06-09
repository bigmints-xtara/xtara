'use client';
import AdminMasterDetail from '@/components/admin/AdminMasterDetail';
import ChallengeEditor from '@/components/admin/editors/ChallengeEditor';
import { challengesConfig } from '@/lib/admin/configs/challengesConfig';
import type { Challenge } from '@/types/admin';

export default function AdminChallengesPage() {
  return (
    <div className="h-full">
      <AdminMasterDetail<Challenge>
        config={challengesConfig}
        renderEditor={(challenge, onSave, onCancel) => (
          <ChallengeEditor challenge={challenge} onSave={onSave} onCancel={onCancel} />
        )}
      />
    </div>
  );
}
