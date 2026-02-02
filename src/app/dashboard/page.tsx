import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/getAuth";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const { user } = await getAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="mt-2 opacity-70 text-sm">Authenticated session is active.</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-6 border rounded-xl p-4">
        <div className="text-sm opacity-70">Signed in as</div>
        <div className="font-medium">{user.email ?? user.id}</div>
      </div>
    </main>
  );
}
