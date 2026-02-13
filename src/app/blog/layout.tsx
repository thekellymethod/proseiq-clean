import AppHeader from "@/components/layout/AppHeader";
import BackgroundFX from "@/components/marketing/BackgroundFX";

export const metadata = {
  title: "The Litigation Architect | ProseIQ Blog",
  description:
    "Strategic insight on procedural foundations, litigation strategy, legal literacy, and case dissections. Thought leadership for pro se litigants.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <AppHeader />
      <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>
    </div>
  );
}
