import Container from "@/components/Container";
import Breadcrumb from "@/components/Breadcrumb";
import BenefitSection from "@/components/Benefits/BenefitSection";
import Stats from "@/components/Stats";
import CTA from "@/components/CTA";
import MarketingLayout from "@/components/MarketingLayout";
import { Award, Globe, GraduationCap, Heart, Star, Target, Users } from "lucide-react";
import { getLocaleFromCookie } from "@/i18n/server";
import { getMessages } from "@/i18n/messages";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookie();
  const messages = getMessages(locale);
  return {
    title: messages.about.metadata.title,
    description: messages.about.metadata.description,
    keywords: messages.about.metadata.keywords,
    openGraph: {
      title: messages.about.metadata.title,
      description: messages.about.metadata.description,
      images: [messages.about.metadata.ogImage],
    },
  };
}

const AboutPage = async () => {
  const locale = await getLocaleFromCookie();
  const messages = getMessages(locale);
  const sectionIcons = [
    [Target, Award, Heart],
    [Target, Award, Users],
  ];
  const sections = messages.about.sections.map((section, sectionIndex) => ({
    ...section,
    bullets: section.bullets.map((bullet, bulletIndex) => ({
      ...bullet,
      icon: (() => {
        const Icon = sectionIcons[sectionIndex]?.[bulletIndex] ?? Target;
        return <Icon size={26} />;
      })(),
    })),
  }));
  const stats = [
    { ...messages.about.stats[0], icon: <GraduationCap size={34} className="text-indigo-600" /> },
    { ...messages.about.stats[1], icon: <Star size={34} className="text-yellow-500" /> },
    { ...messages.about.stats[2], icon: <Globe size={34} className="text-green-600" /> },
  ];

  return (
    <MarketingLayout>
      <Container>
        <div className="py-4 px-6 md:py-6 md:px-8">
          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: messages.common.breadcrumb.home, href: "/" },
                { label: messages.common.breadcrumb.about },
              ]}
            />
          </div>

          <div className="relative isolate overflow-hidden bg-gradient-to-br from-primary via-primary to-sky-500 py-24 sm:py-32 rounded-3xl">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  {messages.about.hero.title}
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-200">
                  {messages.about.hero.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div id="about-sections" className="mt-24">
            {sections.map((section, index) => {
              return (
                <BenefitSection
                  key={index}
                  benefit={section}
                  imageAtRight={index % 2 !== 0}
                />
              );
            })}
          </div>

          <Stats items={stats} />
          <CTA />
        </div>
      </Container>
    </MarketingLayout>
  );
};

export default AboutPage;
