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
    description?: string;
    court?: string;
    jurisdiction?: string;
    caseNumber?: string;
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
