import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";

function lines(text: any): string[] {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const { data: intakeRow } = await supabase
    .from("case_intakes")
    .select("intake")
    .eq("case_id", id)
    .maybeSingle();

  const intake = (intakeRow?.intake ?? {}) as any;

  const { data: existingEvents } = await supabase
    .from("case_events")
    .select("id")
    .eq("case_id", id)
    .limit(1);

  const now = new Date();
  const plusDays = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();

  if (!existingEvents || existingEvents.length === 0) {
    const seedEvents = [
      { case_id: id, event_at: now.toISOString(), kind: "note", title: "Intake captured", notes: "Baseline facts entered into ProseIQ intake." },
      { case_id: id, event_at: plusDays(7), kind: "deadline", title: "Check/compute response deadlines", notes: "Verify service date and compute response deadline per forum rules." },
      { case_id: id, event_at: plusDays(14), kind: "filing", title: "Draft first filing / response", notes: "Start with caption, jurisdictional allegations, and core elements." },
    ];
    const { error } = await supabase.from("case_events").insert(seedEvents);
    if (error) return badRequest(error.message);
  }

  const { data: existingExhibits, error: exhibitsErr } = await supabase
    .from("case_exhibits")
    .select("id")
    .eq("case_id", id)
    .limit(1);

  if (!exhibitsErr && (!existingExhibits || existingExhibits.length === 0)) {
    const have = lines(intake?.evidence_have);
    const seed = (have.length ? have : ["Contract / agreement", "Communications (texts/emails)", "Invoices/receipts", "Bank records"]).slice(0, 12);
    const payload = seed.map((title: string, i: number) => ({
      case_id: id,
      title,
      description: "Seeded from intake. Attach documents and refine description.",
      exhibit_index: i + 1,
      exhibit_label: `Exhibit ${i + 1}`,
      kind: "document",
    }));
    await supabase.from("case_exhibits").insert(payload);
  }

  const { data: existingDrafts, error: draftsErr } = await supabase
    .from("case_drafts")
    .select("id")
    .eq("case_id", id)
    .limit(1);

  if (!draftsErr && (!existingDrafts || existingDrafts.length === 0)) {
    const plaintiff = intake?.plaintiff_name ?? "Plaintiff";
    const defendant = intake?.defendant_name ?? "Defendant";
    const court = intake?.court_name ?? "____ Court";
    const cause = intake?.case_number ?? "__________";

    const complaint = {
      case_id: id,
      kind: "pleading",
      status: "draft",
      title: "Petition / Complaint (draft)",
      content_md: [
        `# ${plaintiff} v. ${defendant}`,
        ``,
        `**In the ${court}**`,
        ``,
        `Cause No. ${cause}`,
        ``,
        `## Parties`,
        `- ${plaintiff} (Plaintiff)`,
        `- ${defendant} (Defendant)`,
        ``,
        `## Jurisdiction and Venue`,
        `- [Fill in forum jurisdictional allegations]`,
        ``,
        `## Facts`,
        intake?.facts_narrative ? intake.facts_narrative : `- [Write a chronological narrative with dates, amounts, names, admissions.]`,
        ``,
        `## Claims`,
        lines(intake?.claims_text).length ? lines(intake.claims_text).map((c: string) => `- ${c}`).join("\n") : `- [List claims and elements]`,
        ``,
        `## Damages`,
        `- Actual: $${Number(intake?.damages_actual ?? 0).toLocaleString()}`,
        `- Incidental: $${Number(intake?.damages_incidental ?? 0).toLocaleString()}`,
        `- Statutory: $${Number(intake?.damages_statutory ?? 0).toLocaleString()}`,
        ``,
        `## Prayer`,
        `Plaintiff requests judgment and all relief to which they are entitled.`,
      ].join("\n"),
    };

    const motion = {
      case_id: id,
      kind: "motion",
      status: "draft",
      title: "Motion (skeleton)",
      content_md: [
        `# Motion (draft)`,
        ``,
        `## Relief requested`,
        `- [State exactly what you want the court/arbitrator to do.]`,
        ``,
        `## Grounds`,
        `- [List rule/statute + facts supporting it.]`,
        ``,
        `## Evidence`,
        `- [Cite exhibits by label. Attach declarations as needed.]`,
        ``,
        `## Certificate of service`,
        `- [If required]`,
      ].join("\n"),
    };

    await supabase.from("case_drafts").insert([complaint, motion]);
  }

  return NextResponse.json({ ok: true });
}
