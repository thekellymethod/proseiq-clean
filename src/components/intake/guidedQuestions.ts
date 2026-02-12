// src/components/intake/guidedQuestions.ts
// Question flow for guided intake — same data as form, tailored by jurisdiction and case type.

import type { IntakeData, PartyRole } from "./types";

export type QuestionInputType = "text" | "textarea" | "select" | "multiline" | "number" | "party_full" | "select_or_other";

export type GuidedQuestion = {
  id: string;
  text: string;
  subtext?: string;
  placeholder?: string;
  inputType: QuestionInputType;
  field: string;
  options?: { value: string; label: string }[];
  optional?: boolean;
  nextMap?: Record<string, string>;
  allowOther?: boolean; // Show "Other (specify)" option
  allowIdk?: boolean;   // Show "I don't know" option
};

const JURISDICTIONS = [
  { value: "texas", label: "Texas (state)" },
  { value: "california", label: "California (state)" },
  { value: "new-york", label: "New York (state)" },
  { value: "florida", label: "Florida (state)" },
  { value: "federal", label: "Federal" },
  { value: "other", label: "Other" },
];

const CASE_TYPES = [
  { value: "civil", label: "Civil litigation (plaintiff vs defendant)" },
  { value: "family", label: "Family law (petitioner vs respondent)" },
  { value: "contract", label: "Contract dispute" },
  { value: "employment", label: "Employment" },
  { value: "consumer", label: "Consumer protection" },
  { value: "other", label: "Other" },
];

const PARTY_ROLES_CIVIL = [
  { value: "plaintiff", label: "Plaintiff" },
  { value: "defendant", label: "Defendant" },
  { value: "witness", label: "Witness" },
  { value: "other", label: "Other" },
];

const PARTY_ROLES_FAMILY = [
  { value: "petitioner", label: "Petitioner" },
  { value: "respondent", label: "Respondent" },
  { value: "witness", label: "Witness" },
  { value: "other", label: "Other" },
];

export const ALL_QUESTIONS: GuidedQuestion[] = [
  {
    id: "case_type",
    text: "What type of case is this?",
    subtext: "This helps us tailor the questions to your situation.",
    inputType: "select",
    field: "basics.caseType",
    options: CASE_TYPES,
    nextMap: { civil: "jurisdiction", family: "jurisdiction", contract: "jurisdiction", employment: "jurisdiction", consumer: "jurisdiction", other: "jurisdiction" },
  },
  {
    id: "jurisdiction",
    text: "Where is the case filed or will be filed?",
    subtext: "Jurisdiction affects court rules and procedures.",
    inputType: "select",
    field: "basics.jurisdiction",
    options: JURISDICTIONS,
  },
  {
    id: "court",
    text: "Which court?",
    subtext: "e.g., District Court, County Court, or Federal District Court",
    inputType: "text",
    field: "basics.court",
    placeholder: "e.g., 44th District Court, Dallas County",
  },
  {
    id: "plaintiff_name",
    text: "Plaintiff or Petitioner name",
    subtext: "The case title will be formatted as Plaintiff v. Defendant (or Petitioner v. Respondent).",
    inputType: "text",
    field: "basics.plaintiffName",
    placeholder: "e.g., Jane Kelly",
  },
  {
    id: "defendant_name",
    text: "Defendant or Respondent name",
    inputType: "text",
    field: "basics.defendantName",
    placeholder: "e.g., Public Storage",
  },
  {
    id: "description",
    text: "What best describes this case?",
    subtext: "Select the option that most closely matches your situation.",
    inputType: "select_or_other",
    field: "basics.description",
    options: [
      { value: "breach-of-contract", label: "Breach of contract" },
      { value: "negligence", label: "Negligence / personal injury" },
      { value: "consumer-protection", label: "Consumer protection" },
      { value: "employment", label: "Employment dispute" },
      { value: "property", label: "Property dispute" },
      { value: "debt-collection", label: "Debt collection" },
      { value: "family", label: "Family law (divorce, custody, etc.)" },
      { value: "harassment", label: "Harassment" },
      { value: "theft", label: "Theft" },
      { value: "vandalism", label: "Vandalism" },
    ],
    allowOther: true,
    allowIdk: true,
  },
  {
    id: "description_other",
    text: "Please describe your case in your own words.",
    inputType: "textarea",
    field: "basics.description",
    placeholder: "Start with the core dispute, then key events…",
    optional: true,
  },
  {
    id: "case_number_status",
    text: "What is the filing status?",
    inputType: "select",
    field: "basics.caseNumberStatus",
    options: [
      { value: "has-number", label: "Case filed – I have a case number" },
      { value: "filed-pending", label: "Case filed – case number pending" },
      { value: "not-filed", label: "Case not filed yet – no case number" },
      { value: "original-petition", label: "Original petition – creating on information after it was filed" },
    ],
    nextMap: { "has-number": "case_number", "filed-pending": "jury_trial", "not-filed": "jury_trial", "original-petition": "jury_trial" },
  },
  {
    id: "case_number",
    text: "Enter the case number",
    inputType: "text",
    field: "basics.caseNumber",
    placeholder: "e.g., CV-2026-12345",
  },
  {
    id: "jury_trial",
    text: "Jury or non-jury trial?",
    inputType: "select",
    field: "basics.juryTrial",
    options: [
      { value: "jury", label: "Jury trial" },
      { value: "non-jury", label: "Non-jury trial" },
      { value: "unknown", label: "I don't know yet" },
    ],
  },
  {
    id: "party_1_role",
    text: "Who is the first party you’re adding?",
    subtext: "We’ll use plaintiff/defendant or petitioner/respondent based on your case type.",
    inputType: "select",
    field: "parties[0].role",
    options: PARTY_ROLES_CIVIL,
  },
  {
    id: "party_1_name",
    text: "What is their name?",
    inputType: "text",
    field: "parties[0].name",
    placeholder: "Full legal name or company",
  },
  {
    id: "party_1_contact",
    text: "Contact info for this party? (optional)",
    inputType: "text",
    field: "parties[0].email",
    optional: true,
    placeholder: "Email or phone",
  },
  {
    id: "add_party_prompt",
    text: "Add another party?",
    subtext: "Include name, role, contact, and demographics in one entry.",
    inputType: "select",
    field: "temp.addParty",
    options: [
      { value: "yes", label: "Yes, add another" },
      { value: "no", label: "No, continue" },
    ],
    nextMap: { yes: "add_party_full", no: "claims" },
  },
  {
    id: "add_party_full",
    text: "Enter this party's details",
    subtext: "Role, name, contact, and any demographics — all in one place.",
    inputType: "party_full",
    field: "parties.append",
    optional: false,
  },
  {
    id: "claims",
    text: "What are your main claims?",
    subtext: "One per line. Use the Legal reference panel for an extensive list of possible claims.",
    inputType: "multiline",
    field: "claims",
    placeholder: "e.g., Breach of contract\nNegligence\nFCRA: inaccurate reporting\nNegligent misrepresentation",
  },
  {
    id: "defenses",
    text: "What defenses do you expect the other side to raise?",
    subtext: "One per line.",
    inputType: "multiline",
    field: "defenses",
    placeholder: "e.g., Statute of limitations\nFailure to mitigate\nArbitration clause",
  },
  {
    id: "facts_narrative",
    text: "Tell us the story in order.",
    subtext: "Timeline narrative in plain language.",
    inputType: "textarea",
    field: "facts.narrative",
    placeholder: "Start with what happened, then major events in order…",
  },
  {
    id: "key_dates",
    text: "Any key dates to highlight?",
    subtext: "e.g., Notice sent, filing deadline, hearing date.",
    inputType: "textarea",
    field: "facts.keyDates",
    optional: true,
    placeholder: "01/10/2026 – Notice sent\n01/22/2026 – Locked out",
  },
  {
    id: "damages",
    text: "What damages are you seeking?",
    subtext: "List items and amounts, one per line. Use format: Label – $amount",
    inputType: "multiline",
    field: "damages.items",
    placeholder: "Storage fees – 2500\nRepair costs – 800\nLost wages – 5000",
  },
  {
    id: "damages_narrative",
    text: "Explain the harm and why the amounts are reasonable. (optional)",
    inputType: "textarea",
    field: "damages.narrative",
    optional: true,
    placeholder: "Brief explanation of damages…",
  },
  {
    id: "evidence",
    text: "What evidence do you have?",
    subtext: "One item per line. You can upload documents later.",
    inputType: "multiline",
    field: "evidence",
    placeholder: "e.g., Lease agreement PDF\nEmail thread with landlord\nPhotos of damage",
  },
  {
    id: "review",
    text: "Review complete",
    subtext: "You’ve provided the key information. Save and generate when ready.",
    inputType: "text",
    field: "meta.review",
    optional: true,
  },
];

export function getPartyRoleOptions(data: IntakeData): { value: string; label: string }[] {
  const caseType = (data.basics as any)?.caseType ?? "civil";
  return caseType === "family" ? PARTY_ROLES_FAMILY : PARTY_ROLES_CIVIL;
}

export function getQuestionById(id: string, data: IntakeData): GuidedQuestion | null {
  const q = ALL_QUESTIONS.find((x) => x.id === id);
  if (!q) return null;
  // Dynamic options for party roles
  if (q.id === "party_1_role" || q.id === "add_party_full") {
    return { ...q, options: getPartyRoleOptions(data) };
  }
  return q;
}

export function getNextQuestionId(currentId: string, data: IntakeData): string | null {
  const idx = ALL_QUESTIONS.findIndex((q) => q.id === currentId);
  if (idx < 0) return null;

  const current = ALL_QUESTIONS[idx];
  const val = getFieldValue(data, current.field);

  // Branching for description
  if (current.id === "description" && val === "other") return "description_other";
  if (current.id === "description" && val && val !== "other") return "case_number_status";
  if (current.id === "description_other") return "case_number_status";

  const nextFromMap = current.nextMap;
  if (nextFromMap && val) {
    const next = nextFromMap[String(val)];
    if (next) return next;
  }

  if (current.id === "case_number") return "jury_trial";

  const nextIdx = idx + 1;
  if (nextIdx >= ALL_QUESTIONS.length) return "review";
  const nextQ = ALL_QUESTIONS[nextIdx];
  return nextQ.id;
}

export function getFirstQuestionId(): string {
  return ALL_QUESTIONS[0]?.id ?? "case_type";
}

/** Section key -> first question id for that section (for targeted updates) */
export const UPDATE_SECTIONS: { key: string; label: string; questionId: string }[] = [
  { key: "basics", label: "Case basics & jurisdiction", questionId: "case_type" },
  { key: "parties", label: "Parties", questionId: "party_1_role" },
  { key: "claims", label: "Claims & defenses", questionId: "claims" },
  { key: "facts", label: "Facts & key dates", questionId: "facts_narrative" },
  { key: "damages", label: "Damages", questionId: "damages" },
  { key: "evidence", label: "Evidence", questionId: "evidence" },
];

function getFieldValue(data: IntakeData, field: string): any {
  const parts = field.split(".");
  let v: any = data;
  for (const p of parts) {
    if (v == null) return undefined;
    const match = p.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      const key = match[1];
      const i = parseInt(match[2], 10);
      v = v[key]?.[i];
    } else {
      v = v[p];
    }
  }
  return v;
}

export function setFieldValue(
  data: IntakeData,
  field: string,
  value: any
): IntakeData {
  const parts = field.split(".");
  const result = JSON.parse(JSON.stringify(data));

  const setAt = (obj: any, path: string[], val: any) => {
    if (path.length === 1) {
      obj[path[0]] = val;
      return;
    }
    const [head, ...rest] = path;
    const match = head.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      const key = match[1];
      const i = parseInt(match[2], 10);
      if (!obj[key]) obj[key] = [];
      while (obj[key].length <= i) obj[key].push(null);
      if (rest.length === 0) {
        obj[key][i] = val;
      } else {
        if (!obj[key][i] || typeof obj[key][i] !== "object") obj[key][i] = {};
        setAt(obj[key][i], rest, val);
      }
    } else {
      if (!obj[head] || typeof obj[head] !== "object") obj[head] = {};
      setAt(obj[head], rest, val);
    }
  };

  const pathParts = parts.map((p) => {
    const m = p.match(/^(\w+)\[(\d+)\]$/);
    return m ? [m[1], m[2]] : [p];
  }).flat();

  // Handle multiline -> array (preserve empty lines and spaces for display; filter only when saving)
  if (field === "claims" || field === "defenses") {
    const arr = typeof value === "string"
      ? value.split(/\r?\n/).map((s) => s) // preserve spaces and empty lines
      : Array.isArray(value) ? value : [];
    result[field] = arr;
    return result;
  }

  if (field === "damages.items") {
    const text = typeof value === "string" ? value : "";
    const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const items = lines.map((line) => {
      const dash = line.indexOf(" – ") >= 0 ? line.indexOf(" – ") : line.indexOf(" - ");
      const dollar = line.indexOf("$");
      if (dash > 0) {
        const label = line.slice(0, dash).trim();
        const rest = line.slice(dash + 3).trim();
        const amountStr = dollar >= 0 ? rest.replace(/^.*\$/, "").replace(/,/g, "").trim() : rest.replace(/,/g, "").trim();
        const amount = parseFloat(amountStr) || undefined;
        return { label, amount, notes: "" };
      }
      return { label: line, amount: undefined, notes: "" };
    });
    result.damages = result.damages ?? {};
    result.damages.items = items;
    return result;
  }

  if (field === "evidence") {
    const text = typeof value === "string" ? value : "";
    const lines = text.split(/\r?\n/).map((s) => s); // preserve spaces
    result.evidence = lines.filter((l) => l.trim()).map((label) => ({ label, notes: "" }));
    return result;
  }

  if (field === "parties.append") {
    const party = typeof value === "object" && value && !Array.isArray(value)
      ? value as { role?: string; name?: string; email?: string; phone?: string; notes?: string }
      : null;
    if (party && (party.name ?? "").trim()) {
      const existing = result.parties ?? [];
      const role = (party.role as PartyRole) || "other";
      existing.push({
        role: ["plaintiff", "defendant", "petitioner", "respondent", "witness", "other"].includes(role) ? role : "other",
        name: (party.name ?? "").trim(),
        email: (party.email ?? "").trim() || undefined,
        phone: (party.phone ?? "").trim() || undefined,
        notes: (party.notes ?? "").trim() || undefined,
      });
      result.parties = existing;
    }
    return result;
  }

  setAt(result, parts, value);

  // Auto-build title: Plaintiff v. Defendant (or Petitioner v. Respondent for family)
  if (field === "basics.plaintiffName" || field === "basics.defendantName") {
    const p = (result.basics?.plaintiffName ?? "").trim();
    const d = (result.basics?.defendantName ?? "").trim();
    const caseType = (result.basics as any)?.caseType ?? "civil";
    const vs = caseType === "family" ? "Petitioner v. Respondent" : "Plaintiff v. Defendant";
    if (p && d) {
      result.basics = result.basics ?? {};
      result.basics.title = `${p} v. ${d}`;
    }
  }

  return result;
}
