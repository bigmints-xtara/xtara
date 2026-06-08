"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Award } from "lucide-react";
import { TierData, MedalData } from "@/lib/firebase/achievements-service";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n/language-provider";

interface StatsCardProps {
    totalPoints: number;
    medalData: MedalData | null;
    tierData: TierData | null;
    className?: string; // Allow custom classes
}

export default function StatsCard({ totalPoints, medalData, tierData, className }: StatsCardProps) {
    if (totalPoints === 0 && !medalData && !tierData) return null;
    const { t } = useTranslations();

    return (
        <Card className={`h-full flex flex-col justify-center ${className}`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-secondary" />
                    {t("statsCard.title")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Points */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <Target size={18} />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">{t("statsCard.totalPoints")}</span>
                    </div>
                    <span className="text-xl font-bold text-primary">{totalPoints.toLocaleString()}</span>
                </div>

                {/* Medals */}
                {medalData && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary/10 rounded-full text-secondary">
                                <Award size={18} />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">{t("statsCard.medals")}</span>
                        </div>
                        <span className="text-xl font-bold text-secondary-foreground">{medalData.total}</span>
                    </div>
                )}

                {/* Tier */}
                {tierData && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent/10 rounded-full text-accent">
                                <Trophy size={18} />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">{t("statsCard.currentTier")}</span>
                        </div>
                        <Badge variant="outline" className="border-accent text-accent font-bold px-3 py-1 capitalize">
                            {tierData.name}
                        </Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
