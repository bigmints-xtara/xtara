"use client";

import { useEffect, useState } from "react";
import { getUserCareerPath } from "@/lib/firebase/assessment";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Trophy, Zap, Gamepad2, Bell, Sparkles, TrendingUp, Puzzle, Grid } from "lucide-react";
import CareerPathPreview from "./CareerPathPreview";
import SalesCard from "./SalesCard";
import LockedContentOverlay from "./LockedContentOverlay";
import PreviewStatsCard, { createPreviewStats } from "./PreviewStatsCard";
import { CareerPath } from "@/types/career";
import { FirestoreService, Story, GoodRead, Challenge, GameInstance, Spark } from "@/lib/firebase/firestore-service";
import Carousel from "@/components/ui/Carousel";
import Skeleton from "@/components/ui/Skeleton";

export default function AnonymousDashboard() {
    const { user } = useAuth();
    const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
    const [loading, setLoading] = useState(true);

    // Preview content state
    const [stories, setStories] = useState<Story[]>([]);
    const [goodReads, setGoodReads] = useState<GoodRead[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [games, setGames] = useState<GameInstance[]>([]);
    const [sparks, setSparks] = useState<Spark[]>([]);

    useEffect(() => {
        async function loadData() {
            if (user?.uid) {
                const data = await getUserCareerPath(user.uid);
                setCareerPath(data);
            }

            // Load preview content (limited to 4-5 items each)
            try {
                const [storiesData, readsData, challengesData, gamesData, sparksData] = await Promise.all([
                    FirestoreService.getStoriesForHome(),
                    FirestoreService.getGoodReadsForHome(),
                    FirestoreService.getChallengesForHome(),
                    FirestoreService.getPlayableGames(),
                    FirestoreService.getSparksForHome()
                ]);

                setStories(storiesData.slice(0, 5));
                setGoodReads(readsData.slice(0, 5));
                setChallenges(challengesData.slice(0, 5));
                setGames(gamesData.slice(0, 5));
                setSparks(sparksData.slice(0, 5));
            } catch (error) {
                console.error("Error loading preview content:", error);
            }

            setLoading(false);
        }
        loadData();
    }, [user]);

    const brandColors = [
        '#003763', '#61B3E4', '#4EE2E2', '#F6B333',
        '#EF7521', '#61B3E4', '#4EE2E2', '#F6B333'
    ];

    const getBrandColor = (index: number) => brandColors[index % brandColors.length];

    if (loading) {
        return (
            <div className="container mx-auto p-4 md:p-8 max-w-7xl">
                <Skeleton height="200px" width="100%" rounded="2xl" />
            </div>
        );
    }

    const previewStats = createPreviewStats();

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-10 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome to Xtara
                        </h1>
                        <Sparkles size={24} className="text-blue-600 fill-blue-600 animate-pulse" />
                    </div>
                    <p className="text-gray-600">Discover your career path and unlock your potential</p>
                </div>
            </header>

            {/* Preview Stats */}
            <PreviewStatsCard stats={previewStats} />

            {/* Career Preview (if assessment completed) */}
            {careerPath && (
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <TrendingUp className="text-blue-600" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Your Recommended Career</h2>
                    </div>
                    <CareerPathPreview careerPath={careerPath} />
                </section>
            )}

            {/* Preview Sections */}
            <div className="space-y-12">
                {/* Stories Preview */}
                {stories.length > 0 && (
                    <DashboardSection title="Stories for you" icon={<Bell className="text-orange-500" />}>
                        <Carousel itemWidth={300}>
                            {stories.map((story, index) => (
                                <div
                                    key={story.id}
                                    className="flex-none w-[300px] h-64 rounded-2xl relative overflow-hidden cursor-pointer border border-transparent group transition-all duration-300 hover:"
                                    style={{ backgroundColor: getBrandColor(index) }}
                                >
                                    <img
                                        src={story.image}
                                        alt={story.title}
                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 p-6 w-full">
                                        <span className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 block">{story.category}</span>
                                        <h3 className="text-xl font-bold text-white leading-tight">{story.title}</h3>
                                    </div>
                                    <LockedContentOverlay message="Sign up to read stories" careerPathId={careerPath?.id} />
                                </div>
                            ))}
                        </Carousel>
                    </DashboardSection>
                )}

                {/* Good Reads Preview */}
                {goodReads.length > 0 && (
                    <DashboardSection title="Good Reads" icon={<BookOpen className="text-green-600" />}>
                        <Carousel itemWidth={300}>
                            {goodReads.map((read, index) => (
                                <div
                                    key={read.id}
                                    className="flex-none w-[300px] h-44 rounded-2xl overflow-hidden relative group border border-transparent hover: transition-all cursor-pointer "
                                    style={{ backgroundColor: getBrandColor(index) }}
                                >
                                    <img
                                        src={read.image}
                                        alt={read.title}
                                        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 p-4 w-full">
                                        <h3 className="font-bold text-white line-clamp-2">{read.title}</h3>
                                    </div>
                                    <LockedContentOverlay message="Sign up to access reads" careerPathId={careerPath?.id} />
                                </div>
                            ))}
                        </Carousel>
                    </DashboardSection>
                )}

                {/* Challenges Preview */}
                {challenges.length > 0 && (
                    <DashboardSection title="Reading Challenges" icon={<Trophy className="text-yellow-600" />}>
                        <Carousel itemWidth={300}>
                            {challenges.map((challenge, index) => (
                                <div
                                    key={challenge.id}
                                    className="flex-none w-[300px] h-44 rounded-2xl overflow-hidden relative group border border-transparent hover: transition-all cursor-pointer "
                                    style={{ backgroundColor: getBrandColor(index) }}
                                >
                                    <img
                                        src={challenge.image}
                                        alt={challenge.title}
                                        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 p-4 w-full">
                                        <h3 className="font-bold text-white line-clamp-2">{challenge.title}</h3>
                                    </div>
                                    <LockedContentOverlay message="Sign up to join challenges" careerPathId={careerPath?.id} />
                                </div>
                            ))}
                        </Carousel>
                    </DashboardSection>
                )}

                {/* Sparks Preview */}
                {sparks.length > 0 && (
                    <DashboardSection title="Sparks" icon={<Zap className="text-blue-600" />}>
                        <Carousel itemWidth={300}>
                            {sparks.map((spark) => (
                                <div
                                    key={spark.id}
                                    className="flex-none w-[300px] h-44 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-blue-200 hover: transition-all cursor-pointer "
                                >
                                    <div className="p-3 bg-blue-50 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                        <Zap size={24} className="text-blue-600" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 line-clamp-2">{spark.title}</h3>
                                    <span className="text-xs text-blue-600 mt-1 uppercase tracking-wider font-bold">{spark.type}</span>
                                    <LockedContentOverlay message="Sign up to access sparks" careerPathId={careerPath?.id} />
                                </div>
                            ))}
                        </Carousel>
                    </DashboardSection>
                )}

                {/* Games Preview */}
                {games.length > 0 && (
                    <DashboardSection title="Games" icon={<Gamepad2 className="text-purple-600" />}>
                        <Carousel itemWidth={300}>
                            {games.map((game) => {
                                let Icon = Gamepad2;
                                let colorClass = "text-purple-600";
                                let bgClass = "bg-purple-50";
                                let borderHover = "hover:border-purple-200";

                                if (game.mode === 'quiz') {
                                    Icon = BookOpen;
                                    colorClass = "text-blue-600";
                                    bgClass = "bg-blue-50";
                                    borderHover = "hover:border-blue-200";
                                } else if (game.mode === 'puzzle') {
                                    Icon = Puzzle;
                                    colorClass = "text-green-600";
                                    bgClass = "bg-green-50";
                                    borderHover = "hover:border-green-200";
                                } else if (game.mode === 'memory') {
                                    Icon = Grid;
                                    colorClass = "text-orange-600";
                                    bgClass = "bg-orange-50";
                                    borderHover = "hover:border-orange-200";
                                }

                                return (
                                    <div
                                        key={game.id}
                                        className={`flex-none w-[300px] h-44 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden group ${borderHover} hover: transition-all cursor-pointer `}
                                    >
                                        <div className={`p-3 rounded-full mb-3 group-hover:scale-110 transition-transform ${bgClass}`}>
                                            <Icon size={24} className={colorClass} />
                                        </div>
                                        <h3 className="font-bold text-gray-900 line-clamp-2">{game.title}</h3>
                                        <span className={`text-xs mt-1 uppercase tracking-wider font-bold ${colorClass}`}>{game.mode}</span>
                                        <LockedContentOverlay message="Sign up to play games" careerPathId={careerPath?.id} />
                                    </div>
                                );
                            })}
                        </Carousel>
                    </DashboardSection>
                )}
            </div>

            {/* Sales Card at Bottom */}
            <div className="mt-12">
                <SalesCard careerPathId={careerPath?.id} />
            </div>
        </div>
    );
}

function DashboardSection({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                    {icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            {children}
        </section>
    );
}
