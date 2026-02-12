// src/app/dashboard/layout.tsx
import DashboardLogoSplash from "@/components/dashboard/DashboardLogoSplash";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardLogoSplash />
      {children}
    </>
  );
}
