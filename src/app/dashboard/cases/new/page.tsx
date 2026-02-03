//newcase.jsx

import { redirect } from "next/navigation";
import Template from "@/components/layout/Template";
import { createCase } from "@/lib/cases";

export default function NewCasePage() {
  async function action(formData: FormData) {
    "use server";
    const title = String(formData.get("title") || "").trim();
    if (!title) return;
    const c = await createCase(title);
    redirect(`/dashboard/cases/${c.id}`);
  }

  return (
    <Template title="New Case" subtitle="Name the matter clearly and precisely.">
      <form action={action} className="max-w-xl space-y-3">
        <input
          name="title"
          placeholder="Smith v. Acme Corp"
          className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
        />
        <button className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-amber-100">
          Create Case
        </button>
      </form>
    </Template>
  );
}
