// src/lib/cases.ts
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export type CaseRow = {
  id: string;
  title: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
};

const CASE_SELECT = "id,title,status,created_by,created_at,updated_at,user_id";

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) redirect("/login");
  return { supabase, user: data.user };
}

export async function listCases() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("cases")
    .select(CASE_SELECT)
    .eq("created_by", user.id)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as CaseRow[];
}

export async function getCaseById(id: string) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("cases")
    .select(CASE_SELECT)
    .eq("id", id)
    .eq("created_by", user.id)
    .single();

  if (error) throw new Error(error.message);
  return data as CaseRow;
}

export async function createCase(input: { title: string; status?: string }) {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("cases")
    .insert({
      created_by: user.id,
      title: input.title,
      status: input.status ?? "active",
      updated_at: new Date().toISOString(),
    })
    .select(CASE_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as CaseRow;
}

export async function updateCase(id: string, patch: Partial<Pick<CaseRow, "title" | "status">>) {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("cases")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("created_by", user.id)
    .select(CASE_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as CaseRow;
}
