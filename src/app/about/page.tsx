import type { Metadata } from "next";
import Container from "@/components/Container";
import Breadcrumb from "@/components/Breadcrumb";
import BenefitSection from "@/components/Benefits/BenefitSection";
import Stats from "@/components/Stats";
import CTA from "@/components/CTA";
import { aboutData } from "@/data/aboutData";
import { aboutSections } from "@/data/aboutSections";

export const metadata: Metadata = {
  title: aboutData.metadata.title,
  description: aboutData.metadata.description,
  keywords: aboutData.metadata.keywords,
  openGraph: {
    title: aboutData.metadata.title,
    description: aboutData.metadata.description,
    images: [aboutData.metadata.ogImage],
  },
};

const AboutPage = () => {
  return (
    <Container>
      <div className="py-4 px-6 md:py-6 md:px-8">
        <div className="mb-8 mt-24 md:mt-24 mt-24">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/' },
              { label: 'About' }
            ]} 
          />
        </div>

        {/* Hero Section */}
        <div className="relative isolate overflow-hidden bg-gradient-to-br from-ocean-navy via-ocean-navy to-sky-blue py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                {aboutData.content['Hero Section']['Heading']}
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-200">
                {aboutData.content['Hero Section']['Subheading']}
              </p>
            </div>
          </div>
        </div>

        {/* Mission and Story Sections */}
        <div id="about-sections" className="mt-24">
          {aboutSections.map((section, index) => {
            return <BenefitSection key={index} benefit={section} imageAtRight={index % 2 !== 0} />
          })}
        </div>

        {/* Stats Section */}
        <Stats />

        {/* CTA Section */}
        <CTA />
      </div>
    </Container>
  );
};

export default AboutPage; 