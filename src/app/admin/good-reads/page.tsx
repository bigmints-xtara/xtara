'use client';
import AdminMasterDetail from '@/components/admin/AdminMasterDetail';
import GoodReadEditor from '@/components/admin/editors/GoodReadEditor';
import { goodReadsConfig } from '@/lib/admin/configs/goodReadsConfig';
import type { GoodRead } from '@/types/admin';

export default function AdminGoodReadsPage() {
  return (
    <div className="h-full">
      <AdminMasterDetail<GoodRead>
        config={goodReadsConfig}
        renderEditor={(goodRead, onSave, onCancel) => (
          <GoodReadEditor goodRead={goodRead} onSave={onSave} onCancel={onCancel} />
        )}
      />
    </div>
  );
}
