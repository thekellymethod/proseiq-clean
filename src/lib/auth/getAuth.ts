import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function getUserOrRedirect() {
  const supabase = await createClient();
  const { data, error } = await (await supabase).auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return { supabase, user: data.user };
}

export async function getUserOrNull() {
  const supabase = await createClient();
  const { data } = await (await supabase).auth.getUser();
  return data?.user ?? null;
}
