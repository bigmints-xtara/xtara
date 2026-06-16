'use client';

import AdminMasterDetail from '@/components/admin/AdminMasterDetail';
import GameEditor from '@/components/admin/editors/GameEditor';
import { gamesConfig } from '@/lib/admin/configs/gamesConfig';
import type { GameInstance } from '@/types/admin';

export default function AdminGamesPage() {
  return (
    <div className="h-full">
      <AdminMasterDetail<GameInstance>
        config={gamesConfig}
        renderEditor={(game, onSave, onCancel) => (
          <GameEditor game={game} onSave={onSave} onCancel={onCancel} />
        )}
      />
    </div>
  );
}
