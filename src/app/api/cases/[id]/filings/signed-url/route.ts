import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const bucket = String(body.bucket ?? "").trim();
  const path = String(body.path ?? "").trim();
  const expiresIn = Number(body.expiresIn ?? 60);

  if (!bucket || !path) return NextResponse.json({ error: "bucket and path required" }, { status: 400 });

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ url: data.signedUrl });
}
