"use client";

import Link from "next/link";

export default function TopNav() {
  return (
    <header className="border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="font-semibold tracking-wide">
          Prose<span className="text-amber-300">IQ</span>
        </Link>
      </div>
    </header>
  );
}
