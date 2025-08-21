import type { Metadata } from "next";
import Hero from "@/components/Hero";
import FAQ from "@/components/FAQ";
import Logos from "@/components/Logos";
import Benefits from "@/components/Benefits/Benefits";
import Container from "@/components/Container";
import CTA from "@/components/CTA";
import { homeData } from "@/data/homeData";

export const metadata: Metadata = {
  title: homeData.metadata.title,
  description: homeData.metadata.description,
  keywords: homeData.metadata.keywords,
  openGraph: {
    title: homeData.metadata.title,
    description: homeData.metadata.description,
    images: [homeData.metadata.ogImage],
    url: homeData.metadata.canonicalUrl,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: homeData.metadata.title,
    description: homeData.metadata.description,
    images: [homeData.metadata.ogImage],
  },
  alternates: {
    canonical: homeData.metadata.canonicalUrl,
  },
};

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <Logos />
      {/* <div className="h-[50px]"></div> */}
      <Container>

        <Benefits />
        {/*
        <Section
          id="pricing"
          title="Pricing"
          description="Simple, transparent pricing. No surprises."
        >
          <Pricing />
        </Section>
        */}
        <FAQ />
       
        <CTA />
      </Container>
    </>
  );
};

export default HomePage;
