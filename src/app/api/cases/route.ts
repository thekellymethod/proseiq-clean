import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/getAuth";

export async function GET() {
  const { supabase, user } = await getAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/cases] error:", error);
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 });
  }

  return NextResponse.json({ cases: data ?? [] }, { status: 200 });
}

export async function POST(req: Request) {
  const { supabase, user } = await getAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = typeof body?.title === "string" && body.title.trim().length > 0 ? body.title.trim() : "New Case";

  const { data, error } = await supabase
    .from("cases")
    .insert({ title, created_by: user.id, status: "active" })
    .select("*")
    .single();

  if (error) {
    console.error("[POST /api/cases] error:", error);
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
  }

  return NextResponse.json({ case: data }, { status: 201 });
}
