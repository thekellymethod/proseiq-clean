"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLogoSplash from "./DashboardLogoSplash";

const STORAGE_KEY = "proseiq_splash";

export function setSplashOnSignIn() {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, "signin");
  }
}

export function setSplashOnSignOut() {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, "signout");
  }
}

export default function AuthSplashGate() {
  const pathname = usePathname();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = window.sessionStorage.getItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);

    const afterSignIn = pathname?.startsWith("/dashboard") && flag === "signin";
    const afterSignOut = (pathname === "/" || pathname === "/login") && flag === "signout";

    if (afterSignIn || afterSignOut) {
      setShouldShow(true);
    }
  }, [pathname]);

  if (!shouldShow) return null;

  return <DashboardLogoSplash />;
}
