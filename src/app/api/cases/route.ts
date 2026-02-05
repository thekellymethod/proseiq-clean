
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const title = String(body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const insert = {
    title,
    status: String(body.status ?? "intake"),
    case_type: String(body.case_type ?? "General"),
    forum: String(body.forum ?? "Court"),
    priority: String(body.priority ?? "Normal"),
  };

  const { data, error } = await supabase.from("cases").insert(insert as any).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ item: data });
}
