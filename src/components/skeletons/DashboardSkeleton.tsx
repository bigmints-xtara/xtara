import React from 'react';
import Skeleton, { SkeletonText, SkeletonCircle, SkeletonCard } from '@/components/ui/Skeleton';

/**
 * Dashboard Skeleton Loader
 * Displays a skeleton structure matching the actual dashboard layout
 */
export default function DashboardSkeleton() {
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-10 pb-20">
            {/* Header Skeleton */}
            <HeaderSkeleton />

            {/* Top Row: Main Status & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CurrentGoalCardSkeleton />
                <WeeklyProgressSkeleton />
            </div>

            {/* Content Sections Skeleton */}
            <ContentSectionsSkeleton />
        </div>
    );
}

/**
 * Header section skeleton
 */
function HeaderSkeleton() {
    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <Skeleton height="36px" width="200px" />
                    <SkeletonCircle size="24px" />
                </div>
                <Skeleton height="20px" width="250px" />
            </div>

            {/* Achievement Stats Skeleton */}
            <AchievementStatsSkeleton />
        </header>
    );
}

/**
 * Achievement stats badges skeleton
 */
function AchievementStatsSkeleton() {
    return (
        <div className="flex items-center gap-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <SkeletonCircle size="18px" />
                    <div className="space-y-1">
                        <Skeleton height="10px" width="40px" />
                        <Skeleton height="16px" width="50px" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Current goal card skeleton
 */
function CurrentGoalCardSkeleton() {
    return (
        <SkeletonCard className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gray-100">
                    <SkeletonCircle size="24px" />
                </div>
                <div className="flex-1">
                    <Skeleton height="20px" width="150px" className="mb-2" />
                    <Skeleton height="14px" width="100px" />
                </div>
            </div>
            <Skeleton height="120px" width="100%" rounded="lg" />
        </SkeletonCard>
    );
}

/**
 * Weekly progress card skeleton
 */
function WeeklyProgressSkeleton() {
    return (
        <SkeletonCard>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-gray-100">
                    <SkeletonCircle size="24px" />
                </div>
                <div className="flex-1">
                    <Skeleton height="18px" width="140px" className="mb-1" />
                    <Skeleton height="12px" width="80px" />
                </div>
            </div>
            <Skeleton height="12px" width="100%" rounded="full" className="mb-3" />
            <div className="flex justify-between">
                <Skeleton height="14px" width="80px" />
                <Skeleton height="14px" width="80px" />
            </div>
        </SkeletonCard>
    );
}

/**
 * Content sections skeleton (Stories, Reads, Challenges, etc.)
 */
function ContentSectionsSkeleton() {
    return (
        <div className="space-y-12">
            {[1, 2, 3, 4].map((section) => (
                <section key={section}>
                    {/* Section header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <SkeletonCircle size="24px" />
                        </div>
                        <Skeleton height="28px" width="180px" />
                    </div>

                    {/* Carousel items */}
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="flex-none w-[300px]">
                                <Skeleton height="176px" width="300px" rounded="2xl" />
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
