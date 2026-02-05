
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(_: Request, { params }: { params: { jobId: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: job, error } = await supabase
    .from("bundle_jobs")
    .select("id,status,output_bucket,output_path")
    .eq("id", params.jobId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (job.status !== "done" || !job.output_bucket || !job.output_path) {
    return NextResponse.json({ error: "Bundle not ready" }, { status: 400 });
  }

  const signed = await supabase.storage.from(job.output_bucket).createSignedUrl(job.output_path, 120);
  if (signed.error) return NextResponse.json({ error: signed.error.message }, { status: 400 });

  return NextResponse.json({ url: signed.data.signedUrl });
}
