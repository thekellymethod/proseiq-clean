import { createClient } from "@/utils/supabase/server";

export async function getAcademyTiers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("academy_tiers")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return null;
  return data ?? [];
}

export async function getAcademyTierBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("academy_tiers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getAcademyModules(tierId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("academy_modules")
    .select("*")
    .eq("tier_id", tierId)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function getAcademyModuleBySlug(tierId: string, slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("academy_modules")
    .select("*")
    .eq("tier_id", tierId)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getAcademyModuleContent(moduleId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("academy_module_content")
    .select("*")
    .eq("module_id", moduleId)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return data ?? [];
}
