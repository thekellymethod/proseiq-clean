import React from "react";
import AppHeader from "@/components/layout/AppHeader";
import BackgroundFX from "@/components/marketing/BackgroundFX";
import ContentFadeIn from "@/components/ui/ContentFadeIn";

export default function Template({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white">
      <BackgroundFX />
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-white/70">{subtitle}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>

        <ContentFadeIn>
          <div className="mt-6">{children}</div>
        </ContentFadeIn>
      </main>
    </div>
  );
}