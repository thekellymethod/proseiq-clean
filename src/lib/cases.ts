import { createClient } from "@/utils/supabase/server";

export type CaseRow = {
  id: string;
  title: string;
  created_at?: string;
  user_id?: string;
};

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data?.user) throw new Error("Unauthorized");
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

export async function createCase(title: string) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("cases")
    .insert({ title, user_id: user.id })
    .select("id,title,created_at,user_id")
    .single();

  if (error) throw new Error(error.message);
  return data as CaseRow;
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
