import { NextResponse } from "next/server";
import { requireProPlan } from "@/lib/billing/requireActiveSub";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireProPlan();
  if (gate.res) return gate.res;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const res = await fetch(`${BASE_URL}/api/cases/${id}/research/search`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
}
