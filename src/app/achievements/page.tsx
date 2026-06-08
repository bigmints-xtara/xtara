"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AchievementsService } from "@/lib/firebase/achievements-service";
import type { TierData, WeeklyGoalData, AchievementStats, PointsByCategory, MedalData } from "@/lib/firebase/achievements-service";
import { useTranslations } from "@/i18n/language-provider";

export default function AchievementsPage() {
    const { user } = useAuth();
    const { t } = useTranslations();
    const [loading, setLoading] = useState(true);

    // State for all achievement data
    const [tierData, setTierData] = useState<TierData | null>(null);
    const [totalPoints, setTotalPoints] = useState(0);
    const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoalData>({
        goodReads: { current: 0, target: 5 },
        challenges: { current: 0, target: 5 },
        sparks: { current: 0, target: 5 }
    });
    const [stats, setStats] = useState<AchievementStats>({ games: 0, sparks: 0, challenges: 0, goodReads: 0 });
    const [pointsByCategory, setPointsByCategory] = useState<PointsByCategory>({ games: 0, sparks: 0, challenges: 0, goodReads: 0, streaks: 0 });
    const [medalData, setMedalData] = useState<MedalData>({ total: 0, common: 0, rare: 0, epic: 0 });

    useEffect(() => {
        async function fetchAllData() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const service = new AchievementsService();

                // Fetch all data in parallel
                const [tier, points, weekly, achievementStats, pointsStats, medals] = await Promise.all([
                    service.getTierData(user.uid),
                    service.getTotalPoints(user.uid),
                    service.getWeeklyGoal(user.uid),
                    service.getAchievementStats(user.uid),
                    service.getPointsByCategory(user.uid),
                    service.getMedalData(user.uid)
                ]);

                setTierData(tier);
                setTotalPoints(points);
                setWeeklyGoal(weekly);
                setStats(achievementStats);
                setPointsByCategory(pointsStats);
                setMedalData(medals);
            } catch (error) {
                console.error('Error fetching achievements data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAllData();
    }, [user]);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Header */}
            <div className="bg-primary text-primary-foreground py-8">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold">{t("achievements.hero.title")}</h1>
                        <p className="text-sm text-primary-foreground/80 mt-1">{t("achievements.hero.subtitle")}</p>
                    </div>

                    {/* Top Stats - Horizontal Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                                <Image src="/illustrations/medal1.svg" alt="Trophy" width={28} height={28} />
                            </div>
                            <div>
                                <div className="text-3xl font-bold">{loading ? '...' : totalPoints}</div>
                                <div className="text-sm text-primary-foreground/80">{t("achievements.stats.points")}</div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center text-2xl">
                                🚩
                            </div>
                            <div>
                                {loading ? (
                                    <>
                                        <div className="text-xl font-bold">{t("achievements.stats.loading")}</div>
                                        <div className="text-sm text-primary-foreground/80">{t("achievements.stats.currentTier")}</div>
                                    </>
                                ) : tierData ? (
                                    <>
                                        <div className="text-2xl font-bold capitalize">{tierData.name}</div>
                                        <div className="text-sm text-primary-foreground/80">{t("achievements.stats.tier")}</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-xl font-bold">{t("achievements.stats.fallbackTier")}</div>
                                        <div className="text-sm text-primary-foreground/80">{t("achievements.stats.tier")}</div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-destructive/20 rounded-lg flex items-center justify-center">
                                <Image src="/illustrations/medal2.svg" alt="Medals" width={28} height={28} />
                            </div>
                            <div>
                                <div className="text-3xl font-bold">{loading ? '...' : medalData.total}</div>
                                <div className="text-sm text-primary-foreground/80">{t("achievements.stats.medals")}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Left Column - Weekly Progress & Medals */}
                    <div className="space-y-4">
                        {/* This Week's Progress */}
                        <div className="bg-card rounded-xl p-4 border border-border ">
                            <h3 className="text-lg font-bold text-card-foreground mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                                {t("achievements.weeklyProgress.title")}
                            </h3>
                            <div className="space-y-3">
                                <ProgressRow label={t("achievements.weeklyProgress.goodReads")} icon="/illustrations/goodread1.png" current={weeklyGoal.goodReads.current} total={weeklyGoal.goodReads.target} color="#22c55e" />
                                <ProgressRow label={t("achievements.weeklyProgress.challenges")} icon="/illustrations/challenge1.png" current={weeklyGoal.challenges.current} total={weeklyGoal.challenges.target} color="#f97316" />
                                <ProgressRow label={t("achievements.weeklyProgress.sparks")} icon="/illustrations/sparks.png" current={weeklyGoal.sparks.current} total={weeklyGoal.sparks.target} color="#a855f7" />
                            </div>
                        </div>

                        {/* Medals Summary */}
                        <div className="bg-card rounded-xl p-4 border border-border ">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-secondary text-xl">🏆</span>
                                <h3 className="text-lg font-bold text-card-foreground">{t("achievements.medals.title")} ({medalData.total})</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <MedalCountCard rarity={t("achievements.medals.common")} count={medalData.common} color="#6b7280" />
                                <MedalCountCard rarity={t("achievements.medals.rare")} count={medalData.rare} color="#3b82f6" />
                                <MedalCountCard rarity={t("achievements.medals.epic")} count={medalData.epic} color="#a855f7" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats & Categories */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* All-Time Achievements Grid */}
                        <div className="bg-card rounded-xl p-4 border border-border ">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-secondary text-2xl">🏆</span>
                                <h3 className="text-xl font-bold text-card-foreground">{t("achievements.allTime.title")}</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <StatCard title={t("achievements.allTime.games")} value={String(stats.games)} icon="/illustrations/play.png" color="#3b82f6" />
                                <StatCard title={t("achievements.allTime.sparks")} value={String(stats.sparks)} icon="/illustrations/sparks.png" color="#a855f7" />
                                <StatCard title={t("achievements.allTime.challenges")} value={String(stats.challenges)} icon="/illustrations/challenge1.png" color="#f97316" />
                                <StatCard title={t("achievements.allTime.goodReads")} value={String(stats.goodReads)} icon="/illustrations/goodread1.png" color="#22c55e" />
                            </div>
                        </div>

                        {/* Points by Category */}
                        <div className="bg-card rounded-xl p-4 border border-border ">
                            <h3 className="text-xl font-bold text-card-foreground mb-4">{t("achievements.pointsByCategory.title")}</h3>
                            <div className="space-y-2">
                                <CategoryRow title={t("achievements.pointsByCategory.games.title")} desc={t("achievements.pointsByCategory.games.description")} points={pointsByCategory.games} icon="/illustrations/play.png" color="#3b82f6" />
                                <CategoryRow title={t("achievements.pointsByCategory.sparks.title")} desc={t("achievements.pointsByCategory.sparks.description")} points={pointsByCategory.sparks} icon="/illustrations/sparks.png" color="#a855f7" />
                                <CategoryRow title={t("achievements.pointsByCategory.challenges.title")} desc={t("achievements.pointsByCategory.challenges.description")} points={pointsByCategory.challenges} icon="/illustrations/challenge1.png" color="#f97316" />
                                <CategoryRow title={t("achievements.pointsByCategory.goodReads.title")} desc={t("achievements.pointsByCategory.goodReads.description")} points={pointsByCategory.goodReads} icon="/illustrations/goodread1.png" color="#22c55e" />
                                <CategoryRow title={t("achievements.pointsByCategory.streaks.title")} desc={t("achievements.pointsByCategory.streaks.description")} points={pointsByCategory.streaks} icon="🔥" color="#ef4444" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}

function ProgressRow({ label, current, total, color, icon }: { label: string, current: number, total: number, color: string, icon?: string }) {
    const percentage = Math.min(100, (current / total) * 100);
    return (
        <div>
            <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground font-medium flex items-center gap-2">
                    {icon && <Image src={icon} alt={label} width={20} height={20} className="object-contain" />}
                    {label}
                </span>
                <span className="text-muted-foreground font-semibold">{current}/{total}</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) {
    return (
        <div className="relative overflow-hidden rounded-lg p-4 border transition-all" style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}>
            <div className="text-3xl font-bold text-card-foreground mb-0.5">{value}</div>
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
        </div>
    );
}

function CategoryRow({ title, desc, points, icon, color }: { title: string, desc: string, points: number, icon: string, color: string }) {
    // Check if icon is an emoji (single character) or an image path
    const isEmoji = icon.length <= 2;

    return (
        <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color }}>
                {isEmoji ? (
                    <span className="text-lg text-white">{icon}</span>
                ) : (
                    <Image src={icon} alt={title} width={20} height={20} className="object-contain" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground text-xs">{title}</div>
                <div className="text-[10px] text-muted-foreground truncate">{desc}</div>
            </div>
            <div className="text-2xl font-bold tabular-nums" style={{ color }}>{points}</div>
        </div>
    );
}

function MedalCountCard({ rarity, count, color }: { rarity: string, count: number, color: string }) {
    return (
        <div className="text-center p-2 rounded-lg border-2" style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}>
            <div className="text-2xl font-bold" style={{ color }}>{count}</div>
            <div className="text-[9px] font-semibold uppercase tracking-wide" style={{ color }}>{rarity}</div>
        </div>
    );
}
