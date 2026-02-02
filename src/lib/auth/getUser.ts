import "server-only";
import { createClient } from "@/utils/supabase/server";

export async function getAuth() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return { user: null, userId: null, supabase };
  }

  return { user: data.user, userId: data.user.id, supabase };
}
