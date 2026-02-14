import { NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const COOKIE_NAME = "admin_token";

function getCookieFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function requireAdminSecret(
  req: Request
): { ok: true } | { ok: false; res: NextResponse } {
  if (!ADMIN_SECRET) {
    return {
      ok: false,
      res: NextResponse.json(
        { error: "Admin not configured" },
        { status: 503 }
      ),
    };
  }

  const headerSecret = req.headers.get("x-admin-secret");
  const urlToken = new URL(req.url).searchParams.get("token");
  const cookieToken = getCookieFromRequest(req);

  if (
    headerSecret === ADMIN_SECRET ||
    urlToken === ADMIN_SECRET ||
    cookieToken === ADMIN_SECRET
  ) {
    return { ok: true };
  }

  return {
    ok: false,
    res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  };
}

export function isAdminTokenValid(token: string | null): boolean {
  return !!ADMIN_SECRET && token === ADMIN_SECRET;
}

export { COOKIE_NAME };
