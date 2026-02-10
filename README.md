## ProseIQ

Pro se litigation cockpit for managing cases (events, documents, exhibits, drafts, discovery, motions) with optional AI assistance + legal research.

## What ProseIQ is (and who it’s for)

ProseIQ is a **case-workspace** designed to help a pro se litigant (or a small team supporting one) stay organized and strategic from intake → filing.

It is built around the idea that most “litigation chaos” comes from:
- losing track of **facts + dates**
- scattering **documents/exhibits** across folders
- drafting without a consistent structure
- missing **deadlines** or mis-timing motions/discovery
- spending too much time on rabbit trails

ProseIQ keeps case materials in one place and (optionally) adds an AI “first‑year law student–style” assistant for **educational guidance**, checklists, and structured outputs.

### What it offers

### Feature matrix (at a glance)

| Area | What you can do | Key outputs |
|---|---|---|
| **Case workspace** | Organize a case into consistent tabs and flows | A single “home” for the case |
| **Events** | Track deadlines, hearings, filings, evidence milestones; optionally view in 3D | Procedural + factual timeline |
| **Documents** | Upload/store evidence; view PDFs in-app; download reliably | Source-of-truth evidence library |
| **Exhibits** | Create/sequence exhibits; attach documents | Exhibit list + attachments |
| **Drafts** | Write motions/letters with templates; rich editor; signatures | Draft content (JSON + plain text) |
| **Export** | Export drafts as PDF/DOCX (court-style formatting) | Shareable filing-ready docs |
| **Bundles** | Generate compiled case bundles | Bundle files in Storage |
| **Research (optional)** | Search web sources + extract structured hits + pin authority | Pinned “authority” library |
| **Assistant (optional)** | Proactive analysis + coaching tools | Action plans, checklists, structured JSON |

#### Case workspace (core)

- **Cases**: each case has a workspace with tabs for the major workflows.
- **Events timeline**: track procedural history, deadlines, hearings, filings, evidence milestones.
  - Includes a **3D timeline view** (optional) for visualizing events by date/kind.
- **Tasks / status**: lightweight operational tracking for the case.

#### Documents + exhibits

- **Documents**: upload PDFs and other evidence into Supabase Storage (`case-documents`).
- **Viewer**: in-app document viewer for PDFs.
- **Download**: reliable server-side download redirect (no popup blockers).
- **Exhibits**: create and sequence exhibits and attach uploaded documents as needed.

#### Drafting (rich editor + templates)

- **Drafts**: create and manage case drafts (motions, declarations, notices, letters).
- **Rich editor**: WYSIWYG-ish editor backed by structured JSON content (Tiptap / ProseMirror).
- **Templates**: insert common court-style structures so you start from a correct skeleton.
- **Signature support**: upload a signature image and include it in exports.
- **Save UX**: back button + “unsaved changes” indicator + save shortcuts.

#### Export / bundling

- **PDF export** for drafts (court-style formatting).
- **DOCX export** for drafts (court-style formatting + optional embedded signature image).
- **Bundles**: generate case bundles and download compiled outputs (stored in `case-files`).

#### Legal research (optional)

- **Research search**: query the web (via Serper) and extract structured “authority hits”.
- **Pinning**: pin “authority” items to a case for later use and citation tracking.
- **Audit trail**: AI outputs are stored with metadata for reproducibility.

#### AI Assistant (optional)

When configured (via `OPENAI_API_KEY`, optionally `SERPER_API_KEY`), ProseIQ provides:

- **Proactive analysis pipeline**: when a user adds/updates key case artifacts (events, intake, documents, drafts), ProseIQ can enqueue background jobs that produce:
  - relevance / importance signals
  - suggested next actions
  - elements checklists
  - “rabbit trails to avoid”
  - deadline/motion watchlists (high level)
- **Coaching tools** (structured JSON outputs):
  - witness testimony preparation outline
  - cross-examination plan (leading-question chapters + impeachment ideas)
  - subpoena duces tecum planner (document categories, narrowing, compliance pitfalls)
  - motions + deadlines watchlist (high-level prompts and checklists)

### What it does NOT do

- **Not legal advice**: ProseIQ is an organizational + educational tool. It can help you think and draft, but it cannot replace a lawyer.
- **Not a rules oracle**: it can surface checklists and research hits, but local rules and specific jurisdictional requirements can vary and must be verified.

## Suggested workflow (how to use it well)

1. **Create a case** and fill out Intake with the story, parties, posture, and goals.
2. Add the procedural/factual backbone in **Events** (deadlines, hearings, filing dates).
3. Upload evidence into **Documents** and attach key items as **Exhibits**.
4. Draft motions/letters in **Drafts** using templates; export as PDF/DOCX.
5. Use **Research** to find and pin authority; incorporate it into drafts.
6. Use **Assistant** outputs to sanity-check relevance, focus, and next steps.

## Security & privacy model (high level)

### Data storage (where things live)

- **Postgres (Supabase DB)**: case metadata, events, intake, exhibit records, draft records, job/output logs.
- **Supabase Storage**: file blobs only (PDFs, uploads, generated files, signature images).

### Access control (why other users can’t see your data)

- **Database**: protected by **Row Level Security (RLS)**. Tables are scoped by `created_by` and/or `case_id` ownership.
- **Storage**: buckets are **private**. Access is controlled by RLS policies on `storage.objects`:
  - Users may read/insert/delete objects only when the object path starts with their own `auth.uid()` (e.g. `userId/caseId/...`).
  - The app uses **signed URLs** for viewing/downloading, and **signed uploads** for uploading.

### What gets sent to AI (and how to disable it)

If `OPENAI_API_KEY` is set, some features will send **case text content** to the configured model, such as:
- research query + snippets
- event/intake/draft/document metadata for structured analysis outputs

To disable AI features completely, **do not set** `OPENAI_API_KEY` (and `SERPER_API_KEY`).

### Auditability

AI-related outputs are stored in `case_ai_outputs` with metadata (model, prompt context, confidence/relevance scoring) so you can review what was generated and why.

### Threat model / assumptions (practical)

ProseIQ’s security posture depends heavily on Supabase’s auth + RLS doing the right thing. Here’s the practical view of what it protects against and what it assumes.

#### Protects against

- **Other authenticated users** accessing your DB rows or Storage objects (enforced via RLS + private buckets).
- **Guessing file URLs**: files are not public; access is via **short-lived signed URLs** (view/download) or **signed upload tokens**.

#### Assumes

- Your Supabase project’s **auth settings** are configured correctly (email/password, MFA/2FA as desired).
- Your users keep their credentials safe. If an account is compromised, RLS will not help (the attacker is the user).
- Your deployment keeps secrets safe (don’t leak keys; don’t commit `.env`).

#### Recommended hardening

- **Use short expirations** for signed URLs (the app defaults to ~15 minutes where applicable).
- **Rotate keys** periodically (and immediately after any suspected leak).
- **Enable MFA/2FA** for your Supabase dashboard accounts and consider MFA for end-users if appropriate.
- **Keep buckets private** and rely on RLS + signed URLs (avoid “public” buckets for case materials).
- **Audit** AI outputs before relying on them; treat them as drafts/checklists, not truth.

## Getting Started

### Prereqs

- Node.js (LTS recommended)
- A Supabase project (DB + Auth + Storage)

### Environment variables

Create `.env.local` (or `.env`) with:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Optional (for AI assistant + research):

```bash
OPENAI_API_KEY=...
SERPER_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
```

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

Then open `http://localhost:3000` (if that port is taken, Next will choose another and print it).

### Build

```bash
npm run build
npm start
```

## Supabase setup

### Database migrations

This repo includes additive SQL migrations under `sql/` and/or Supabase migrations (if you’re using the Supabase CLI).

Key tables the app uses include (non-exhaustive):
- `cases`, `case_events`, `documents`, `case_exhibits`, `case_drafts`, `case_bundles`
- AI pipeline: `case_ai_jobs`, `case_ai_outputs`

### Storage buckets + RLS policies (required for Documents + Signatures)

The app expects these Storage buckets:
- `case-documents` (uploaded evidence, PDFs, etc)
- `case-signatures` (draft signature images)
- `case-files` (generated bundle outputs)

Buckets are **private** and secured via RLS policies on `storage.objects` so users can only access files under paths starting with their `auth.uid()` (the upload paths are structured like: `userId/caseId/...`).

If Storage upload/download isn’t working, confirm the buckets exist and the policies are present.

## Documents: upload, view, download

- **Upload**: uses Supabase Storage signed uploads.
- **Download**: `GET /api/cases/[id]/documents/[docId]/download` redirects to a signed URL with a `download` hint so PDFs download reliably.
- **Viewer**: `GET /dashboard/cases/[id]/documents/[docId]` shows an in-app viewer (PDFs render in an `<iframe>`).

## Scripts

- `npm run dev`: start dev server
- `npm run build`: production build
- `npm start`: run production server
- `npm run typecheck`: TypeScript typecheck
- `npm run lint`: ESLint

## Notes / Troubleshooting

- **React / Next**: This app runs on Next.js 15 and React 19. Keep `@react-three/fiber` / `@react-three/drei` compatible with your React version.
- **Hydration warnings in Cursor preview**: Cursor’s browser layer can inject attributes like `data-cursor-ref`, which may cause hydration mismatch warnings in that environment. Verify in a normal browser if you suspect a real SSR mismatch.

## License

Private / internal (update as appropriate).
