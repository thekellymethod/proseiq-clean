import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { unauthorized, notFound } from "./errors";

export type AuthResult = {
  supabase: SupabaseClient;
  user: User;
  res: null;
};

export type AuthFailure = {
  supabase: SupabaseClient;
  user: null;
  res: NextResponse;
};

/**
 * Require authenticated user for API routes.
 * Returns { supabase, user, res } - if res is non-null, return it immediately.
 */
export async function requireUser(): Promise<AuthResult | AuthFailure> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth?.user) {
    return {
      supabase,
      user: null,
      res: unauthorized(),
    };
  }

  return { supabase, user: auth.user, res: null };
}

/**
 * Require authenticated user AND case ownership.
 * Use for case-scoped API routes (e.g. /api/cases/[id]/...).
 * Returns { supabase, user, res } - if res is non-null, return it immediately.
 */
export async function requireCaseAccess(
  caseId: string
): Promise<AuthResult | AuthFailure> {
  const result = await requireUser();
  if (result.res) return result;

  const { data } = await result.supabase
    .from("cases")
    .select("id")
    .eq("id", caseId)
    .eq("created_by", result.user.id)
    .maybeSingle();

  if (!data) {
    return {
      ...result,
      user: null,
      res: notFound("Case not found or access denied"),
    };
  }

  return result;
}

/**
 * Helper: if auth failed, return the error response.
 * Use at the start of each handler: if (guardAuth(result)) return result.res;
 */
export function guardAuth(result: AuthResult | AuthFailure): result is AuthFailure {
  return result.res !== null;
}
