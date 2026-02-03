import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function getUserOrRedirect() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return { supabase, user: data.user };
}

export async function getUserOrNull() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}
