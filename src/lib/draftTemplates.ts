export type DraftTemplateDef = {
  id: string;
  label: string;
  description: string;
};

export const DRAFT_TEMPLATES: DraftTemplateDef[] = [
  { id: "motion", label: "Motion", description: "Standard motion structure (caption, intro, facts, argument, prayer)." },
  { id: "declaration", label: "Declaration", description: "Sworn declaration with numbered paragraphs and signature block." },
  { id: "notice", label: "Notice", description: "Simple court notice with caption and body." },
  { id: "letter", label: "Letter", description: "Formal letter format." },
];

function p(text: string) {
  return text
    ? { type: "paragraph", content: [{ type: "text", text }] }
    : { type: "paragraph" };
}

function h(level: number, text: string) {
  return { type: "heading", attrs: { level }, content: [{ type: "text", text }] };
}

export function templateDoc(templateId: string) {
  switch (templateId) {
    case "motion":
      return {
        type: "doc",
        content: [
          h(2, "[COURT NAME]"),
          p(""),
          p("[PLAINTIFF], Plaintiff,"),
          p("v."),
          p("[DEFENDANT], Defendant."),
          p(""),
          h(2, "MOTION [TITLE]"),
          p(""),
          p("COMES NOW [PARTY] and respectfully moves the Court for the following relief:"),
          p(""),
          h(3, "I. INTRODUCTION"),
          p("[Write a short introduction.]"),
          h(3, "II. FACTS"),
          p("[State relevant facts.]"),
          h(3, "III. ARGUMENT"),
          p("[Develop legal argument with headings as needed.]"),
          h(3, "IV. PRAYER FOR RELIEF"),
          p("[State the requested relief.]"),
          p(""),
          p("Dated: [DATE]"),
          p(""),
          p("Respectfully submitted,"),
          p(""),
          p("[SIGNATURE]"),
          p("[NAME]"),
          p("[TITLE]"),
        ],
      };

    case "declaration":
      return {
        type: "doc",
        content: [
          h(2, "DECLARATION OF [NAME]"),
          p(""),
          p("I, [NAME], declare as follows:"),
          p(""),
          p("1. [Paragraph 1]"),
          p("2. [Paragraph 2]"),
          p("3. [Paragraph 3]"),
          p(""),
          p("I declare under penalty of perjury under the laws of [STATE] that the foregoing is true and correct."),
          p(""),
          p("Executed on [DATE] at [CITY], [STATE]."),
          p(""),
          p("[SIGNATURE]"),
          p("[NAME]"),
        ],
      };

    case "notice":
      return {
        type: "doc",
        content: [
          h(2, "NOTICE [TITLE]"),
          p(""),
          p("PLEASE TAKE NOTICE that [describe notice]."),
          p(""),
          p("Dated: [DATE]"),
          p(""),
          p("[SIGNATURE]"),
          p("[NAME]"),
          p("[TITLE]"),
        ],
      };

    case "letter":
      return {
        type: "doc",
        content: [
          p("[YOUR NAME]"),
          p("[ADDRESS]"),
          p("[CITY, STATE ZIP]"),
          p("[PHONE]"),
          p("[EMAIL]"),
          p(""),
          p("[DATE]"),
          p(""),
          p("[RECIPIENT NAME]"),
          p("[RECIPIENT ADDRESS]"),
          p("[CITY, STATE ZIP]"),
          p(""),
          p("Re: [SUBJECT]"),
          p(""),
          p("Dear [RECIPIENT],"),
          p(""),
          p("[Body]"),
          p(""),
          p("Sincerely,"),
          p(""),
          p("[SIGNATURE]"),
          p("[YOUR NAME]"),
        ],
      };

    default:
      return { type: "doc", content: [{ type: "paragraph" }] };
  }
}

