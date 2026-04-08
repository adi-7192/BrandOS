# AI Flow Rollout Notes

Date: 2026-04-08

This rollout tightens the main AI path across onboarding, brand kits, and content generation.

## What changed

- OpenAI-backed structured extraction and generation now use a shared parsing path.
- Brand kit review edits are persisted and reused in later generation.
- Confidence test regeneration now sends real critique back to the backend instead of using a UI-only retry.
- The generation flow now uses one canonical brief object with full brand-memory context.
- Brand Kits can start a manual generation flow directly without forcing users into Inbox first.
- Uploaded brand-guideline files are now:
  - accepted during onboarding extraction
  - uploaded to Supabase Storage
  - parsed into usable text for PDF and DOCX files
  - distilled into a guideline excerpt
  - reused during brand-kit extraction and later generation

## New guideline ingestion behavior

During onboarding, `brandGuidelinesFile` is sent as multipart form data when present.

Server-side flow:

1. Accept uploaded PDF or DOCX
2. Extract normalized plain text
3. Upload the original file to Supabase Storage
4. Save guideline metadata and text excerpt with the brand kit
5. Feed the guideline excerpt into:
   - brand-kit extraction
   - later generation prompts

Guideline documents are treated as a high-authority source for explicit brand rules.

## Files of note

Client:

- `client/src/pages/onboarding/S5aGenerating.jsx`
- `client/src/pages/onboarding/S5bReviewKit.jsx`
- `client/src/pages/generate/Brief.jsx`
- `client/src/pages/settings/BrandEditor.jsx`
- `client/src/lib/onboarding-extraction.js`
- `client/src/lib/generation-flow.js`

Server:

- `server/src/routes/onboarding.js`
- `server/src/routes/brands.js`
- `server/src/routes/generate.js`
- `server/src/services/ai/kitExtraction.js`
- `server/src/services/ai/generation.js`
- `server/src/services/ai/briefBuilder.js`
- `server/src/services/extraction/guidelineText.js`
- `server/src/services/storage/supabaseStorage.js`
- `server/src/db/schema.sql`

## Required deployment steps

### 1. Run migration

```bash
cd server
npm run migrate
```

This adds brand-kit fields for:

- `guideline_file_url`
- `guideline_file_name`
- `guideline_storage_path`
- `guideline_text_excerpt`

### 2. Confirm production env vars

Required live env:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=brand-guidelines
```

Important:

- `SUPABASE_STORAGE_BUCKET` must be the bucket name only, not a full URL.

### 3. Install server dependencies

This rollout adds:

- `mammoth`
- `pdf-parse`

These are installed automatically from `server/package.json` during deployment.

## Known remaining gap

Guideline files are now ingested and distilled, but generation still uses an excerpt rather than a richer rule-summary pipeline. That is intentional for now to keep prompt size controlled.
