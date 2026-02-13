/**
 * Reference data for analysis: statute of limitations and all 50 states.
 * Used by the analysis page for SOL and jurisdiction sections.
 * Values are typical ranges; users must verify with primary sources.
 */

export type StateInfo = {
  code: string;
  name: string;
  /** Typical SOL for personal injury (years) */
  personalInjuryYears?: number;
  /** Typical SOL for breach of contract (years) */
  contractYears?: number;
  /** Typical SOL for property damage (years) */
  propertyYears?: number;
  /** Typical SOL for defamation (years) */
  defamationYears?: number;
  /** Notes (e.g., discovery rule, tolling) */
  notes?: string;
};

/** All 50 US states + DC for jurisdiction analysis */
export const US_STATES: StateInfo[] = [
  { code: "AL", name: "Alabama", personalInjuryYears: 2, contractYears: 6, defamationYears: 2 },
  { code: "AK", name: "Alaska", personalInjuryYears: 2, contractYears: 3, defamationYears: 2 },
  { code: "AZ", name: "Arizona", personalInjuryYears: 2, contractYears: 6, defamationYears: 1 },
  { code: "AR", name: "Arkansas", personalInjuryYears: 3, contractYears: 5, defamationYears: 1 },
  { code: "CA", name: "California", personalInjuryYears: 2, contractYears: 4, defamationYears: 1 },
  { code: "CO", name: "Colorado", personalInjuryYears: 2, contractYears: 6, defamationYears: 1 },
  { code: "CT", name: "Connecticut", personalInjuryYears: 2, contractYears: 6, defamationYears: 2 },
  { code: "DE", name: "Delaware", personalInjuryYears: 2, contractYears: 3, defamationYears: 2 },
  { code: "DC", name: "District of Columbia", personalInjuryYears: 3, contractYears: 3, defamationYears: 1 },
  { code: "FL", name: "Florida", personalInjuryYears: 4, contractYears: 5, defamationYears: 2 },
  { code: "GA", name: "Georgia", personalInjuryYears: 2, contractYears: 6, defamationYears: 1 },
  { code: "HI", name: "Hawaii", personalInjuryYears: 2, contractYears: 6, defamationYears: 2 },
  { code: "ID", name: "Idaho", personalInjuryYears: 2, contractYears: 5, defamationYears: 2 },
  { code: "IL", name: "Illinois", personalInjuryYears: 2, contractYears: 5, defamationYears: 1 },
  { code: "IN", name: "Indiana", personalInjuryYears: 2, contractYears: 6, defamationYears: 2 },
  { code: "IA", name: "Iowa", personalInjuryYears: 2, contractYears: 5, defamationYears: 2 },
  { code: "KS", name: "Kansas", personalInjuryYears: 2, contractYears: 5, defamationYears: 1 },
  { code: "KY", name: "Kentucky", personalInjuryYears: 1, contractYears: 15, defamationYears: 1 },
  { code: "LA", name: "Louisiana", personalInjuryYears: 1, contractYears: 10, defamationYears: 1, notes: "Civil law state" },
  { code: "ME", name: "Maine", personalInjuryYears: 6, contractYears: 6, defamationYears: 2 },
  { code: "MD", name: "Maryland", personalInjuryYears: 3, contractYears: 3, defamationYears: 1 },
  { code: "MA", name: "Massachusetts", personalInjuryYears: 3, contractYears: 6, defamationYears: 3 },
  { code: "MI", name: "Michigan", personalInjuryYears: 3, contractYears: 6, defamationYears: 1 },
  { code: "MN", name: "Minnesota", personalInjuryYears: 2, contractYears: 6, defamationYears: 2 },
  { code: "MS", name: "Mississippi", personalInjuryYears: 3, contractYears: 3, defamationYears: 1 },
  { code: "MO", name: "Missouri", personalInjuryYears: 5, contractYears: 5, defamationYears: 2 },
  { code: "MT", name: "Montana", personalInjuryYears: 3, contractYears: 8, defamationYears: 2 },
  { code: "NE", name: "Nebraska", personalInjuryYears: 4, contractYears: 5, defamationYears: 1 },
  { code: "NV", name: "Nevada", personalInjuryYears: 2, contractYears: 6, defamationYears: 2 },
  { code: "NH", name: "New Hampshire", personalInjuryYears: 3, contractYears: 3, defamationYears: 3 },
  { code: "NJ", name: "New Jersey", personalInjuryYears: 2, contractYears: 6, defamationYears: 1 },
  { code: "NM", name: "New Mexico", personalInjuryYears: 3, contractYears: 6, defamationYears: 3 },
  { code: "NY", name: "New York", personalInjuryYears: 3, contractYears: 6, defamationYears: 1 },
  { code: "NC", name: "North Carolina", personalInjuryYears: 3, contractYears: 3, defamationYears: 1 },
  { code: "ND", name: "North Dakota", personalInjuryYears: 6, contractYears: 6, defamationYears: 2 },
  { code: "OH", name: "Ohio", personalInjuryYears: 2, contractYears: 8, defamationYears: 1 },
  { code: "OK", name: "Oklahoma", personalInjuryYears: 2, contractYears: 5, defamationYears: 1 },
  { code: "OR", name: "Oregon", personalInjuryYears: 2, contractYears: 6, defamationYears: 1 },
  { code: "PA", name: "Pennsylvania", personalInjuryYears: 2, contractYears: 4, defamationYears: 1 },
  { code: "RI", name: "Rhode Island", personalInjuryYears: 3, contractYears: 10, defamationYears: 1 },
  { code: "SC", name: "South Carolina", personalInjuryYears: 3, contractYears: 3, defamationYears: 2 },
  { code: "SD", name: "South Dakota", personalInjuryYears: 3, contractYears: 6, defamationYears: 2 },
  { code: "TN", name: "Tennessee", personalInjuryYears: 1, contractYears: 6, defamationYears: 1 },
  { code: "TX", name: "Texas", personalInjuryYears: 2, contractYears: 4, defamationYears: 1 },
  { code: "UT", name: "Utah", personalInjuryYears: 4, contractYears: 6, defamationYears: 1 },
  { code: "VT", name: "Vermont", personalInjuryYears: 3, contractYears: 6, defamationYears: 3 },
  { code: "VA", name: "Virginia", personalInjuryYears: 2, contractYears: 5, defamationYears: 1 },
  { code: "WA", name: "Washington", personalInjuryYears: 3, contractYears: 6, defamationYears: 2 },
  { code: "WV", name: "West Virginia", personalInjuryYears: 2, contractYears: 10, defamationYears: 1 },
  { code: "WI", name: "Wisconsin", personalInjuryYears: 3, contractYears: 6, defamationYears: 2 },
  { code: "WY", name: "Wyoming", personalInjuryYears: 4, contractYears: 10, defamationYears: 1 },
];

/** Map claim type keywords to SOL category for lookup */
export const CLAIM_TO_SOL_CATEGORY: Record<string, keyof Pick<StateInfo, "personalInjuryYears" | "contractYears" | "propertyYears" | "defamationYears">> = {
  negligence: "personalInjuryYears",
  "personal injury": "personalInjuryYears",
  malpractice: "personalInjuryYears",
  "breach of contract": "contractYears",
  contract: "contractYears",
  defamation: "defamationYears",
  libel: "defamationYears",
  slander: "defamationYears",
  property: "propertyYears",
  trespass: "propertyYears",
};

/** Default SOL when no state match (years) */
export const DEFAULT_SOL: Record<string, number> = {
  personalInjuryYears: 2,
  contractYears: 5,
  defamationYears: 2,
  propertyYears: 3,
};
