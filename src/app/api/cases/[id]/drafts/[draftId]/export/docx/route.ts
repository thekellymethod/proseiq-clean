import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { buildDocx } from "@/lib/docx";
import { richToPlain } from "@/lib/draft-filing-checks";

function mdToPlain(md: string) {
  return String(md ?? "")
    .replace(/\r/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { id, draftId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const [{ data: draft, error }, { data: intakeRow }, { data: parties }] = await Promise.all([
    supabase
      .from("case_drafts")
      .select("id,title,content,content_rich,updated_at,template_id,signature_bucket,signature_path,signature_name,signature_title")
      .eq("case_id", id)
      .eq("id", draftId)
      .maybeSingle(),
    supabase.from("case_intakes").select("case_id,intake").eq("case_id", id).maybeSingle(),
    supabase.from("case_parties").select("id,role,name").eq("case_id", id),
  ]);

  if (error) return badRequest(error.message);
  if (!draft) return notFound("Draft not found");

  const title = String(draft.title ?? "Draft");
  const rich = draft.content_rich && typeof draft.content_rich === "object" ? draft.content_rich : null;
  const filing = (rich?.attrs?.filing && typeof rich.attrs.filing === "object" ? rich.attrs.filing : {}) as any;
  const text = rich ? richToPlain(rich) : mdToPlain(draft.content ?? "");

  let sig: Uint8Array | null = null;
  if (draft.signature_bucket && draft.signature_path) {
    const { data: blob, error: dlErr } = await supabase.storage.from(draft.signature_bucket).download(draft.signature_path);
    if (!dlErr && blob) {
      const ab = await blob.arrayBuffer();
      sig = new Uint8Array(ab);
    }
  }

  const metaParts: string[] = [];
  if (draft.signature_name) metaParts.push(draft.signature_name);
  if (draft.signature_title) metaParts.push(draft.signature_title);
  const meta = metaParts.length ? metaParts.join(" • ") : "";

  // Build caption + optional blocks as front matter (DOCX is editable, user can tweak to match local rules).
  const intake = (intakeRow as any)?.intake ?? {};
  const courtName =
    String(intake?.venue ?? "").trim() ||
    String(intake?.jurisdiction ?? "").trim() ||
    (String(intake?.forum ?? "").trim() ? `${String(intake.forum).trim()} FORUM` : "COURT");
  const caseNumber = String(intake?.case_number ?? "").trim();

  const partyRows = (parties as any[]) ?? [];
  const plaintiffs = partyRows.filter((p) => ["plaintiff", "petitioner"].includes(String(p.role))).map((p) => p.name);
  const defendants = partyRows.filter((p) => ["defendant", "respondent"].includes(String(p.role))).map((p) => p.name);
  const plaintiffLine = (plaintiffs ?? []).filter(Boolean).join(", ") || "[PLAINTIFF]";
  const defendantLine = (defendants ?? []).filter(Boolean).join(", ") || "[DEFENDANT]";

  const frontLines: string[] = [];
  if (courtName) frontLines.push(String(courtName).toUpperCase());
  frontLines.push("");
  frontLines.push(`${plaintiffLine}, Plaintiff,`);
  frontLines.push("v.");
  frontLines.push(`${defendantLine}, Defendant.`);
  if (caseNumber) {
    frontLines.push("");
    frontLines.push(`Case No.: ${caseNumber}`);
  }

  // Optional blocks appended to body (certificate of service / notary / proposed order)
  let body = text;

  if (Boolean(filing?.service?.enabled)) {
    const svcDate = String(filing?.service?.date ?? "").trim() || "______________";
    const methodDetails = String(filing?.service?.methodDetails ?? "").trim();
    const methodDefault = String(filing?.service?.methodDefault ?? "").trim();
    const recipients = Array.isArray(filing?.service?.recipients) ? filing.service.recipients : [];

    const methodLabel = (m: string) => {
      if (m === "certified_mail") return "certified mail";
      if (m === "email") return "email";
      if (m === "efile_provider") return "e-filing provider service";
      if (m === "process_server") return "process server";
      if (m === "publication") return "publication";
      if (m === "other") return "other";
      return m;
    };

    const lines: string[] = [];
    lines.push("CERTIFICATE OF SERVICE");
    lines.push("");
    lines.push(`I certify that on ${svcDate}, I served the foregoing document on the following parties by the method(s) stated below:`);
    lines.push("");
    if (recipients.length) {
      for (const r of recipients) {
        const name = String(r?.name ?? "").trim();
        if (!name) continue;
        const addr = String(r?.addressOrEmail ?? "").trim();
        const m = String(r?.method ?? methodDefault ?? "").trim();
        const md = String(r?.details ?? "").trim();
        const parts = [name, addr ? `(${addr})` : "", m ? `— ${methodLabel(m)}` : "", md ? `(${md})` : ""].filter(Boolean);
        lines.push(parts.join(" "));
      }
    } else {
      lines.push(`[RECIPIENT NAME] — ${methodLabel(methodDefault || "[METHOD]")}`);
    }
    if (methodDetails) {
      lines.push("");
      lines.push(`Details: ${methodDetails}`);
    }
    body = `${body}\n\n${lines.join("\n")}`;
  }

  if (Boolean(filing?.notary?.enabled)) {
    const nType = String(filing?.notary?.type ?? "").trim() || "jurat";
    const state = String(filing?.notary?.state ?? "").trim() || "________";
    const county = String(filing?.notary?.county ?? "").trim() || "________";
    const nDate = String(filing?.notary?.date ?? "").trim() || "______________";
    const notaryName = String(filing?.notary?.notaryName ?? "").trim() || "________________";
    const expires = String(filing?.notary?.commissionExpires ?? "").trim();

    const para =
      nType === "acknowledgment"
        ? `NOTARY ACKNOWLEDGMENT\n\nState of ${state}\nCounty of ${county}\n\nOn ${nDate}, before me, ${notaryName}, Notary Public, personally appeared ______________________, proved to me on the basis of satisfactory evidence to be the person(s) whose name(s) is/are subscribed to the within instrument and acknowledged to me that he/she/they executed the same.\n\n______________________________\nNotary Public${expires ? `\nMy commission expires: ${expires}` : ""}`
        : `JURAT\n\nState of ${state}\nCounty of ${county}\n\nSubscribed and sworn to (or affirmed) before me on ${nDate}, by ______________________.\n\n______________________________\nNotary Public${expires ? `\nMy commission expires: ${expires}` : ""}`;
    body = `${body}\n\n${para}`;
  }

  if (Boolean(filing?.proposedOrder?.enabled)) {
    const orderTitle = String(filing?.proposedOrder?.title ?? "").trim() || "PROPOSED ORDER";
    const judgeName = String(filing?.proposedOrder?.judgeName ?? "").trim() || "Judge";
    const judgeTitle = String(filing?.proposedOrder?.judgeTitle ?? "").trim() || "Judge";
    const orderDate = String(filing?.proposedOrder?.date ?? "").trim() || "______________";
    const para = `\n\n${String(orderTitle).toUpperCase()}\n\nIT IS SO ORDERED.\n\n______________________________\n${judgeName}\n${judgeTitle}\nDate: ${orderDate}`;
    body = `${body}${para}`;
  }

  const bytes = buildDocx({ frontMatter: frontLines.join("\n"), title, meta, body, courtStyle: true, signaturePng: sig });

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${draft.id}.docx"`,
    },
  });
}
