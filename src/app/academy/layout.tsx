import AppHeader from "@/components/layout/AppHeader";
import BackgroundFX from "@/components/marketing/BackgroundFX";

export const metadata = {
  title: "ProseIQ Academy | Blueprint Series",
  description:
    "Transform confused litigants into structured operators. Foundational literacy, tactical competence, and strategic litigation training.",
};

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <AppHeader />
      <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>
    </div>
  );
}
