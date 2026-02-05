// src/lib/caseEvents.ts
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export type CaseEventRow = {
  id: string;
  case_id: string;
  created_by: string;
  created_at: string;
  event_at: string;
  kind: string;
  title: string;
  notes: string | null;
};

const EVENT_SELECT = "id,case_id,created_by,created_at,event_at,kind,title,notes";

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) redirect("/login");
  return { supabase, user: data.user };
}

export async function listUpcomingEvents(days = 7) {
  const { supabase, user } = await requireUser();
  const now = new Date();
  const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("case_events")
    .select(EVENT_SELECT)
    .eq("created_by", user.id)
    .gte("event_at", now.toISOString())
    .lte("event_at", until.toISOString())
    .order("event_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CaseEventRow[];
}

export async function listOverdueEvents() {
  const { supabase, user } = await requireUser();
  const now = new Date();

  const { data, error } = await supabase
    .from("case_events")
    .select(EVENT_SELECT)
    .eq("created_by", user.id)
    .lt("event_at", now.toISOString())
    .order("event_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as CaseEventRow[];
}

export async function listCaseEvents(caseId: string) {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("case_events")
    .select(EVENT_SELECT)
    .eq("created_by", user.id)
    .eq("case_id", caseId)
    .order("event_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CaseEventRow[];
}
