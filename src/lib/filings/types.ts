export type FilingStatus =
  | "draft"
  | "prepared"
  | "filed"
  | "served"
  | "rejected";

export type Filing = {
  id: string;
  case_id: string;

  title: string;
  court?: string | null;
  status: FilingStatus;

  filed_on?: string | null;
  notes?: string | null;

  document_id?: string | null;
  file_url?: string | null;

  created_at: string;
  updated_at: string;
};
