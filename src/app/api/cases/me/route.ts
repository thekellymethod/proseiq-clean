import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/getAuth";

export async function GET() {
  const { user } = await getAuth();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user }, { status: 200 });
}
