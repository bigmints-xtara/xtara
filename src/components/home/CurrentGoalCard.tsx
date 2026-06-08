"use client";

import { CareerPath, getCareerPathById } from "@/lib/firebase/career-helpers";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/language-provider";

interface CurrentGoalCardProps {
  pursuingCareerId?: string;
  userName?: string;
  className?: string;
}

export default function CurrentGoalCard({
  pursuingCareerId,
  userName,
  className,
}: CurrentGoalCardProps) {
  const [career, setCareer] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslations();

  useEffect(() => {
    const fetchCareer = async () => {
      if (!pursuingCareerId) {
        setCareer(null);
        return;
      }

      setLoading(true);
      try {
        const data = await getCareerPathById(pursuingCareerId);
        setCareer(data);
      } catch (error) {
        console.error("Error fetching pursuing career:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCareer();
  }, [pursuingCareerId]);

  const GreetingHeader = ({ isLight = false }: { isLight?: boolean }) => (
    <div className="mb-1">
      <h1
        className={`text-xl font-bold ${isLight ? "text-white" : "text-card-foreground"} flex items-center gap-2`}
      >
        {t("currentGoalCard.greeting.hello", {
          name: userName || t("currentGoalCard.greeting.fallbackName"),
        })}{" "}
        <span className="text-lg">✨</span>
      </h1>
      <p
        className={`${isLight ? "text-sky-100/70" : "text-muted-foreground"} text-sm`}
      >
        {t("currentGoalCard.greeting.welcome")}
      </p>
    </div>
  );

  if (!pursuingCareerId) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl p-8 group transition-all flex flex-col justify-end ${className}`}
      >
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url('/images/nightsky.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#003763] via-[#003763]/60 to-transparent" />

        <div className="relative z-10 text-white">
          <GreetingHeader isLight />
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs text-sky-300 font-bold mb-1 uppercase tracking-wider">
                {t("currentGoalCard.emptyState.eyebrow")}
              </p>
              <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
                {t("currentGoalCard.emptyState.title")}
              </h2>
              <p className="text-sky-100/70 mb-6 max-w-md text-sm">
                {t("currentGoalCard.emptyState.description")}
              </p>
            </div>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-white hover:text-[#003763] text-white font-bold rounded-xl transition-all active:scale-95 w-fit text-sm"
            >
              {t("currentGoalCard.emptyState.cta")} <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`bg-[#003763] rounded-2xl p-8 animate-pulse text-center flex flex-col justify-end ${className}`}
      >
        <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
        <div className="h-3 w-48 bg-white/10 rounded mb-8"></div>
        <div className="h-10 w-64 bg-white/10 rounded mb-2"></div>
        <div className="h-4 w-24 bg-white/10 rounded"></div>
      </div>
    );
  }

  if (!career) return null;

  return (
    <Link href={`/careers/${career.id}`} className={`block ${className}`}>
      <div className="relative overflow-hidden rounded-2xl p-8 group transition-all cursor-pointer h-full flex flex-col justify-end border border-white/10">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url('/images/nightsky.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#003763] via-[#003763]/40 to-transparent" />

        <div className="relative z-10 text-white">
          <GreetingHeader isLight />

          <div className="mt-8">
            <p className="text-xs text-sky-300 font-bold mb-1 uppercase tracking-wider">
              {t("currentGoalCard.pursuing.label")}
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-accent transition-colors">
              {career.title}
            </h2>
            <div className="flex items-center gap-2 text-sky-100/80">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-sm font-medium">
                {t("currentGoalCard.pursuing.status")}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute right-8 bottom-8 h-14 w-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-accent transition-all group-hover:scale-110">
          <ChevronRight
            className="text-white group-hover:translate-x-0.5 transition-transform"
            size={24}
          />
        </div>
      </div>
    </Link>
  );
}
