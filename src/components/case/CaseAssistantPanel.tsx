import { requireUser } from "@/lib/cases";
import CaseFocusPanel from "@/components/case/CaseFocusPanel";
import CaseLawSection from "@/components/case/CaseLawSection";
import CaseCoachTools from "@/components/case/CaseCoachTools";

export default async function CaseAssistantPanel({ caseId }: { caseId: string }) {
  const { supabase, user } = await requireUser();

  const [focusOutputs, queuedJobs] = await Promise.all([
    supabase
      .from("case_ai_outputs")
      .select("id,output_type,title,content,updated_at")
      .eq("case_id", caseId)
      .eq("created_by", user.id)
      .in("output_type", ["case_analysis", "relevance_flag", "motion_recommendation", "deadline_plan"])
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("case_ai_jobs")
      .select("id")
      .eq("case_id", caseId)
      .eq("created_by", user.id)
      .eq("status", "queued")
      .limit(50),
  ]);

  return (
    <div className="space-y-4">
      <CaseFocusPanel
        caseId={caseId}
        openaiConfigured={Boolean(process.env.OPENAI_API_KEY)}
        queuedJobs={(queuedJobs.data ?? []).length}
        outputs={(focusOutputs.data ?? []) as any}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <CaseLawSection caseId={caseId} />
        <CaseCoachTools caseId={caseId} />
      </div>
    </div>
  );
}

