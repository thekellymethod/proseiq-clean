"use client";

import React from "react";

type Party = {
  role: "plaintiff" | "defendant" | "witness" | "other";
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
};

type IntakeData = {
  parties?: Party[];
};

export default function PartiesStep({
  data,
  setData,
}: {
  data: IntakeData;
  setData: (next: IntakeData) => void;
}) {
  const parties = data.parties ?? [];

  function updateParty(i: number, patch: Partial<Party>) {
    const next = parties.map((p, idx) => (idx === i ? { ...p, ...patch } : p));
    setData({ ...data, parties: next });
  }

  function addParty() {
    setData({
      ...data,
      parties: [
        ...parties,
        { role: "plaintiff", name: "", email: "", phone: "", notes: "" },
      ],
    });
  }

  function removeParty(i: number) {
    const next = parties.filter((_, idx) => idx !== i);
    setData({ ...data, parties: next });
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-white/70">
        Add the main parties first. You can add witnesses later.
      </div>

      <div className="space-y-3">
        {parties.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-white/60">
            No parties yet.
          </div>
        ) : (
          parties.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">
                  Party #{i + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeParty(i)}
                  className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70 hover:bg-black/30"
                >
                  Remove
                </button>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs text-white/70">Role</label>
                  <select
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                    value={p.role}
                    onChange={(e) =>
                      updateParty(i, { role: e.target.value as Party["role"] })
                    }
                  >
                    <option value="plaintiff">Plaintiff</option>
                    <option value="defendant">Defendant</option>
                    <option value="witness">Witness</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-xs text-white/70">Name</label>
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                    value={p.name}
                    onChange={(e) => updateParty(i, { name: e.target.value })}
                    placeholder="Full legal name / company"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs text-white/70">Email (optional)</label>
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                    value={p.email ?? ""}
                    onChange={(e) => updateParty(i, { email: e.target.value })}
                    placeholder="name@domain.com"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs text-white/70">Phone (optional)</label>
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                    value={p.phone ?? ""}
                    onChange={(e) => updateParty(i, { phone: e.target.value })}
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>

              <div className="mt-3 grid gap-2">
                <label className="text-xs text-white/70">Notes (optional)</label>
                <textarea
                  className="min-h-[70px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                  value={p.notes ?? ""}
                  onChange={(e) => updateParty(i, { notes: e.target.value })}
                  placeholder="Relationship, position, what they did, etc."
                />
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={addParty}
        className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20"
      >
        Add party
      </button>
    </div>
  );
}
