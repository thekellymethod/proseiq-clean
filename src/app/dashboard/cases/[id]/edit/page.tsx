import { redirect } from "next/navigation";
import Template from "@/components/layout/Template";
import { getCaseById, updateCase } from "@/lib/cases";

export default async function EditCasePage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  async function action(formData: FormData) {
    "use server";
    const title = String(formData.get("title") || "").trim();
    if (!title) return;
    await updateCase(params.id, title);
    redirect(`/dashboard/cases/${params.id}`);
  }

  return (
    <Template title="Edit case" subtitle="Keep titles clean and specific. This becomes your workspace label.">
      <form action={action} className="max-w-xl space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-white/70">Title</label>
          <input
            title="Title"
            placeholder="e.g., Vehicle repossessed"
            name="title"
            defaultValue={c.title}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
          />
        </div>

        <button className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-50 hover:bg-amber-300/15">
          Save
        </button>
      </form>
    </Template>
  );
}
