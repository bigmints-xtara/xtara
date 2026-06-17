"use client";

import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, Trophy, Zap, Gamepad2, ChevronRight, Bell, Sparkles, TrendingUp, Puzzle, Grid, Target, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DownloadAppModal from "./DownloadAppModal";
import CurrentGoalCard from "./CurrentGoalCard";
import StorySlideshow from "./StorySlideshow";
import { FirestoreService, Story } from "@/lib/firebase/firestore-service";
import { useStoriesQuery, useGoodReadsQuery, useChallengesQuery, useGamesQuery, useSparksQuery } from "@/lib/query/useContentQuery";
import { AchievementsService, TierData, MedalData } from "@/lib/firebase/achievements-service";
import { getUserCareerPath } from "@/lib/firebase/assessment";
import Carousel from "@/components/ui/Carousel";
import Skeleton, { SkeletonCircle } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import StatsCard from "./StatsCard";
import { useTranslations } from "@/i18n/language-provider";

export default function UserDashboard() {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { t } = useTranslations();
    const [downloadModalOpen, setDownloadModalOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState("");
    const [totalPoints, setTotalPoints] = useState<number>(0);
    const [medalData, setMedalData] = useState<MedalData | null>(null);
    const [tierData, setTierData] = useState<TierData | null>(null);
    const [pursuingCareerId, setPursuingCareerId] = useState<string | undefined>(undefined);

    // Story Slideshow State
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [storySlideshowOpen, setStorySlideshowOpen] = useState(false);

    // Data State
    const { data: stories = [] } = useStoriesQuery();
    const { data: goodReads = [] } = useGoodReadsQuery();
    const { data: challenges = [] } = useChallengesQuery();
    const { data: games = [] } = useGamesQuery();
    const { data: sparks = [] } = useSparksQuery();

    // Auto-detect career path if not set in profile
    useEffect(() => {
        const detectCareerPath = async () => {
            if (user && !userProfile?.pursuingCareer) {
                console.log("🔍 No pursuingCareer in profile, auto-detecting...");
                const careerPath = await getUserCareerPath(user.uid);
                if (careerPath) {
                    console.log("✅ Auto-detected career path:", careerPath.id);
                    setPursuingCareerId(careerPath.id);
                } else {
                    console.log("⚠️ No career path found for user");
                }
            } else if (userProfile?.pursuingCareer) {
                setPursuingCareerId(userProfile.pursuingCareer);
            }
        };

        detectCareerPath();
    }, [user, userProfile]);

    // Fetch Achievement Stats
    useEffect(() => {
        const fetchStats = async () => {
            if (user && !user.isAnonymous) {
                try {
                    const service = new AchievementsService();
                    const [points, medals, tier] = await Promise.all([
                        service.getTotalPoints(user.uid),
                        service.getMedalData(user.uid),
                        service.getTierData(user.uid)
                    ]);
                    setTotalPoints(points);
                    setMedalData(medals);
                    setTierData(tier);
                } catch (error) {
                    console.error('Error fetching achievement stats:', error);
                }
            }
        };

        fetchStats();
    }, [user]);

    const handleStoryClick = async (story: Story) => {
        // Fetch full story data if slides are empty
        if (!story.slides || story.slides.length === 0) {
            const fullStory = await FirestoreService.getStoryById(story.id);
            if (fullStory) {
                setSelectedStory(fullStory);
                setStorySlideshowOpen(true);
            }
        } else {
            setSelectedStory(story);
            setStorySlideshowOpen(true);
        }
    };

    const handleStoryComplete = async () => {
        // Refresh stories to update watched status
        queryClient.invalidateQueries({ queryKey: ['stories'] });
    };

    const handleFeatureClick = (title: string, prefixKey: string) => {
        const prefix = t(`userDashboard.featurePrefixes.${prefixKey}`);
        setSelectedFeature(t("userDashboard.featureLabel", { prefix, title }));
        setDownloadModalOpen(true);
    };

    // Brand colors for image fallbacks (matching Flutter app)
    const brandColors = [
        '#003763', // kPrimaryColor (Ocean Navy)
        '#61B3E4', // kAccentColor (Sky Blue)
        '#4EE2E2', // kTertiaryColor (Seafoam Teal)
        '#F6B333', // kQuaternaryColor (Sun Gold)
        '#EF7521', // kHighlightColor (Coral Orange)
        '#61B3E4', // kInfoColor
        '#4EE2E2', // kSuccessColor
        '#F6B333', // kWarningColor
    ];

    const getBrandColor = (index: number) => {
        return brandColors[index % brandColors.length];
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.currentTarget;
        target.style.display = 'none';
        // Show fallback div if needed (parent background handled via state or css)
    };

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-10 pb-20">
            {/* Top Grid: Hero (Welcome + Goal) & Sidebar Stats - Equal Height */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
                {/* Hero Card - Left (2/3 width) */}
                <div className="lg:col-span-2 h-full">
                    <CurrentGoalCard
                        pursuingCareerId={pursuingCareerId}
                        userName={userProfile?.fullName || "Student"}
                        className="h-full"
                    />
                </div>

                {/* Sidebar - Right (1/3 width) - Combined Stats */}
                <div className="lg:col-span-1 h-full flex flex-col gap-6">
                    <StatsCard
                        totalPoints={totalPoints}
                        medalData={medalData}
                        tierData={tierData}
                        className="h-full"
                    />

                    {/* Weekly Progress - If StatsCard doesn't take full height, this fills remaining, or we can combine logic. 
                        User asked for "Stats and points as a combined card as sidebar".
                        I will assume the week progress can stay separate or be part of it.
                        The request said "Stats and points ... as the sidebar". 
                        The StatsCard handles Point/Medals/Tier. 
                        Weekly Progress is separate. 
                        Let's put Weekly Progress BELOW StatsCard for now, but ensure the whole COLUMN matches height if possible,
                        OR just let them stack. "Equal height" usually refers to the main visual blocks.
                        If I make StatsCard h-full, it might stretch too much if there's little content.
                        Let's keep StatsCard as the main sidebar item for 'Stats & Points'.
                    */}
                    <Card className="h-fit">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-card-foreground text-sm">{t("userDashboard.weeklyProgress.title")}</h3>
                                    <p className="text-[10px] text-muted-foreground">{t("userDashboard.weeklyProgress.subtitle")}</p>
                                </div>
                            </div>
                            <div className="relative h-2.5 bg-muted rounded-full mb-3 overflow-hidden">
                                <div className="absolute top-0 left-0 h-full w-[0%] bg-accent rounded-full" />
                            </div>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span>{t("userDashboard.weeklyProgress.remaining", { hours: 23 })}</span>
                                <span className="font-bold text-foreground">{t("userDashboard.weeklyProgress.completion", { percent: 0 })}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Content Carousels - Full Width Below */}
            <div className="space-y-12">
                {/* Stories Carousel */}
                {stories.length > 0 && (
                    <DashboardSection title={t("userDashboard.sections.stories")} icon={<Bell className="text-destructive" />}>
                        <Carousel itemWidth={300}>
                            {stories.map((story, index) => (
                                <div
                                    key={story.id}
                                    onClick={() => handleStoryClick(story)}
                                    className="flex-none w-[300px] h-64 rounded-xl relative overflow-hidden cursor-pointer group border border-border bg-card transition-all hover:border-accent/50"
                                >
                                    {/* Image or Solid Color Fallback */}
                                    <div className="absolute inset-0 bg-muted" style={{ backgroundColor: getBrandColor(index) }} />
                                    {story.image && (
                                        <img
                                            src={story.image}
                                            alt={story.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={handleImageError}
                                        />
                                    )}

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    {/* Content - Lower aligned */}
                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <Badge className="mb-2 bg-accent text-accent-foreground border-none backdrop-blur-md">{story.category}</Badge>
                                        <h3 className="text-lg font-bold text-white leading-tight group-hover:underline decoration-accent underline-offset-4 line-clamp-2">{story.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </Carousel>
                    </DashboardSection>
                )}

                {/* Good Reads Carousel */}
                {goodReads.length > 0 && (
                    <DashboardSection title={t("userDashboard.sections.goodReads")} icon={<BookOpen className="text-green-600" />}>
                        <Carousel itemWidth={300}>
                            {goodReads.map((read, index) => (
                                <div
                                    key={read.id}
                                    onClick={() => router.push(`/dashboard/good-reads/${read.id}`)}
                                    className="flex-none w-[300px] h-48 rounded-xl overflow-hidden relative group border border-border bg-card transition-all cursor-pointer hover:border-accent/50"
                                >
                                    <div className="absolute inset-0 bg-muted" style={{ backgroundColor: getBrandColor(index + 2) }} />
                                    {read.image && (
                                        <img
                                            src={read.image}
                                            alt={read.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={handleImageError}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <h3 className="font-bold text-white line-clamp-2 leading-tight">{read.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </Carousel>
                    </DashboardSection>
                )}

                {/* Challenges Carousel */}
                {challenges.length > 0 && (
                    <DashboardSection title={t("userDashboard.sections.challenges")} icon={<Trophy className="text-secondary" />}>
                        <Carousel itemWidth={300}>
                            {challenges.map((challenge, index) => (
                                <div
                                    key={challenge.id}
                                    onClick={() => router.push(`/dashboard/challenges`)}
                                    className="flex-none w-[300px] h-48 rounded-xl overflow-hidden relative group border border-border bg-card transition-all cursor-pointer hover:border-secondary/50"
                                >
                                    <div className="absolute inset-0 bg-muted" style={{ backgroundColor: getBrandColor(index + 4) }} />
                                    {challenge.image && (
                                        <img
                                            src={challenge.image}
                                            alt={challenge.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={handleImageError}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <h3 className="font-bold text-white line-clamp-2 leading-tight">{challenge.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </Carousel>
                    </DashboardSection>
                )}

                {/* Sparks Carousel */}
                {sparks.length > 0 && (
                    <DashboardSection title={t("userDashboard.sections.sparks")} icon={<Zap className="text-accent" />}>
                        <Carousel itemWidth={300}>
                            {sparks.map((spark) => (
                                <div
                                    key={spark.id}
                                    onClick={() => router.push(`/dashboard/sparks/${spark.id}`)}
                                    className="flex-none w-[300px] h-48 rounded-xl relative overflow-hidden cursor-pointer group border border-border bg-card transition-all hover:border-accent flex flex-col justify-between p-5"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                                    <div className="space-y-3 relative z-10">
                                        <Badge variant="outline" className="w-fit border-accent/30 text-accent bg-accent/5">{spark.type}</Badge>
                                        <h3 className="font-bold text-card-foreground line-clamp-3 leading-tight text-lg">{spark.title}</h3>
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground gap-1 mt-2 relative z-10">
                                        <Sparkles size={14} className="text-accent" />
                                        <span>{t("userDashboard.spark.quickLearning")}</span>
                                    </div>
                                </div>
                            ))}
                        </Carousel>
                    </DashboardSection>
                )}

                {/* Games Carousel */}
                {games.length > 0 && (
                    <DashboardSection title={t("userDashboard.sections.games")} icon={<Gamepad2 className="text-purple-500" />}>
                        <Carousel itemWidth={300}>
                            {games.map((game) => {
                                let colorClass = "text-purple-500";
                                let bgClass = "bg-purple-50 dark:bg-purple-900/20";
                                let borderClass = "hover:border-purple-500/50 hover:bg-purple-500/5";

                                if (game.mode === 'quiz') { colorClass = "text-blue-500"; bgClass = "bg-blue-50 dark:bg-blue-900/20"; borderClass = "hover:border-blue-500/50 hover:bg-blue-500/5"; }
                                else if (game.mode === 'puzzle') { colorClass = "text-green-500"; bgClass = "bg-green-50 dark:bg-green-900/20"; borderClass = "hover:border-green-500/50 hover:bg-green-500/5"; }
                                else if (game.mode === 'memory') { colorClass = "text-orange-500"; bgClass = "bg-orange-50 dark:bg-orange-900/20"; borderClass = "hover:border-orange-500/50 hover:bg-orange-500/5"; }

                                const modeLabel = t(`userDashboard.gameModes.${game.mode}`);
                                const resolvedModeLabel = modeLabel === `userDashboard.gameModes.${game.mode}` ? game.mode : modeLabel;

                                return (
                                    <div
                                        key={game.id}
                                        onClick={() => handleFeatureClick(game.title, "game")}
                                        className={`flex-none w-[300px] h-48 rounded-xl relative overflow-hidden cursor-pointer group border border-border bg-card transition-all ${borderClass} flex flex-col justify-between p-5`}
                                    >
                                        <div className={`absolute bottom-0 right-0 w-24 h-24 ${bgClass} rounded-tl-full -mb-6 -mr-6 transition-transform group-hover:scale-125 opacity-50`} />

                                        <div className="space-y-3 relative z-10">
                                            <div className={`p-2 rounded-lg w-fit ${bgClass} ${colorClass}`}>
                                                {game.mode === 'quiz' ? <BookOpen size={20} /> : game.mode === 'puzzle' ? <Puzzle size={20} /> : <Gamepad2 size={20} />}
                                            </div>
                                            <h3 className="font-bold text-card-foreground leading-tight text-lg">{game.title}</h3>
                                        </div>
                                        <div className="relative z-10">
                                            <Badge variant="secondary" className={`text-xs uppercase tracking-wider ${bgClass} ${colorClass}`}>{resolvedModeLabel}</Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </Carousel>
                    </DashboardSection>
                )}
            </div>

            <DownloadAppModal
                isOpen={downloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
                title={selectedFeature}
            />

            {selectedStory && (
                <StorySlideshow
                    story={selectedStory}
                    isOpen={storySlideshowOpen}
                    onClose={() => {
                        setStorySlideshowOpen(false);
                        setSelectedStory(null);
                    }}
                    onComplete={handleStoryComplete}
                    userId={user?.uid}
                />
            )}
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
