export type IssueSeverity = "error" | "warning";

export type FilingIssue = {
  id: string;
  severity: IssueSeverity;
  title: string;
  detail?: string;
  hint?: string;
  meta?: Record<string, any>;
};

export type ServiceMethod =
  | "certified_mail"
  | "email"
  | "efile_provider"
  | "process_server"
  | "publication"
  | "other";

export type FilingServiceRecipient = {
  name: string;
  addressOrEmail?: string;
  method?: ServiceMethod;
  details?: string;
};

export type FilingSettings = {
  ignoredIssueIds?: string[];
  service?: {
    enabled?: boolean;
    date?: string; // freeform
    recipients?: FilingServiceRecipient[];
    methodDefault?: ServiceMethod;
    methodDetails?: string;
  };
  notary?: {
    enabled?: boolean;
    type?: "jurat" | "acknowledgment";
    state?: string;
    county?: string;
    date?: string;
    notaryName?: string;
    commissionExpires?: string;
  };
  proposedOrder?: {
    enabled?: boolean;
    title?: string;
    judgeName?: string;
    judgeTitle?: string;
    date?: string;
  };
};

export type CaseParty = { role?: string | null; name?: string | null };
export type CaseExhibit = { label?: string | null; sequence?: number | null; title?: string | null };
export type PinnedAuthority = { citation?: string | null; title?: string | null; url?: string | null };

export type FilingReadinessInput = {
  draftTitle: string;
  rich?: any | null;
  plain?: string | null;
  intake?: any | null;
  parties?: CaseParty[] | null;
  exhibits?: CaseExhibit[] | null;
  pinned?: PinnedAuthority[] | null;
  filing?: FilingSettings | null;
};

function fnv1a(str: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    // 32-bit FNV-1a
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function issueId(kind: string, seed: string) {
  return `${kind}:${fnv1a(seed)}`;
}

function norm(s: any) {
  return String(s ?? "").replace(/\r/g, "");
}

function normalizeWhitespace(s: string) {
  return norm(s)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function textFromRich(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.type === "text") return String(node.text ?? "");
  if (node.type === "hardBreak") return "\n";
  const kids = Array.isArray(node.content) ? node.content : [];
  return kids.map(textFromRich).join("");
}

export function richToPlain(doc: any): string {
  // Convert Tiptap doc to plain text with paragraph breaks.
  const out: string[] = [];
  function walk(node: any) {
    if (!node) return;
    const type = node.type;
    if (type === "heading" || type === "paragraph") {
      out.push(normalizeWhitespace(textFromRich(node)));
      out.push(""); // paragraph break
      return;
    }
    if (type === "bulletList" || type === "orderedList") {
      const ordered = type === "orderedList";
      const items = Array.isArray(node.content) ? node.content : [];
      let idx = 1;
      for (const it of items) {
        if (it?.type !== "listItem") continue;
        const t = normalizeWhitespace(textFromRich(it));
        const prefix = ordered ? `${idx}. ` : "- ";
        out.push(`${prefix}${t}`.trim());
        idx++;
      }
      out.push("");
      return;
    }
    const kids = Array.isArray(node.content) ? node.content : [];
    for (const k of kids) walk(k);
  }
  walk(doc);
  const joined = out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return joined;
}

function extractBodyText(input: FilingReadinessInput) {
  if (input.rich && typeof input.rich === "object") return richToPlain(input.rich);
  return norm(input.plain ?? "");
}

function getCourtName(intake: any) {
  const venue = String(intake?.venue ?? "").trim();
  const jurisdiction = String(intake?.jurisdiction ?? "").trim();
  const forum = String(intake?.forum ?? "").trim();
  return venue || jurisdiction || (forum ? `${forum} FORUM` : "");
}

function joinNames(names: Array<string | null | undefined>) {
  const clean = names.map((x) => String(x ?? "").trim()).filter(Boolean);
  return clean.join(", ");
}

function pickParties(parties: CaseParty[]) {
  const pls = parties
    .filter((p) => ["plaintiff", "petitioner"].includes(String(p.role ?? "").toLowerCase()))
    .map((p) => p.name ?? "")
    .filter(Boolean);
  const defs = parties
    .filter((p) => ["defendant", "respondent"].includes(String(p.role ?? "").toLowerCase()))
    .map((p) => p.name ?? "")
    .filter(Boolean);
  return { plaintiffs: pls, defendants: defs };
}

function detectPlaceholders(text: string) {
  const out: string[] = [];
  const re = /\[[A-Z0-9 _-]{2,}\]/g;
  const matches = text.match(re) ?? [];
  for (const m of matches) out.push(m);
  return Array.from(new Set(out)).slice(0, 25);
}

function detectExhibitRefs(text: string) {
  const refs: string[] = [];
  const patterns = [
    /\bExhibit\s+(\d+)\b/gi,
    /\bEx\.\s*(\d+)\b/gi,
    /\bEX-(\d{3,})\b/gi,
    /\bC-(\d{3,})\b/gi,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      refs.push(m[0]);
    }
  }
  return Array.from(new Set(refs)).slice(0, 50);
}

function detectCitationCandidates(text: string) {
  const candidates: string[] = [];
  const patterns = [
    // Common reporters
    /\b\d+\s+(?:U\.S\.|S\.Ct\.|L\.Ed\.2d|F\.(?:\d+d|\d+th|Supp\.?\s*\d*)|P\.(?:2d|3d)|So\.(?:2d|3d))\s+\d+(?:,\s*\d+)?\s*\([^)]*\b(18|19|20)\d{2}\b[^)]*\)/g,
    // Reporter-ish without parenthetical (to warn)
    /\b\d+\s+(?:U\.S\.|S\.Ct\.|L\.Ed\.2d|F\.(?:\d+d|\d+th|Supp\.?\s*\d*)|P\.(?:2d|3d)|So\.(?:2d|3d))\s+\d+(?:,\s*\d+)?\b/g,
    // Westlaw / Lexis
    /\b\d{4}\s+WL\s+\d+\b(?:\s*\([^)]*\))?/g,
    /\b\d{4}\s+LEXIS\s+\d+\b(?:\s*\([^)]*\))?/g,
    // Statutes / sections
    /\b[A-Z][A-Za-z.&\s]{2,}\s+§\s*\d[\w.\-()]*\b/g,
  ];
  for (const re of patterns) {
    const ms = text.match(re);
    if (ms) candidates.push(...ms);
  }
  return Array.from(new Set(candidates.map((x) => x.trim()))).slice(0, 50);
}

function bluebookLint(cite: string): FilingIssue[] {
  const issues: FilingIssue[] = [];
  const c = cite.trim();
  if (!c) return issues;

  // v. spacing
  if (/\bv\s\b/i.test(c) && !/\bv\.\b/i.test(c)) {
    issues.push({
      id: issueId("bluebook_vdot", c),
      severity: "warning",
      title: "Possible Bluebook issue: use “v.” in case names",
      detail: `Citation contains “v” without a period: “${c}”`,
      hint: "Bluebook typically uses “v.” (with period) in case names.",
      meta: { cite: c },
    });
  }

  // Parenthetical with year
  const hasYearParen = /\([^)]*\b(18|19|20)\d{2}\b[^)]*\)/.test(c);
  const looksLikeCase = /\b(U\.S\.|S\.Ct\.|F\.|P\.|So\.|L\.Ed\.2d)\b/.test(c) || /\bWL\b|\bLEXIS\b/.test(c);
  if (looksLikeCase && !hasYearParen) {
    issues.push({
      id: issueId("bluebook_parenthetical", c),
      severity: "warning",
      title: "Possible Bluebook issue: missing court/year parenthetical",
      detail: `Citation may be missing a “(Court Year)” parenthetical: “${c}”`,
      hint: "Most case citations include a parenthetical with the court (if needed) and year.",
      meta: { cite: c },
    });
  }

  // Pincite (very heuristic)
  const hasPincite = /,\s*\d+/.test(c);
  const hasFirstPage = /\b\d+\s+(?:U\.S\.|S\.Ct\.|L\.Ed\.2d|F\.(?:\d+d|\d+th|Supp\.?\s*\d*)|P\.(?:2d|3d)|So\.(?:2d|3d))\s+\d+\b/.test(c);
  if (looksLikeCase && hasFirstPage && !hasPincite) {
    issues.push({
      id: issueId("bluebook_pincite", c),
      severity: "warning",
      title: "Possible Bluebook issue: missing pincite",
      detail: `Consider adding a pincite (specific page) if you are quoting or relying on a particular proposition: “${c}”`,
      hint: "Example: “123 F.3d 456, 460 (5th Cir. 2020)” when citing a specific page.",
      meta: { cite: c },
    });
  }

  return issues;
}

export function analyzeFilingReadiness(input: FilingReadinessInput): { issues: FilingIssue[]; ignored: string[] } {
  const issues: FilingIssue[] = [];
  const filing: FilingSettings = input.filing ?? {};
  const ignored = Array.isArray(filing.ignoredIssueIds) ? filing.ignoredIssueIds : [];

  const text = extractBodyText(input);
  const intake = input.intake ?? {};
  const parties = input.parties ?? [];
  const exhibits = input.exhibits ?? [];
  const pinned = input.pinned ?? [];

  // Caption checks
  const courtName = getCourtName(intake);
  const { plaintiffs, defendants } = pickParties(parties);
  if (!courtName) {
    issues.push({
      id: "caption:court_missing",
      severity: "warning",
      title: "Caption is missing court/venue/jurisdiction",
      hint: "Fill in Intake: Venue/Jurisdiction (or Forum) so the caption renders correctly.",
    });
  }
  if (!plaintiffs.length) {
    issues.push({
      id: "caption:plaintiff_missing",
      severity: "warning",
      title: "Caption is missing a Plaintiff/Petitioner party",
      hint: "Add parties (Plaintiff/Petitioner) in the Parties tab so exports can build a proper caption.",
    });
  }
  if (!defendants.length) {
    issues.push({
      id: "caption:defendant_missing",
      severity: "warning",
      title: "Caption is missing a Defendant/Respondent party",
      hint: "Add parties (Defendant/Respondent) in the Parties tab so exports can build a proper caption.",
    });
  }
  const caseNo = String(intake?.case_number ?? "").trim();
  if (!caseNo) {
    issues.push({
      id: "caption:case_number_missing",
      severity: "warning",
      title: "Case number is missing (if assigned)",
      hint: "If a case number has been assigned, add it in Intake so it appears on filings.",
    });
  }

  // Template placeholders
  const placeholders = detectPlaceholders(text);
  if (placeholders.length) {
    issues.push({
      id: issueId("placeholders", placeholders.join("|")),
      severity: "warning",
      title: "Draft still contains template placeholders",
      detail: placeholders.slice(0, 10).join(", ") + (placeholders.length > 10 ? "…" : ""),
      hint: "Replace placeholders like [DATE], [NAME], [COURT NAME] before filing.",
      meta: { placeholders },
    });
  }

  // Exhibit refs: warn if referenced exhibit number is not present
  const exhibitRefs = detectExhibitRefs(text);
  if (exhibitRefs.length) {
    const knownLabels = new Set(
      exhibits
        .map((e) => String(e.label ?? "").trim())
        .filter(Boolean)
        .map((x) => x.toLowerCase())
    );
    const unknown = exhibitRefs.filter((r) => !knownLabels.has(r.toLowerCase()) && !knownLabels.has(`exhibit ${r.replace(/\D/g, "")}`.toLowerCase()));
    if (unknown.length) {
      issues.push({
        id: issueId("exhibit_refs_unknown", unknown.join("|")),
        severity: "warning",
        title: "Some exhibit references may not match your exhibit list",
        detail: unknown.slice(0, 8).join(", ") + (unknown.length > 8 ? "…" : ""),
        hint: "Check the Exhibits tab: ensure the exhibit labels match what you reference in the draft.",
        meta: { unknown, exhibitRefs },
      });
    }
  }

  // Legal citations: lint only
  const candidates = detectCitationCandidates(text);
  for (const c of candidates) {
    issues.push(...bluebookLint(c));
  }

  // Cross-check against pinned authority (advisory)
  const pinnedCites = pinned.map((p) => String(p.citation ?? "").trim()).filter(Boolean);
  if (candidates.length && pinnedCites.length) {
    const pinnedSet = new Set(pinnedCites.map((x) => x.toLowerCase()));
    const notPinned = candidates.filter((c) => !pinnedSet.has(c.toLowerCase())).slice(0, 10);
    if (notPinned.length) {
      issues.push({
        id: issueId("citations_not_pinned", notPinned.join("|")),
        severity: "warning",
        title: "Some citation-like strings are not in pinned authority",
        detail: notPinned.join("; "),
        hint: "Optional: pin the authority you rely on so it’s tracked with the case research.",
      });
    }
  }

  // Certificate of service requirements if enabled
  if (filing?.service?.enabled) {
    const recips = filing.service.recipients ?? [];
    const hasRecipient = recips.some((r) => String(r?.name ?? "").trim());
    if (!hasRecipient) {
      issues.push({
        id: "service:recipients_missing",
        severity: "error",
        title: "Certificate of service enabled but recipients are missing",
        hint: "Add at least one recipient (name and method) for service.",
      });
    }
    const hasMethod = recips.some((r) => r?.method) || Boolean(filing.service.methodDefault);
    if (!hasMethod) {
      issues.push({
        id: "service:method_missing",
        severity: "error",
        title: "Certificate of service enabled but service method is missing",
        hint: "Choose a service method (certified mail, email, e-filing provider, process server, publication, other).",
      });
    }
    const hasDate = String(filing.service.date ?? "").trim();
    if (!hasDate) {
      issues.push({
        id: "service:date_missing",
        severity: "warning",
        title: "Certificate of service is missing a date",
        hint: "Add the date of service (freeform is ok).",
      });
    }
  }

  // Notary requirements if enabled
  if (filing?.notary?.enabled) {
    const type = String(filing.notary.type ?? "").trim();
    if (!type) {
      issues.push({
        id: "notary:type_missing",
        severity: "error",
        title: "Notary block enabled but type is missing",
        hint: "Choose whether you need a jurat or an acknowledgment.",
      });
    }
    const state = String(filing.notary.state ?? "").trim();
    const county = String(filing.notary.county ?? "").trim();
    if (!state || !county) {
      issues.push({
        id: "notary:venue_missing",
        severity: "warning",
        title: "Notary block missing state/county",
        hint: "Fill the notary state and county so the block is complete.",
      });
    }
  }

  // Proposed order requirements if enabled
  if (filing?.proposedOrder?.enabled) {
    const title = String(filing.proposedOrder.title ?? "").trim();
    if (!title) {
      issues.push({
        id: "order:title_missing",
        severity: "warning",
        title: "Proposed order enabled but title is missing",
        hint: "Set the proposed order title (e.g., “Proposed Order Granting Motion…”).",
      });
    }
  }

  // Apply ignore list (but keep ignored list returned)
  const filtered = issues.filter((i) => !ignored.includes(i.id));
  return { issues: filtered, ignored };
}

export function mergeFilingSettings(base: FilingSettings | null | undefined, patch: Partial<FilingSettings>) {
  return {
    ...(base ?? {}),
    ...(patch ?? {}),
    service: { ...(base?.service ?? {}), ...(patch?.service ?? {}) },
    notary: { ...(base?.notary ?? {}), ...(patch?.notary ?? {}) },
    proposedOrder: { ...(base?.proposedOrder ?? {}), ...(patch?.proposedOrder ?? {}) },
  } as FilingSettings;
}

