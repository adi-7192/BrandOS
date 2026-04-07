# BrandOS

AI-powered content platform for internal content marketers at multi-brand enterprise organisations. Generates LinkedIn posts and blog posts from campaign briefs in tagged Gmail emails, calibrated to each brand's voice kit.

## Stack

React + Tailwind (Vite) · Node/Express · PostgreSQL (raw SQL, no ORM) · Anthropic Claude API (default, switchable via `AI_PROVIDER` env) · JWT auth · Supabase storage

## Hard constraints

- **Restricted words are absolute.** Post-process every generation. Auto-regenerate once on hit; flag on second hit. Never override.
- **Brand kit is always re-injected in full.** Never carry only previous output forward.
- **Two outputs only in V1:** LinkedIn post and blog post.
- **No V2 features:** LinkedIn API posting, Slack, Google Meet transcripts, multi-user workspaces, approval workflow, analytics, Instagram/X/TikTok, CMS publish, scheduling, brand drift analytics, fine-tuning.
- Show "Post to LinkedIn" as a disabled dashed-border button with "Coming V2" badge (G5 screen).

## Design principles

1. One screen, one task.
2. User is reviewer, not author — AI drafts, user confirms. Never blank forms when AI can pre-fill.
3. Source attribution on all AI extractions: green = from inbox / amber = AI-inferred / purple = user-provided.
4. `?` tooltips on every input field — one line: "why does this help me?"
5. Enterprise language throughout. No "Get started free."
6. Never trap the user — every forward-action screen has a back option.

## Auth

JWT in `Authorization: Bearer` header. All DB queries chain `user_id → workspace_id → brand_id` — session isolation is structural, not app-layer. Google OAuth uses `google_id` column on `users` table; upserts by email.

## AI provider

Controlled by `AI_PROVIDER` env var: `anthropic` (default) | `openai` | `gemini`. All calls go through `callAI(systemPrompt, userMessage, maxTokens)` in `server/src/services/ai/client.js`.
