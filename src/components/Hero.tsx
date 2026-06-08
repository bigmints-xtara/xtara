"use client";

import WaitlistButton from './WaitlistButton';
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Button } from './ui/button';
import { useTranslations } from "@/i18n/language-provider";

const Hero = () => {
    const { user } = useAuth();
    const isLoggedIn = Boolean(user && !user.isAnonymous);
    const { t, messages } = useTranslations();
    const heroHighlights = messages.home.hero.highlights ?? [];

    return (
        <section
            id="hero"
            className="relative overflow-hidden bg-[#003763] px-5 pt-24 pb-16"
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/30 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-4xl text-center">
                <div className="mb-6 flex justify-center">
                    <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/90">{t("home.hero.badge")}</Badge>
                </div>

                <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
                    {t("home.hero.titleLine1")} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
                        {t("home.hero.titleEmphasis")}
                    </span>
                </h1>

                <p className="mb-8 text-lg text-gray-300 md:text-xl">
                    {t("home.hero.description")}
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <WaitlistButton
                        label={isLoggedIn ? t("home.hero.ctaPrimaryLoggedIn") : t("home.hero.ctaPrimaryLoggedOut")}
                        href={isLoggedIn ? "/dashboard" : "/#waitlist"}
                        eventLabel={isLoggedIn ? "hero_view_progress" : "hero_join_waitlist"}
                        className="h-12 px-8 text-base  shadow-secondary/30"
                    />

                </div>

                {heroHighlights.length > 0 && (
                    <div className="mt-12 -mx-5 flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-6 scroll-px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:px-0 md:pb-0">
                        {heroHighlights.map((highlight) => (
                            <Card
                                key={highlight.title}
                                className="w-[70vw] shrink-0 border-white/10 bg-white/5 text-white snap-start md:w-auto md:min-w-0"
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-1 h-5 w-5 text-amber-500" />
                                        <div className="text-left">
                                            <p className="font-semibold">{highlight.title}</p>
                                            <p className="text-sm text-white/70">{highlight.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Hero;
