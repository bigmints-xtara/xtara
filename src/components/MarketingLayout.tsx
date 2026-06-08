import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface MarketingLayoutProps {
  children: ReactNode;
}

const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  return (
    <div className="min-h-screen bg-ivory-white text-foreground">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default MarketingLayout;
