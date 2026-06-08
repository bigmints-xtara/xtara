"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    Briefcase,
    Building2,
    GraduationCap,
    Handshake,
    School,
    Users,
} from "lucide-react"
import { useTranslations } from "@/i18n/language-provider"

const Benefits = () => {
    const { t, messages } = useTranslations()
    const audiences = [
        { ...messages.home.benefits.audiences[0], icon: GraduationCap },
        { ...messages.home.benefits.audiences[1], icon: Users },
        { ...messages.home.benefits.audiences[2], icon: Handshake },
        { ...messages.home.benefits.audiences[3], icon: School },
        { ...messages.home.benefits.audiences[4], icon: Building2 },
        { ...messages.home.benefits.audiences[5], icon: Briefcase },
    ];

    return (
        <section id="features" className="py-16">
            <div className="mx-auto max-w-3xl text-center">
                <Badge variant="secondary" className="bg-muted text-foreground border border-border">
                    {t("home.benefits.badge")}
                </Badge>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground">
                    {t("home.benefits.title")}
                </h2>
                <p className="mt-3 text-muted-foreground">
                    {t("home.benefits.description")}
                </p>
            </div>

            <div className="mt-10 -mx-2 flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory px-6 scroll-px-6 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:px-0 md:pb-0 lg:grid-cols-3 lg:gap-8">
                {audiences.map((audience) => {
                    const Icon = audience.icon;
                    return (
                        <Card key={audience.title} className="w-[70vw] shrink-0 border-border/80 snap-start md:w-auto md:min-w-0">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {audience.title}
                                    </h3>
                                </div>
                                <p className="mt-3 text-sm text-muted-foreground text-left">
                                    {audience.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-16">
                <div className="mx-auto max-w-3xl text-center">
                    <Badge variant="secondary" className="bg-muted text-foreground border border-border">
                        {t("home.benefits.featuresBadge")}
                    </Badge>
                    <h3 className="mt-4 text-2xl md:text-3xl font-bold text-foreground">
                        {t("home.benefits.featuresTitle")}
                    </h3>
                    <p className="mt-3 text-muted-foreground">
                        {t("home.benefits.featuresDescription")}
                    </p>
                </div>

                <div className="mt-10 -mx-2 flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory px-6 scroll-px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-8 lg:px-0 lg:pb-0">
                    {messages.home.benefits.segments.map((segment) => (
                        <Card key={segment.badge} className="w-[70vw] shrink-0 border-border/80 snap-start lg:w-auto lg:min-w-0">
                            <CardContent className="p-6">
                                <Badge className="bg-primary text-white">{segment.badge}</Badge>
                                <h4 className="mt-4 text-lg font-semibold text-foreground text-left">
                                    {segment.title}
                                </h4>
                                <ul className="mt-4 space-y-3 text-sm text-muted-foreground text-left">
                                    {segment.bullets.map((bullet) => (
                                        <li key={bullet} className="flex items-start gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Benefits
