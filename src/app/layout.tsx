import "./globals.css";
import type { Metadata } from "next";
import PageTransition from "@/components/ui/PageTransition";
import AuthSplashGate from "@/components/dashboard/AuthSplashGate";

export const metadata: Metadata = {
  title: {
    default: "ProseIQ | Case Management for Pro Se Litigants",
    template: "%s | ProseIQ",
  },
  description: "Organize your case, track deadlines, manage exhibits, and draft court-ready documents. ProseIQ helps pro se litigants manage their cases from intake to filing.",
  keywords: "pro se litigant, case management, self-represented, court documents, exhibit labeling, legal timeline, motion drafting, file for court",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-blue-500 text-white">
        <AuthSplashGate />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
