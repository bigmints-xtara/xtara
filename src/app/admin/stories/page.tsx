'use client';

import AdminMasterDetail from '@/components/admin/AdminMasterDetail';
import StoryEditor from '@/components/admin/editors/StoryEditor';
import { storiesConfig } from '@/lib/admin/configs/storiesConfig';
import type { Story } from '@/types/admin';

export default function AdminStoriesPage() {
    return (
        <div className="h-full">
            <AdminMasterDetail<Story>
                config={storiesConfig}
                renderEditor={(story, onSave, onCancel) => (
                    <StoryEditor story={story} onSave={onSave} onCancel={onCancel} />
                )}
            />
        </div>
    );
}
