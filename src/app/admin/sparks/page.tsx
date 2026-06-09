'use client';

import AdminMasterDetail from '@/components/admin/AdminMasterDetail';
import SparkEditor from '@/components/admin/editors/SparkEditor';
import { sparksConfig } from '@/lib/admin/configs/sparksConfig';
import type { Spark } from '@/types/admin';

export default function AdminSparksPage() {
    return (
        <div className="h-full">
            <AdminMasterDetail<Spark>
                config={sparksConfig}
                renderEditor={(spark, onSave, onCancel) => (
                    <SparkEditor spark={spark} onSave={onSave} onCancel={onCancel} />
                )}
            />
        </div>
    );
}
