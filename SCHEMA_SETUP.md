# ProseIQ Schema Setup

This document lists all SQL tables, policies, and storage buckets required for the app.

## Migration Order

Run migrations in this order (in Supabase SQL editor or via `supabase db push`):

1. **20250210000000_billing_tables.sql** – Billing (Stripe)
2. **20250210000001_documents_storage.sql** – Documents table + RLS
3. **20250210000002_full_schema.sql** – Core tables, RLS, storage buckets + policies
4. **20250210000003_schema_alignment.sql** – Exhibits/bundles columns (exhibit_no, label, kind, include_bates, etc.)
5. **20250210000004_case_filings.sql** – Case filings table (for stub→Supabase swap)
6. **20250210000005_case_law_suggestions.sql** – Case law suggestions (ProactiveCaseLaw persistence)

> **Note:** If you have an existing schema (e.g. from `sql/migrations/phase1.sql`), some tables may already exist. The migrations use `create table if not exists`. Watch for:
> - **case_intake** (phase1) vs **case_intakes** (app): The app uses `case_intakes` with `intake` column. Migrate data from `case_intake.data` → `case_intakes.intake` if needed.
> - **case_documents** (phase1) vs **documents** (app): The app uses `documents` with `created_by`, `size_bytes`, `kind`. The old `case_documents` is no longer used.

## Tables Used by the App

| Table | Purpose |
|-------|---------|
| `cases` | Case metadata (title, status, created_by) |
| `case_intakes` | Intake JSON (`intake` column) |
| `case_events` | Timeline events |
| `case_parties` | Parties |
| `case_drafts` | Drafts (content_rich, template_id, signature fields) |
| `case_exhibits` | Exhibits |
| `case_tasks` | Tasks/motions |
| `case_bundles` | Bundle manifests + output path |
| `case_bundle_items` | Bundle ↔ exhibit links |
| `case_ai_jobs` | AI worker queue |
| `case_ai_outputs` | AI outputs (research, coaching, etc.) |
| `case_exhibit_documents` | Exhibit ↔ document links |
| `documents` | Uploaded files (storage_bucket, storage_path, created_by) |
| `billing_customers` | Stripe customer mapping |
| `billing_subscriptions` | Subscription state |

## Storage Buckets

| Bucket | Purpose |
|--------|---------|
| `case-documents` | Uploaded PDFs, images, evidence |
| `case-signatures` | Draft signature images |
| `case-files` | Generated bundle ZIPs |

Path format: `{userId}/{caseId}/...` (RLS enforces `userId = auth.uid()`).

## RLS Policies

- **billing_***: Users select own row only
- **documents**: Users select/insert/update/delete own (`created_by = auth.uid()`)
- **case_***: Users access only cases they own (`cases.created_by = auth.uid()`)
- **storage.objects**: Users access only paths under `auth.uid()/...`

## Code Fixes Applied

- **Intake seed**: Uses `case_intakes` and `intake` column (was `case_intake` / `data`)
- **Bundles worker**: Uses `documents` table (was `case_documents`)
- **Exhibit attach**: Uses `documents` table and `created_by` filter (was `case_documents`)
