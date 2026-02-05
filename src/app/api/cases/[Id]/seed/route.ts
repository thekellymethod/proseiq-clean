
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function isoPlusDays(days: number) {
  const d = new Date(Date.now() + days * 86400000);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

function buildMilestones(forum: string) {
  const f = (forum || "Court").toLowerCase();
  if (f.includes("arbitr")) {
    return [
      { day: 1, kind: "note", title: "Create case binder and evidence index" },
      { day: 3, kind: "deadline", title: "Identify claims/defenses and governing rules (arbitration)" },
      { day: 7, kind: "deadline", title: "Send preservation / dispute notice (if applicable)" },
      { day: 14, kind: "deadline", title: "Prepare initial statement / demand package" },
      { day: 21, kind: "deadline", title: "File or confirm arbitration demand / fees" },
      { day: 35, kind: "meeting", title: "Case management conference / preliminary call (if scheduled)" },
      { day: 45, kind: "deadline", title: "Discovery plan: requests + exhibits list" },
      { day: 60, kind: "deadline", title: "Draft motion practice outline (if allowed)" },
    ];
  }

  return [
    { day: 1, kind: "note", title: "Assemble core documents and evidence index" },
    { day: 3, kind: "deadline", title: "Identify claims/defenses and elements checklist" },
    { day: 7, kind: "deadline", title: "Send preservation / notice letter (if applicable)" },
    { day: 14, kind: "deadline", title: "Draft initial pleading (petition/complaint/answer)" },
    { day: 21, kind: "deadline", title: "Service plan: who to serve and how" },
    { day: 35, kind: "deadline", title: "Discovery plan: interrogatories/RFP/RFA outline" },
    { day: 50, kind: "deadline", title: "Motion calendar: likely motions + response windows" },
    { day: 70, kind: "hearing", title: "Schedule check: upcoming hearings / conferences" },
  ];
}

function buildExhibitLadder(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const code = `C-${String(i + 1).padStart(3, "0")}`;
    return { code, title: "", description: null, sort: (i + 1) * 10, file_id: null };
  });
}

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: intakeRow } = await supabase
    .from("case_intakes")
    .select("intake")
    .eq("case_id", params.id)
    .single();

  const forum = String(intakeRow?.intake?.forum ?? "Court");
  const matter_type = String(intakeRow?.intake?.matter_type ?? "General");

  const { data: existingEvents } = await supabase.from("case_events").select("id").eq("case_id", params.id).limit(1);

  if ((existingEvents ?? []).length === 0) {
    const milestones = buildMilestones(forum);
    const rows = milestones.map((m) => ({
      case_id: params.id,
      event_at: isoPlusDays(m.day),
      kind: m.kind,
      title: m.title,
      notes: `Seeded milestone • Forum: ${forum} • Matter: ${matter_type}`,
    }));

    const ins = await supabase.from("case_events").insert(rows as any);
    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 400 });
  }

  const { data: existingEx } = await supabase.from("case_exhibits").select("id").eq("case_id", params.id).limit(1);
  if ((existingEx ?? []).length === 0) {
    const ladder = buildExhibitLadder(12).map((x) => ({ ...x, case_id: params.id }));
    const exIns = await supabase.from("case_exhibits").insert(ladder as any);
    if (exIns.error) return NextResponse.json({ error: exIns.error.message }, { status: 400 });
  }

  await supabase.from("cases").update({ status: "active" } as any).eq("id", params.id);

  return NextResponse.json({ ok: true });
}
