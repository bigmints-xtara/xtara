'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { AchievementsService } from '@/lib/firebase/achievements-service';
import type { TierData } from '@/lib/firebase/achievements-service';
import { Trophy, Award, Target } from 'lucide-react';

interface Props {
  isLoading?: boolean;
}

export default function Header({ isLoading }: Props) {
  const { user, userProfile } = useAuth();
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [totalMedals, setTotalMedals] = useState<number>(0);
  const [tierData, setTierData] = useState<TierData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (user && !user.isAnonymous) {
        try {
          const service = new AchievementsService();
          const points = await service.getTotalPoints(user.uid);
          const medals = await service.getMedalData(user.uid);
          const tier = await service.getTierData(user.uid);
          setTotalPoints(points);
          setTotalMedals(medals.total);
          setTierData(tier);
        } catch (error) {
          console.error('Error fetching achievement stats:', error);
        }
      }
    };

    fetchStats();
  }, [user]);

  const displayName = userProfile?.fullName || userProfile?.displayName || user?.displayName || 'there';

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Hello {displayName} ✨
            </h1>
            <p className="text-gray-600 mt-1">Welcome to your career dashboard</p>
          </div>

          {/* Stats Summary */}
          {user && !user.isAnonymous && tierData && (
            <div className="flex items-center gap-4">
              {/* Total Points */}
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <Target className="text-blue-600" size={20} />
                <div>
                  <div className="text-xs text-blue-600 font-semibold uppercase">Points</div>
                  <div className="text-lg font-bold text-blue-900">{totalPoints.toLocaleString()}</div>
                </div>
              </div>

              {/* Total Medals */}
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <Award className="text-yellow-600" size={20} />
                <div>
                  <div className="text-xs text-yellow-600 font-semibold uppercase">Medals</div>
                  <div className="text-lg font-bold text-yellow-900">{totalMedals}</div>
                </div>
              </div>

              {/* Tier */}
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                <Trophy className="text-purple-600" size={20} />
                <div>
                  <div className="text-xs text-purple-600 font-semibold uppercase">Tier</div>
                  <div className="text-lg font-bold text-purple-900">{tierData.name}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
