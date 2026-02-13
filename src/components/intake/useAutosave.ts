"use client";

import React from "react";

/** Debounced autosave + save on page unload/visibility change to prevent data loss */
export function useAutosave(
  save: () => Promise<void>,
  data: unknown,
  options?: { debounceMs?: number; enabled?: boolean }
) {
  const { debounceMs = 2500, enabled = true } = options ?? {};
  const saveRef = React.useRef(save);
  const dataRef = React.useRef(data);
  const pendingRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = React.useRef<string>("");

  saveRef.current = save;
  dataRef.current = data;

  const performSave = React.useCallback(async () => {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current);
      pendingRef.current = null;
    }
    const snapshot = JSON.stringify(dataRef.current);
    if (snapshot === lastSavedRef.current) return;
    try {
      await saveRef.current();
      lastSavedRef.current = snapshot;
    } catch {
      // Error already shown by save
    }
  }, []);

  // Debounced save when data changes
  React.useEffect(() => {
    if (!enabled) return;
    const snapshot = JSON.stringify(data);
    if (snapshot === lastSavedRef.current) return;

    if (pendingRef.current) clearTimeout(pendingRef.current);
    pendingRef.current = setTimeout(() => {
      pendingRef.current = null;
      void performSave();
    }, debounceMs);

    return () => {
      if (pendingRef.current) clearTimeout(pendingRef.current);
    };
  }, [data, debounceMs, enabled, performSave]);

  // Save on visibility change (tab hidden, minimize) and beforeunload
  React.useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void performSave();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const snapshot = JSON.stringify(dataRef.current);
      if (snapshot !== lastSavedRef.current) {
        e.preventDefault();
      }
    };

    const handlePageHide = () => {
      void performSave();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [enabled, performSave]);
}
