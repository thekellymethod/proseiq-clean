export async function listFilings(caseId: string) {
  const res = await fetch(`/api/cases/${caseId}/filings`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load filings");
  return res.json() as Promise<{ filings: any[] }>;
}

export async function createFiling(caseId: string, payload: Record<string, unknown>) {
  const res = await fetch(`/api/cases/${caseId}/filings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string })?.error ?? "Failed to create filing");
  return json as Promise<{ filing: any }>;
}

export async function updateFiling(caseId: string, filingId: string, payload: Record<string, unknown>) {
  const res = await fetch(`/api/cases/${caseId}/filings/${filingId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string })?.error ?? "Failed to update filing");
  return json as Promise<{ filing: any }>;
}

export async function deleteFiling(caseId: string, filingId: string) {
  const res = await fetch(`/api/cases/${caseId}/filings/${filingId}`, { method: "DELETE" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string })?.error ?? "Failed to delete filing");
  return json as Promise<{ ok: boolean }>;
}
