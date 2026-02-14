import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const COOKIE_NAME = "admin_token";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!ADMIN_SECRET || token !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.redirect(new URL("/admin", req.url));
}
