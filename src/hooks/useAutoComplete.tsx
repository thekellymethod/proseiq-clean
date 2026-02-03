"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function useAutoComplete({ children, email, setEmail, mode }: { children: React.ReactNode, email: string, setEmail: (email: string) => void, mode: "signin" | "signup" }) {
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setEmail("test@test.com");
    } catch (err: any) {
      console.error(err);
    }
  }

  return (
      <>
        {children as React.ReactNode}

          <div
            className="absolute top-[64px] z-20 w-full overflow-hidden rounded-md border border-white/10 bg-black/80 backdrop-blur"
            onMouseDown={(e) => e.preventDefault()} // keeps input from losing focus before click
          >
              <div
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-white/10"
              >
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => {
                    setEmail("test@test.com");
                    setOpen(false);
                  }}
                >
                  test@test.com
                </button>

                <button
                  type="button"
                  className="rounded px-2 py-1 text-xs text-white/60 hover:text-white"
                  title="Remove"
                  onClick={() => {}}
                >
                  ✕
                </button>
              </div>
          </div>

          <input
          className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
          value={children as string}
          onChange={(e) => setEmail(e.target.value)}
      autoComplete="email"
      placeholder="you@email.com"
    />
  </>
)}</>