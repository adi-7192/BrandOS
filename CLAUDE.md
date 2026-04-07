# BrandOS — Claude Code Guide

## What this project is

BrandOS is an AI-powered content platform for internal content marketers at multi-brand enterprise organisations. It stores each brand's voice kit once and uses campaign briefs from tagged Gmail emails to generate LinkedIn posts and blog posts in the correct brand voice.

**Two outputs only in V1:** LinkedIn post and blog post.

## Tech stack

- **Frontend:** React + Tailwind CSS (Vite), in `client/`
- **Backend:** Node.js + Express, in `server/`
- **Database:** PostgreSQL
- **AI:** Anthropic Claude API — model `claude-sonnet-4-6` for all extraction and generation
- **Auth:** SSO (SAML 2.0) primary · Google Workspace OAuth · Work email + password fallback
- **File storage:** S3-compatible for PDF/DOCX uploads
- **Deployment:** Vercel (client) + Railway/Render (server)

## Project structure

```
BrandOS/
  client/                  React + Tailwind frontend
    src/
      pages/               Route-level components (1:1 with URL routes)
        auth/              /signup, /signin
        onboarding/        S1–S7 + unlock gate
        dashboard/         /dashboard
        inbox/             /inbox (G1)
        generate/          /generate/brief|preview|creating|output (G2–G5)
        settings/          /settings and /settings/brands
      components/          Reusable UI
        ui/                Base atoms: Button, Input, Dropdown, Modal, Chip, etc.
        onboarding/        Onboarding-specific composed components
        inbox/             Inbox card, refresh panel, diff view
        generate/          Brief fields, preview editor, output workspace
        layout/            TopNav, ProgressIndicator, KitProgressBar
      context/             React contexts: AuthContext, BrandContext, OnboardingContext
      hooks/               Custom hooks: useAuth, useBrand, useGenerate
      services/            API client wrappers (axios)
      utils/               Helpers and constants
  server/                  Node.js + Express backend
    src/
      routes/              Express routers (auth, onboarding, brands, inbox, generate)
      controllers/         Route handler functions
      services/
        ai/                Claude API calls (extraction, generation, confidence scoring)
        gmail/             Gmail API integration (label polling, push notifications)
        extraction/        Brief extraction pipeline (5 steps)
        storage/           S3 file upload/download
      middleware/          authMiddleware, errorHandler, validate
      models/              DB query functions (no ORM — raw SQL via pg)
      db/
        migrations/        Ordered SQL migration files
        schema.sql         Full schema for reference
      utils/               Logger, constants, field weights
    .env.example
```

## Key domain concepts

### Brand kit
Stored in `brand_kits` table. Contains: voice adjectives (3), vocabulary to use (5–8 chips), restricted words (hard guardrails — never overridden), channel rules (LinkedIn + blog), content goal, publishing frequency, audience/campaign parameters, formality level, campaign core why (optional).

### Inbox card
Extracted from a Gmail message tagged with `BrandOS — [Brand Name]`. Confidence scored per field internally; UI shows green/grey chips only (no percentage exposed).

### Generation pipeline (5 layers)
1. Brand identity (from brand_kit)
2. Few-shot examples (from brand_kit.past_content_examples)
3. Campaign brief (from confirmed G2 fields)
4. Preview edits (from G3 edited sections)
5. Channel format spec (LinkedIn: max 220 words, max 3 hashtags; Blog: word count based on publishing frequency)

## Screen map

| Screen | URL | Phase |
|--------|-----|-------|
| S1 | /onboarding/team | Onboarding Phase 1 |
| S2 | /onboarding/brand-name | Onboarding Phase 1 |
| S3 | /onboarding/content-types | Onboarding Phase 1 |
| UG | /onboarding/unlocked | Unlock gate |
| S4a | /onboarding/brand-content | Onboarding Phase 2 |
| S4b | /onboarding/audience-campaign | Onboarding Phase 2 |
| S5a | /onboarding/generating | Onboarding Phase 2 |
| S5b | /onboarding/review-kit | Onboarding Phase 2 |
| S6 | /onboarding/confidence-test | Onboarding Phase 2 |
| S7 | /onboarding/kit-live | Onboarding Phase 2 |
| G1 | /inbox | Content generation |
| G2 | /generate/brief | Content generation |
| G3 | /generate/preview | Content generation |
| G4 | /generate/creating | Content generation |
| G5 | /generate/output | Content generation |

## Design principles (apply everywhere)

1. **One screen, one task.** No screen collects data AND explains a concept simultaneously.
2. **User is reviewer, not author.** AI drafts; user confirms. Never blank forms when AI can pre-fill.
3. **Source attribution on all AI extractions.** Green = from inbox / Amber = AI-inferred / Purple = user-provided.
4. **Restricted words are hard constraints.** Post-process every generation. Auto-regenerate once on hit. Flag on second hit.
5. **Brand kit is source of truth.** Every iteration re-injects the full kit. Never carry only previous output forward.
6. **? tooltips on every input field.** One line: "why does this help me?" — not "what is this field."
7. **Enterprise language throughout.** No "Get started free." Every label reads as if written for a procurement-aware professional.
8. **Never trap the user.** Every forward-action screen has a back option.

## What is NOT in V1

Do not build: LinkedIn API direct posting, Slack integration, Google Meet transcript ingestion, group layer UI in onboarding, team invite / multi-user workspace, approval workflow, analytics, Instagram/X/TikTok formats, CMS publish, scheduling, brand drift analytics, learning loop fine-tuning.

Show LinkedIn "Post to LinkedIn" as a dashed-border disabled button with "Coming V2" badge in G5.

## Database schema

See `server/src/db/schema.sql` for the full schema. Key tables:
- `users` — auth + team context
- `workspaces` — company-level container
- `brands` — per-brand record (name, market, language)
- `brand_kits` — full kit parameters (versioned)
- `inbox_cards` — extracted email briefs (jsonb extracted_fields)
- `drafts` — generated content versions

## Confidence scoring (backend only)

Field weights: key_message 25%, campaign_type 20%, audience 20%, tone_shift 15%, content_goal 15%, cta_intent 5%.
Tiers: High ≥0.75, Partial ≥0.40, Low <0.40.
Source quote required — no quote caps confidence at 0.60.
UI representation: all green chips = High, mixed chips = Partial/Low.
