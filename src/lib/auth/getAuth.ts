import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/getAuth";

export default async function HomePage() {
  const { user } = await getAuth();
  redirect(user ? "/dashboard" : "/login");
}
!