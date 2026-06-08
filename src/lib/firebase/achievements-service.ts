import { db } from "@/lib/firebase/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export interface TierData {
    name: string;
    currentTierId: string;
    nextTier: string | null;
}

export interface WeeklyGoalData {
    goodReads: { current: number; target: number };
    challenges: { current: number; target: number };
    sparks: { current: number; target: number };
}

export interface AchievementStats {
    games: number;
    sparks: number;
    challenges: number;
    goodReads: number;
}

export interface PointsByCategory {
    games: number;
    sparks: number;
    challenges: number;
    goodReads: number;
    streaks: number;
}

export interface MedalData {
    total: number;
    common: number;
    rare: number;
    epic: number;
}

export class AchievementsService {
    private tierNames = ['spark', 'ember', 'flare', 'glimmer', 'nova', 'orbit', 'comet', 'radiant', 'galaxy', 'cosmic'];

    async getTierData(userId: string): Promise<TierData | null> {
        try {
            console.log('🔍 getTierData - userId:', userId);
            const tierDoc = await getDoc(doc(db, 'users', userId, 'tiers', 'current'));
            console.log('🔍 getTierData - exists:', tierDoc.exists());

            if (!tierDoc.exists()) {
                console.log('🔍 Tier document does not exist');
                return null;
            }

            const data = tierDoc.data();
            console.log('🔍 getTierData - raw data:', data);
            const currentTierId = data.currentTierId || 'spark';

            const tierDefDoc = await getDoc(doc(db, 'tiers', currentTierId));
            const tierName = tierDefDoc.exists() ? tierDefDoc.data().name : currentTierId;

            const currentIndex = this.tierNames.indexOf(currentTierId);
            const nextTier = currentIndex < this.tierNames.length - 1 ? this.tierNames[currentIndex + 1] : null;

            const result = { name: tierName, currentTierId, nextTier };
            console.log('🔍 getTierData - result:', result);
            return result;
        } catch (error) {
            console.error('❌ Error fetching tier data:', error);
            return null;
        }
    }

    async getTotalPoints(userId: string): Promise<number> {
        try {
            console.log('🔍 getTotalPoints - userId:', userId);
            // Fetch from users/{uid}/points collection (not /current!)
            const pointsSnapshot = await getDocs(collection(db, 'users', userId, 'points'));
            console.log('🔍 getTotalPoints - documents count:', pointsSnapshot.size);

            let totalPoints = 0;
            pointsSnapshot.forEach(doc => {
                const data = doc.data();
                // Each document has totalPoints field (basePoints + bonusPoints)
                totalPoints += data.totalPoints || 0;
            });

            console.log('🔍 getTotalPoints - calculated total:', totalPoints);
            return totalPoints;
        } catch (error) {
            console.error('❌ Error fetching total points:', error);
            return 0;
        }
    }

    async getWeeklyGoal(userId: string): Promise<WeeklyGoalData> {
        try {
            console.log('🔍 getWeeklyGoal - userId:', userId);
            const tierDoc = await getDoc(doc(db, 'users', userId, 'tiers', 'current'));
            console.log('🔍 getWeeklyGoal - exists:', tierDoc.exists());

            if (tierDoc.exists()) {
                const data = tierDoc.data();
                const weeklyProgress = data.weeklyProgress || [];
                console.log('🔍 getWeeklyGoal - weeklyProgress length:', weeklyProgress.length);

                if (weeklyProgress.length > 0) {
                    const currentWeek = weeklyProgress[weeklyProgress.length - 1];
                    console.log('🔍 getWeeklyGoal - currentWeek:', currentWeek);
                    return {
                        goodReads: {
                            current: currentWeek.readsCompleted || 0,
                            target: currentWeek.requirements?.minReads || 5
                        },
                        challenges: {
                            current: currentWeek.challengesCompleted || 0,
                            target: currentWeek.requirements?.minChallenges || 5
                        },
                        sparks: {
                            current: currentWeek.sparksCompleted || 0,
                            target: currentWeek.requirements?.minSparks || 5
                        }
                    };
                }
            }

            return {
                goodReads: { current: 0, target: 5 },
                challenges: { current: 0, target: 5 },
                sparks: { current: 0, target: 5 }
            };
        } catch (error) {
            console.error('❌ Error fetching weekly goal:', error);
            return {
                goodReads: { current: 0, target: 5 },
                challenges: { current: 0, target: 5 },
                sparks: { current: 0, target: 5 }
            };
        }
    }

    async getAchievementStats(userId: string): Promise<AchievementStats> {
        try {
            console.log('🔍 getAchievementStats - userId:', userId);
            // Count documents by category in the points collection
            const pointsSnapshot = await getDocs(collection(db, 'users', userId, 'points'));
            console.log('🔍 getAchievementStats - total points documents:', pointsSnapshot.size);

            const stats = {
                games: 0,
                sparks: 0,
                challenges: 0,
                goodReads: 0
            };

            pointsSnapshot.forEach(doc => {
                const data = doc.data();
                const category = data.category;
                if (category === 'games') stats.games++;
                else if (category === 'sparks') stats.sparks++;
                else if (category === 'challenges') stats.challenges++;
                else if (category === 'goodReads') stats.goodReads++;
            });

            console.log('🔍 getAchievementStats - result:', stats);
            return stats;
        } catch (error) {
            console.error('❌ Error fetching achievement stats:', error);
            return { games: 0, sparks: 0, challenges: 0, goodReads: 0 };
        }
    }

    async getPointsByCategory(userId: string): Promise<PointsByCategory> {
        try {
            console.log('🔍 getPointsByCategory - userId:', userId);
            const pointsSnapshot = await getDocs(collection(db, 'users', userId, 'points'));
            console.log('🔍 getPointsByCategory - documents count:', pointsSnapshot.size);

            const pointsByCategory = {
                games: 0,
                sparks: 0,
                challenges: 0,
                goodReads: 0,
                streaks: 0
            };

            pointsSnapshot.forEach(doc => {
                const data = doc.data();
                const category = data.category;
                const points = data.totalPoints || 0;

                if (category === 'games') pointsByCategory.games += points;
                else if (category === 'sparks') pointsByCategory.sparks += points;
                else if (category === 'challenges') pointsByCategory.challenges += points;
                else if (category === 'goodReads') pointsByCategory.goodReads += points;
                else if (category === 'streaks') pointsByCategory.streaks += points;
            });

            console.log('🔍 getPointsByCategory - result:', pointsByCategory);
            return pointsByCategory;
        } catch (error) {
            console.error('❌ Error fetching points by category:', error);
            return { games: 0, sparks: 0, challenges: 0, goodReads: 0, streaks: 0 };
        }
    }

    async getMedalData(userId: string): Promise<MedalData> {
        try {
            console.log('🔍 getMedalData - userId:', userId);
            const medalsSnapshot = await getDocs(collection(db, 'users', userId, 'medals'));
            console.log('🔍 getMedalData - count:', medalsSnapshot.size);

            const medalsByRarity = {
                common: 0,
                rare: 0,
                epic: 0
            };

            medalsSnapshot.forEach(doc => {
                const data = doc.data();
                const rarity = (data.rarity || 'common').toLowerCase();
                if (rarity === 'common') medalsByRarity.common++;
                else if (rarity === 'rare') medalsByRarity.rare++;
                else if (rarity === 'epic') medalsByRarity.epic++;
            });

            const result = {
                total: medalsSnapshot.size,
                ...medalsByRarity
            };
            console.log('🔍 getMedalData - result:', result);
            return result;
        } catch (error) {
            console.error('❌ Error fetching medal data:', error);
            return { total: 0, common: 0, rare: 0, epic: 0 };
        }
    }
}
