"use client"

import WaitlistButton from "./WaitlistButton"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "@/i18n/language-provider"

const CTA = () => {
    const { t } = useTranslations()

    return (
        <section id="cta" className="my-16">
            <Card className="relative overflow-hidden border-0 bg-primary text-white">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-10 right-10 h-40 w-40 rounded-full bg-sky-500/30 blur-2xl" />
                    <div className="absolute bottom-0 left-10 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
                </div>
                <CardContent className="relative px-6 py-12 text-center sm:px-12">
                    <Badge className="bg-amber-500 text-black">{t("home.cta.badge")}</Badge>
                    <h2 className="mt-4 text-2xl sm:text-3xl md:text-5xl md:leading-tight font-semibold max-w-2xl mx-auto">
                        {t("home.cta.title")}
                    </h2>
                    <p className="mt-4 mx-auto max-w-xl text-white/80">
                        {t("home.cta.description")}
                    </p>
                    <div className="mt-6 flex items-center justify-center">
                        <WaitlistButton />
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}

export default CTA
