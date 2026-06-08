import Hero from "@/components/Hero";
import FAQ from "@/components/FAQ";
import Benefits from "@/components/Benefits/Benefits";
import Container from "@/components/Container";
import CTA from "@/components/CTA";
import MarketingLayout from "@/components/MarketingLayout";


export default function Home() {
  return (
    <MarketingLayout>
      <Hero />
      <Container>
        <Benefits />
        <FAQ />
        <CTA />

      </Container>
    </MarketingLayout>
  );
}
