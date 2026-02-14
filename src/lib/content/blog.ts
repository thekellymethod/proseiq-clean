import { createClient } from "@/utils/supabase/server";

export async function getBlogPillars() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_pillars")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return null;
  return data ?? [];
}

export async function getBlogPillarBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_pillars")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getBlogArticles(pillarId: string, publishedOnly = true) {
  const supabase = await createClient();
  let query = supabase
    .from("blog_articles")
    .select("*")
    .eq("pillar_id", pillarId)
    .order("sort_order", { ascending: true });

  if (publishedOnly) {
    query = query.not("published_at", "is", null);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getBlogArticleBySlug(pillarId: string, slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("pillar_id", pillarId)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
