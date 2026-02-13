import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";

function icsEscape(s: string) {
  return String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function toIcsDate(dtIso: string) {
  const d = new Date(dtIso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 500), 1), 2000);

  const [{ data: c }, { data: events, error }] = await Promise.all([
    supabase.from("cases").select("id,title").eq("id", id).maybeSingle(),
    supabase
      .from("case_events")
      .select("id,event_at,kind,title,notes,created_at")
      .eq("case_id", id)
      .order("event_at", { ascending: true })
      .limit(limit),
  ]);

  if (error) return badRequest(error.message);

  const calName = c?.title ? `ProseIQ • ${c.title}` : "ProseIQ • Case";
  const now = new Date().toISOString();

  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ProseIQ//Case Calendar//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${icsEscape(calName)}`,
  ];

  const body = (events ?? []).map((e) => {
    const uid = `proseiq-${id}-${e.id}@proseiq.local`;
    const dtStart = toIcsDate(e.event_at);
    const dtEnd = toIcsDate(new Date(new Date(e.event_at).getTime() + 30 * 60000).toISOString());
    const summary = `${e.kind?.toUpperCase?.() ?? "EVENT"}: ${e.title}`;
    const description = e.notes ? e.notes : "";

    return [
      "BEGIN:VEVENT",
      `UID:${icsEscape(uid)}`,
      `DTSTAMP:${toIcsDate(now)}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${icsEscape(summary)}`,
      `DESCRIPTION:${icsEscape(description)}`,
      "END:VEVENT",
    ].join("\r\n");
  });

  const out = [...header, ...body, "END:VCALENDAR"].join("\r\n") + "\r\n";

  return new NextResponse(out, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="case-${id}.ics"`,
    },
  });
}
