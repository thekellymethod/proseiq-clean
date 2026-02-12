// src/components/intake/types.ts

export type PartyRole =
  | "plaintiff"
  | "defendant"
  | "petitioner"
  | "respondent"
  | "witness"
  | "other";

export type IntakeParty = {
  role: PartyRole;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
};

export type DamageItem = {
  label: string;
  amount?: number;
  notes?: string;
};

export type EvidenceItem = {
  label: string;
  notes?: string;
};

export type IntakeData = {
  basics?: {
    title?: string;
    plaintiffName?: string;
    defendantName?: string;
    description?: string;
    court?: string;
    jurisdiction?: string;
    caseNumber?: string;
    caseType?: string;
    caseNumberStatus?: string; // filed-pending | not-filed | has-number | original-petition
    juryTrial?: string; // jury | non-jury | unknown
  };

  parties?: IntakeParty[];

  // MVP: store simple lists; can be upgraded later.
  claims?: string[];
  defenses?: string[];

  facts?: {
    narrative?: string;
    keyDates?: string;
  };

  damages?: {
    items?: DamageItem[];
    narrative?: string;
  };

  evidence?: EvidenceItem[];

  meta?: {
    updatedAt?: string;
    version?: number;
  };
};

export const emptyIntakeData = (): IntakeData => ({
  basics: {},
  parties: [],
  claims: [],
  defenses: [],
  facts: {},
  damages: { items: [], narrative: "" },
  evidence: [],
  meta: { version: 1 },
});

/** Returns true if the intake has meaningful saved data (avoids re-running full questionnaire) */
export function hasExistingIntake(data: IntakeData): boolean {
  if (!data) return false;
  const b = data.basics ?? {};
  if ((b.title ?? "").trim()) return true;
  if ((b.description ?? "").trim()) return true;
  if ((b.court ?? "").trim()) return true;
  if ((b.jurisdiction ?? "").trim()) return true;
  if ((data.parties ?? []).length > 0) return true;
  if ((data.claims ?? []).length > 0) return true;
  if ((data.defenses ?? []).length > 0) return true;
  const f = data.facts ?? {};
  if ((f.narrative ?? "").trim()) return true;
  const d = data.damages ?? {};
  if ((d.items ?? []).length > 0 || (d.narrative ?? "").trim()) return true;
  if ((data.evidence ?? []).length > 0) return true;
  return false;
}
