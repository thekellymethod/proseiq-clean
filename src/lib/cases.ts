import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/getAuth";

export type CaseRow = {
  id: string;
  title: string;
  created_at?: string;
  user_id?: string;
};

export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
 
  if (!data?.user) redirect("/login");

  return { supabase, user: data.user };

}

export async function listCases() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("cases")
    .select("id,title,created_at,user_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as CaseRow[];
}

export async function getCaseById(id: string) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("cases")
    .select("id,title,created_at,user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw new Error(error.message);
  return data as CaseRow;
}

export async function createCase(input: {
  title: string;
  case_type: string;
  status?: string;
  court?: string;
  judge?: string;
  case_number?: string;
}) {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("cases")
    .insert({
      user_id: user.id,              // ✅ critical for RLS
      title: input.title,
      case_type: input.case_type,
      status: input.status ?? "intake",
      court: input.court ?? null,
      judge: input.judge ?? null,
      case_number: input.case_number ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCase(id: string, title: string) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("cases")
    .update({ title })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id,title,created_at,user_id")
    .single();

  if (error) throw new Error(error.message);
  return data as CaseRow;
}
