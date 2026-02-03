import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ProseIQ",
  description: "Pro se case workspace: strategy, documents, filings, and drafting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        {children}
      </body>
    </html>
  );
}
