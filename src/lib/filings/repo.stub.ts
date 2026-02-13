import { Filing, FilingStatus } from "./types";

const store = new Map<string, Filing[]>();

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID();
}

export type CreateFilingInput = {
  title: string;
  court?: string | null;
  status?: FilingStatus;
  filed_on?: string | null;
  notes?: string | null;
  document_id?: string | null;
  file_url?: string | null;
};

export type UpdateFilingInput = Partial<CreateFilingInput> & {
  status?: FilingStatus;
};

export const FilingRepoStub = {
  list(caseId: string): Filing[] {
    return store.get(caseId) ?? [];
  },

  create(caseId: string, input: CreateFilingInput): Filing {
    const list = store.get(caseId) ?? [];
    const filing: Filing = {
      id: newId(),
      case_id: caseId,
      title: input.title.trim(),
      court: input.court ?? null,
      status: input.status ?? "draft",
      filed_on: input.filed_on ?? null,
      notes: input.notes ?? null,
      document_id: input.document_id ?? null,
      file_url: input.file_url ?? null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    store.set(caseId, [filing, ...list]);
    return filing;
  },

  update(caseId: string, filingId: string, input: UpdateFilingInput): Filing | null {
    const list = store.get(caseId) ?? [];
    const idx = list.findIndex((f) => f.id === filingId);
    if (idx === -1) return null;

    const cur = list[idx];
    const next: Filing = {
      ...cur,
      ...input,
      title: input.title !== undefined ? input.title.trim() : cur.title,
      updated_at: nowIso(),
    };

    const newList = [...list];
    newList[idx] = next;
    store.set(caseId, newList);
    return next;
  },

  remove(caseId: string, filingId: string): boolean {
    const list = store.get(caseId) ?? [];
    const newList = list.filter((f) => f.id !== filingId);
    if (newList.length === list.length) return false;
    store.set(caseId, newList);
    return true;
  },
};
