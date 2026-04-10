# BrandOS Platform Overview
_Last updated: April 9, 2026_

## 1. Executive Summary
BrandOS is an AI-powered content marketing workspace for teams that manage multiple brands inside one organization. It gives each brand a persistent memory layer so content marketers do not have to re-explain voice, audience, tone, proof style, and content rules every time they want AI help.

The product is built around four core ideas:
- create a reusable brand kit once
- capture campaign and brand updates from stakeholder communication
- turn those updates into structured, reviewable AI outputs
- generate on-brand content faster with much less manual rewriting

Today, BrandOS supports a focused V1 workflow for:
- public marketing and product entry
- brand-kit creation
- campaign brief confirmation
- campaign workspace management
- AI-assisted content generation
- inbox-based stakeholder update intake
- dashboard, brand management, settings, and destructive lifecycle actions

## 2. The Problem BrandOS Solves
Enterprise and multi-brand marketing teams lose time in three places:
- AI tools have no memory of each brand, so every session starts from zero
- campaign direction is trapped inside long email threads and stakeholder updates
- marketers must manually translate those threads into structured briefs and then manually enforce brand rules

This creates predictable pain:
- repetitive prompting
- inconsistent brand voice
- slower turnaround
- more review cycles
- difficulty scaling one marketer across several brands

BrandOS reduces this by creating a persistent brand memory and combining it with AI extraction, review, and generation workflows.

## 3. Target Users
Primary user:
- internal content marketer or content lead inside a multi-brand company

Typical profile:
- manages several distinct brands
- works from inbound stakeholder requests
- writes or commissions social and editorial content
- needs speed, but cannot sacrifice voice consistency
- wants AI to do heavy lifting while keeping human review control

Typical organizations:
- retail groups
- holding companies
- enterprise marketing teams
- multi-brand consumer and B2B portfolios

## 4. Product Positioning
BrandOS is not a generic chatbot and not just a content generator.

It sits between:
- brand knowledge management
- campaign intake
- structured AI extraction
- AI-assisted content production

The product promise is:
_“Store the brand memory once, feed in campaign context quickly, and let AI generate content that already sounds like the brand.”_

## 5. Core Product Pillars
### 5.1 Brand Memory
Each brand gets a structured brand kit that stores the persistent writing context AI needs to generate consistent content.

### 5.2 Campaign Intake
Stakeholder threads can be turned into structured campaign and brand-update work items through the Brand Inbox.

### 5.3 Human-in-the-Loop AI
AI performs extraction, summarization, routing, diff proposal, preview drafting, and generation, but the user stays in control of confirmation and application.

### 5.4 Focused Content Workflow
The product is optimized for a clear V1 content path rather than a broad publishing suite.

## 6. Current Feature Set
### 6.1 Authentication and Access
BrandOS currently supports:
- public marketing landing page
- email and password sign-up/sign-in
- Google OAuth callback flow
- protected application routes
- profile completion path

Relevant app areas:
- landing page
- sign up
- sign in
- forgot password
- Google callback
- complete profile

The public landing page currently emphasizes:
- multi-brand content operations
- persistent brand memory
- structured brief intake
- reviewer-first output generation
- direct entry into `Start setup` and `Sign in`

### 6.2 Onboarding and Brand Kit Creation
BrandOS includes a multi-step onboarding journey to create the first brand kit.

Phase 1: team and workspace setup
- team context
- first brand creation
- content type selection
- unlock state before the deeper kit setup

Phase 2: brand kit build
- website URL and multiple website sources
- past content examples
- guideline file upload and extraction
- audience and campaign context
- funnel stages as multi-select
- proof style with preset or custom free text
- AI kit extraction
- review and approval of kit cards
- confidence test with editable sample content
- final “kit live” handoff

Brand kit fields currently represented in the system include:
- voice adjectives
- vocabulary
- restricted words
- LinkedIn rules
- blog rules
- content goal
- publishing frequency
- audience type
- buyer seniority
- age range
- industry sector
- industry target
- funnel stages
- tone shift
- proof style
- formality level
- campaign core why
- past content examples
- website URLs and site summary
- guideline document metadata and extracted excerpt

### 6.3 Brand Management
Users can:
- list all brand kits
- open a single brand editor
- inspect the active kit
- start manual generation from a brand
- delete a brand kit with clear permanent-deletion warnings

Brand deletion behavior:
- removes the brand
- cascades related campaign work through database relationships
- deletes uploaded guideline files from storage where available

### 6.4 Dashboard
The dashboard provides a concise workspace overview with:
- KPI row
- Action Center
- Brand Portfolio
- Upcoming Deadlines
- Recent Activity

Current dashboard capabilities include:
- brand count
- pending briefs count
- brands in pipeline count
- saved drafts count
- pending intake visibility
- continue-working items
- brand health rows
- guideline-loaded signal per brand
- upcoming publish/go-live deadlines
- safe fallback rendering when summary data is partial or malformed

### 6.5 Campaigns Workspace
BrandOS now includes a dedicated `Campaigns` workspace rather than treating campaign work as hidden session state.

Current campaign capabilities include:
- left-nav `Campaigns` destination
- card-based campaign workspace
- `All`, `Active`, `Draft`, and `Completed` tabs
- search across campaign and brand fields
- campaign-to-brand visibility on every card
- publish date visibility
- current stage and progress visibility
- output-state pills for LinkedIn and blog
- quick actions to:
  - resume work
  - open output
  - jump to the connected brand kit

Current implementation note:
- campaigns are currently backed by `generation_sessions` and mapped into a campaign view-model
- deleted campaigns are removed from the UI rather than shown in history

### 6.6 Brand Inbox
The inbox is now an AI-first review surface for stakeholder email threads.

Current inbox capabilities include:
- pending, used, and dismissed states
- AI summary cards instead of raw email-first cards
- campaign brief detection
- brand update detection
- mixed thread handling
- unmatched routing flow
- right-side original-email drawer
- grouped-by-thread view
- action row for:
  - generate brief
  - generate content
  - update brand kit
  - dismiss
  - view original email

Unmatched flow:
- AI flags the thread as needing routing
- user gives a natural-language instruction
- BrandOS returns a lightweight interpretation
- user confirms
- the thread is reprocessed against the selected brand and intended action

### 6.7 Campaign and Content Workflow
The generation flow is built as a structured multi-step workspace:
- brief
- preview
- creating
- output

Capabilities in this flow:
- build a brief from inbox cards
- create a manual brief from a brand
- confirm and edit campaign details
- capture publish/go-live date
- autosave generation sessions
- resume in-progress sessions
- AI preview suggestions
- editable LinkedIn and blog draft sections
- full content generation
- iterative regeneration
- selection rewrite
- save drafts
- delete campaign work with irreversible warning

Current V1 outputs:
- LinkedIn post
- blog post

### 6.8 Review and Confidence UX
The onboarding review flow already includes several quality-of-life improvements:
- review-kit fields are editable
- tag-like values accept comma and newline parsing
- editing an approved card resets only that card’s approval
- confidence sample text is editable
- multiple regenerate attempts are supported
- “Almost there” feedback path replaces the older less-clear label

### 6.9 Settings
The settings area currently supports:
- user profile settings
- workspace naming
- inbox preferences
- generation preferences
- AI configuration visibility
- security visibility
- inbound intake email visibility
- AI connection testing

### 6.10 Destructive Actions
The platform currently supports permanent deletion for:
- brand kits
- campaigns / generation sessions

Delete confirmations are explicit and designed as danger flows.

## 7. End-to-End User Journeys
### 7.1 First-Time Setup
1. User signs up or signs in
2. User completes onboarding
3. User creates the first brand
4. User provides website, sample content, and optionally a guideline file
5. AI extracts a draft brand kit
6. User reviews and edits the kit
7. User validates the brand voice through a confidence test
8. Brand kit goes live

### 7.2 Manual Campaign Creation
1. User opens a brand
2. User starts manual content generation
3. User fills campaign details in the brief
4. AI drafts preview sections
5. User reviews or lightly edits
6. AI generates final content
7. User iterates or saves drafts

### 7.3 Campaign Workspace Management
1. User opens `Campaigns`
2. User filters by `Active`, `Draft`, or `Completed`
3. User searches by campaign or brand name
4. User opens the campaign card they need
5. User resumes work, opens output, or jumps back to the connected brand kit

### 7.4 Inbox-Driven Campaign Creation
1. Stakeholder thread is forwarded to BrandOS intake address
2. Inbound webhook receives the message
3. AI classifies the thread
4. AI extracts campaign fields and possible brand updates
5. Inbox shows an AI summary card
6. User chooses:
   - generate brief
   - generate content
   - update brand kit
   - dismiss
7. Once work is handled, the item moves through inbox states

### 7.5 Brand Update Flow
1. AI detects a likely lasting brand-level change from a stakeholder thread
2. Inbox shows a structured proposed diff
3. User reviews current vs suggested values
4. User applies the update
5. Active brand kit is updated

## 8. Business Value and Benefits
### 8.1 Operational Benefits
- faster content production
- fewer repetitive prompts
- better continuity across campaigns
- easier scaling across multiple brands
- less friction between stakeholder input and content execution

### 8.2 Quality Benefits
- stronger brand consistency
- explicit guardrails for vocabulary and restricted words
- structured review before permanent updates
- better preservation of nuanced tone and audience guidance

### 8.3 Team Benefits
- easier handoff between team members
- shared workspace context
- reusable brand memory
- clearer triage of incoming requests

### 8.4 Strategic Benefits
- creates institutional memory instead of relying on individuals
- improves repeatability of AI-assisted marketing operations
- turns email-based stakeholder chaos into structured work

## 9. AI Usage Across the Platform
BrandOS uses AI in multiple focused, reviewable ways.

### 9.1 AI During Onboarding
- brand kit extraction from website, content samples, and guideline inputs
- guideline text extraction from PDF and DOCX sources
- confidence-sample generation for voice validation

### 9.2 AI During Inbox Processing
- inbound email classification
- campaign brief extraction
- publish-date extraction
- brand-update proposal extraction
- routing interpretation for unmatched threads
- concise summary generation for inbox cards

### 9.3 AI During Content Creation
- canonical brief building from inbox and brand kit context
- preview suggestion generation
- final content generation
- iterative rewrite and improvement
- selection-level rewrite

### 9.4 AI Design Principle
AI is used to reduce manual work, but not to silently make permanent business decisions without review.

The platform favors:
- proposed summaries
- structured extraction
- user confirmation
- human review before applying durable updates

## 10. Technical Architecture
### 10.1 Frontend
Current frontend stack:
- React 18
- React Router
- Tailwind CSS
- Vite
- Axios for API calls

Application structure:
- public marketing pages
- authenticated onboarding flow
- dashboard and inbox
- campaigns workspace
- generation workflow
- settings and brand management

UI architecture:
- shared platform chrome and focused-flow top nav
- reusable shells for workspace and flow contexts
- lightweight client-side view-model helpers for dashboard, inbox, generation, and review flows
- consistent navigation language across dashboard, onboarding, generation, inbox, campaigns, and settings

### 10.2 Backend
Current backend stack:
- Node.js
- Express
- PostgreSQL via `pg`
- JWT authentication
- Multer for uploads
- Supabase storage for guideline files

The backend exposes routes for:
- auth
- onboarding
- brands
- campaigns
- dashboard
- inbox
- inbound email intake
- generation
- settings
- intent and AI test flows

### 10.3 Database Model
Current key tables include:
- `users`
- `workspaces`
- `brands`
- `brand_kits`
- `inbox_cards`
- `drafts`
- `generation_sessions`

High-level data relationships:
- one user owns one workspace
- one workspace owns many brands
- one brand may have one active brand kit version
- one brand may have many inbox cards
- one brand may have many drafts
- one user may have many generation sessions

### 10.4 Storage and Document Handling
BrandOS supports:
- PDF parsing
- DOCX parsing
- website crawling and summarization
- guideline file upload to Supabase storage

Stored brand resource metadata includes:
- public guideline file URL
- original filename
- storage path
- extracted text excerpt

### 10.5 AI Provider Layer
The backend includes a provider abstraction for:
- Anthropic
- OpenAI
- Gemini

Current AI configuration behavior:
- provider selected through environment variable
- default provider: `anthropic`
- default model mapping:
  - Anthropic: `claude-sonnet-4-6`
  - OpenAI: `gpt-4o`
  - Gemini: `gemini-2.0-flash`

### 10.6 Email Intake Architecture
The current implementation uses manual forwarding plus inbound webhook ingestion.

Current flow:
1. each workspace gets a unique intake alias
2. user forwards a stakeholder thread to the BrandOS inbox domain
3. Resend receives the email
4. Resend sends a signed webhook to BrandOS
5. BrandOS verifies the webhook
6. BrandOS fetches the full received email
7. BrandOS extracts workspace id from the alias
8. AI classifies and extracts structured work
9. inbox item is created for user review

Current inbound implementation details:
- Resend SDK for received-email retrieval
- Svix signature verification
- workspace alias format:
  - `updates+<workspace-id>@<inbound-domain>`
- HTML fallback normalization
- idempotency via provider email id
- safe fallbacks when AI extraction partially fails

## 11. Route and Surface Map
### 11.1 Main Frontend Routes
Public:
- `/`
- `/signup`
- `/signin`
- `/forgot-password`

Onboarding:
- `/onboarding/team`
- `/onboarding/brand-name`
- `/onboarding/content-types`
- `/onboarding/unlocked`
- `/onboarding/brand-content`
- `/onboarding/audience-campaign`
- `/onboarding/generating`
- `/onboarding/review-kit`
- `/onboarding/confidence-test`
- `/onboarding/kit-live`

Workspace:
- `/dashboard`
- `/campaigns`
- `/inbox`
- `/generate/brief`
- `/generate/preview`
- `/generate/creating`
- `/generate/output`
- `/settings`
- `/settings/brands`
- `/settings/brands/:id`

### 11.2 Main API Areas
- `/api/auth/*`
- `/api/onboarding/*`
- `/api/brands/*`
- `/api/campaigns`
- `/api/dashboard/*`
- `/api/inbox/*`
- `/api/inbound/email`
- `/api/generate/*`
- `/api/settings/*`

## 12. Current Integrations
### 12.1 Active or Implemented
- PostgreSQL
- Supabase storage
- Resend inbound email
- Anthropic / OpenAI / Gemini provider abstraction
- Google OAuth for sign-in

### 12.2 Present in Product Language or Settings but Not Yet Full First-Class Platform Features
- broader Gmail connection status language remains in parts of the workspace
- SSO is not yet a fully implemented enterprise auth stack
- publishing and distribution are not yet end-to-end product modules

### 12.3 Current Product Boundaries
BrandOS is intentionally opinionated in V1.

Current in-scope:
- brand kits
- inbox-driven intake
- campaigns workspace
- LinkedIn and blog generation
- reviewer-first editing and iteration

Current out-of-scope or not yet first-class:
- publishing/distribution to channels
- campaign calendars and deadline planning beyond publish-date visibility
- deleted campaign history UI
- broad analytics and approval reporting

### 12.2 Present in Product Language or Settings but Not Yet Full First-Class Platform Features
- broader Gmail connection status language remains in parts of the workspace
- SSO is not yet a fully implemented enterprise auth stack
- publishing and distribution are not yet end-to-end product modules

## 13. Business Model Logic
BrandOS is best positioned as a B2B SaaS workflow product for marketing teams rather than a consumer AI tool.

Commercial value drivers:
- number of brands managed
- number of content marketers
- AI usage volume
- workflow depth
- operational savings from faster content turnaround and fewer revision cycles

Most credible sales narrative:
- BrandOS reduces prompt repetition
- BrandOS centralizes brand memory
- BrandOS lowers the cost of multi-brand content operations
- BrandOS improves confidence in AI-generated marketing content

## 14. Differentiators
BrandOS differentiates from generic AI tools through:
- persistent brand memory
- brand-specific generation context
- structured inbox-driven campaign intake
- brand diff proposals from stakeholder threads
- human-reviewed AI updates rather than blind automation
- focused enterprise-style multi-brand workflow

## 15. Risks and Product Constraints
### 15.1 Product Risks
- inbound email quality varies heavily by email client and forwarding format
- AI extraction quality depends on source clarity
- some stakeholder guidance is campaign-specific, not brand-wide
- teams may want more channels than the current V1 scope

### 15.2 Technical Risks
- forwarded thread reconstruction is inherently imperfect
- AI outputs require careful fallback handling
- production migrations must be applied manually in hosted environments
- file extraction quality can vary based on document structure

### 15.3 UX Risks
- too much raw email data can overwhelm the user
- too much automation without review can erode trust
- too many actions without prioritization can clutter the inbox

## 16. What BrandOS Already Does Well
- clear multi-step onboarding into a structured brand kit
- strong AI-to-human review pattern
- persistent session-based generation workflow
- support for durable brand memory plus transient campaign context
- practical inbound email intake foundation
- clear destructive-action handling for brands and campaigns

## 17. High-Value Next Steps
Natural next areas for continued investment:
- richer inbox thread reconstruction and grouping
- more sophisticated brand diff approval UX
- stronger archive and audit history for inbox actions
- broader content format support
- stronger enterprise security and SSO support
- collaboration features across multiple teammates
- analytics on brand usage, content volume, and revision patterns

## 18. Summary
BrandOS is a focused AI content operations platform for multi-brand marketing teams. It combines structured brand memory, inbox-driven campaign intake, AI extraction, and content generation into one workflow.

Its business value is straightforward:
- less repeated setup work
- better brand consistency
- faster campaign execution
- more confidence using AI in real marketing operations

Its technical design is also pragmatic:
- React frontend
- Express backend
- PostgreSQL data model
- AI provider abstraction
- storage-backed guideline ingestion
- webhook-based inbound email processing

In its current form, BrandOS is already more than a content generator. It is becoming a system of record and execution layer for AI-assisted brand-aware content marketing.
