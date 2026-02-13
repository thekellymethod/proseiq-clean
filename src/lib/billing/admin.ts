/**
 * Admin users bypass subscription restrictions.
 * Set ADMIN_EMAILS in .env (comma-separated) or defaults to test@lifearchitect.com.
 */
const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ?? "test@lifearchitect.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
