import AppHeader from "@/components/layout/AppHeader";
import BackgroundFX from "@/components/marketing/BackgroundFX";
import LandingHero from "@/components/marketing/LandingHero";
import LandingFeatures from "@/components/marketing/LandingFeatures";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ProseIQ | Case Management for Pro Se Litigants",
  description: "Organize your case, track deadlines, manage exhibits, and draft court-ready documents. ProseIQ helps pro se litigants manage their cases from intake to filing.",
  keywords: "pro se litigant, case management, self-represented, court documents, exhibit labeling, legal timeline, motion drafting, file for court",
};

export default function HomePage() {
  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <AppHeader />
      <LandingHero />
      <LandingFeatures />
      <Footer />
    </div>
  );
}