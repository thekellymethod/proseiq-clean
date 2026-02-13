import AppHeader from "@/components/layout/AppHeader";
import BackgroundFX from "@/components/marketing/BackgroundFX";
import LandingHero from "@/components/marketing/LandingHero";
import LandingProblem from "@/components/marketing/LandingProblem";
import LandingSolution from "@/components/marketing/LandingSolution";
import LandingFeatures from "@/components/marketing/LandingFeatures";
import LandingTrust from "@/components/marketing/LandingTrust";
import LandingPricing from "@/components/marketing/LandingPricing";
import LandingFinalCTA from "@/components/marketing/LandingFinalCTA";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ProseIQ | Case Management for Pro Se Litigants",
  description: "Everything you need to organize and prepare your case — in one structured workspace. ProseIQ gives self-represented litigants a system to manage filings, evidence, timelines, and drafting.",
  keywords: "pro se litigant, case management, self-represented, court documents, exhibit labeling, legal timeline, motion drafting, file for court",
};

export default function HomePage() {
  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <AppHeader />
      <LandingHero />
      <LandingProblem />
      <LandingSolution />
      <LandingFeatures />
      <LandingTrust />
      <LandingPricing />
      <LandingFinalCTA />
      <Footer />
    </div>
  );
}