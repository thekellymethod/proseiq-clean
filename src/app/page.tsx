import AppHeader from "@/components/layout/AppHeader";
import BackgroundFX from "@/components/marketing/BackgroundFX";
import LandingHero from "@/components/marketing/LandingHero";
import LandingFeatures from "@/components/marketing/LandingFeatures";

export default function HomePage() {
  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <AppHeader />
      <LandingHero />
      <LandingFeatures />
      <footer className="border-t border-white/10 bg-black/30">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-white/60">
          © {new Date().getFullYear()} ProseIQ. All rights reserved.
        </div>
      </footer>
    </div>
  );
}