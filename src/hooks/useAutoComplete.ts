"use client";

import { useEffect, useMemo, useState } from "react";

type UseAutoCompleteOptions = {
  storageKey?: string;
  limit?: number;
};

const DEFAULT_KEY = "proseiq:loginEmails";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string");
  } catch {
    return [];
  }
}

function writeList(key: string, list: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // ignore (privacy mode, quota, etc.)
  }
}

export function useAutoComplete(query: string, opts: UseAutoCompleteOptions = {}) {
  const storageKey = opts.storageKey ?? DEFAULT_KEY;
  const limit = opts.limit ?? 7;

  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    setItems(readList(storageKey));
  }, [storageKey]);

  const suggestions = useMemo(() => {
    const q = (query ?? "").trim().toLowerCase();
    if (!q) return items.slice(0, limit);
    return items.filter((e) => e.toLowerCase().includes(q)).slice(0, limit);
  }, [items, query, limit]);

  function rememberEmail(email: string) {
    const e = (email ?? "").trim();
    if (!e) return;
    if (!EMAIL_RE.test(e)) return;

    setItems((prev) => {
      const normalized = e.toLowerCase();
      const next = [e, ...prev.filter((x) => x.toLowerCase() !== normalized)].slice(0, 20);
      writeList(storageKey, next);
      return next;
    });
  }

  function removeEmail(email: string) {
    const e = (email ?? "").trim().toLowerCase();
    if (!e) return;

    setItems((prev) => {
      const next = prev.filter((x) => x.toLowerCase() !== e);
      writeList(storageKey, next);
      return next;
    });
  }

  function clearAll() {
    setItems([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }

  return { suggestions, rememberEmail, removeEmail, clearAll };
}
