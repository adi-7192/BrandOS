# BrandOS — Product Design Flow
## Onboarding (S1–S7) + Content Generation (G1–G5)

> **Internal · Design Specification · Revised with Sakshi Feedback · April 2026**

| Field | Detail |
|---|---|
| **Document** | BrandOS Product Design Flow — Onboarding + Content Generation |
| **Version** | 2.0 — Post Sakshi Review |
| **Screens covered** | 15 screens (S1–S7 onboarding + G1–G5 generation) |
| **Persona** | Internal content marketer — multi-brand enterprise conglomerate |
| **Date** | April 2026 |
| **Status** | Revised — Ready for Prototype Build |

---

## 1. Complete Screen Flow

The full product flow runs from onboarding through content generation. **Phase 1 onboarding (S1–S3)** collects team and brand context. **Phase 2 onboarding (S4a–S7)** builds the brand kit. The **content generation flow (G1–G5)** uses the inbox and brand kit to produce channel-ready content.

| ID | Screen | URL | Description |
|---|---|---|---|
| **S1** | Team context | `.../onboarding/team` | Role, team/department, number of brands managed. Company pre-filled from sign-up. |
| **S2** | Brand name | `.../onboarding/brand-name` | First brand name, primary market, brand language. Personalises all subsequent screens. |
| **S3** | Content types | `.../onboarding/content-types` | Multi-select: what team produces. Available now (LinkedIn, Blog) + Coming soon tiles for data capture. |
| **UG** | Platform unlock | `.../onboarding/unlocked` | Acknowledgement gate. Echoes Phase 1 decisions. Single CTA to begin Phase 2. |
| **S4a** | Brand content | `.../onboarding/brand-content` | Website URL, past content examples, upload brand guidelines. All optional but encouraged. |
| **S4b** | Audience + campaign | `.../onboarding/audience-campaign` | Audience type, buyer seniority, age, industry, campaign type, funnel stage, tone shift, proof style, content role, content goal, publishing frequency (required), voice formality. |
| **S5a** | Generating | `.../onboarding/generating` | 5-step animated extraction. Auto-advances to S5b. No user action required. |
| **S5b** | Review kit cards | `.../onboarding/review-kit` | 5 cards: Brand voice, Vocabulary, Restricted words, Channel rules, Campaign core why (optional). |
| **S6** | Confidence test | `.../onboarding/confidence-test` | Sample post. 3 reactions with 3 recovery paths each. Positive / mixed / negative states. |
| **S7** | Kit live | `.../onboarding/kit-live` | Summary chips including language, market, and frequency. Start generating + Add brand CTAs. |
| **G1** | Brand inbox | `.../inbox` | Checkbox-based email selection (single or multi). Bulk "Use this brief" at bottom. Refresh per card. |
| **G2** | Brief confirmation | `.../generate/brief` | Extracted fields with source badges. Audience type field added. Missing fields below divider. |
| **G3** | Content preview | `.../generate/preview` | Structured preview for LinkedIn and blog. Version history with restore. Editable inline. |
| **G4** | Generating | `.../generate/creating` | 6-step generation with context panel showing all inputs including language and key message. |
| **G5** | Output workspace | `.../generate/output` | Tabbed LinkedIn/blog output. Iteration bar, contextual chips, format compliance. Post to LinkedIn (V2). |

---

## Part A — Onboarding Flow (S1 to S7)

The onboarding flow runs across two phases separated by a platform unlock gate.

- **Phase 1 (S1–S3):** Collects team and brand context — under 4 minutes
- **Phase 2 (S4a–S7):** Builds the first brand kit — under 8 minutes
- **Total target:** Under 13 minutes from sign-up to first kit live

---

### S1 — Team Context

> **Phase 1 · Step 1 of 3** — "Tell us about your team"
> `app.brandos.app/onboarding/team`

S1 replaces the original "role + company" screen. Company is already collected at sign-up. S1 now asks for role, team/department, and brand count — three fields that give enterprise-relevant context without duplication.

| Element | Design Rationale |
|---|---|
| **Your role** | Job title or function. Helps personalise how the tool is presented. Free text input. |
| **Team or department** | Dropdown: Brand and Content / Marketing Communications / Digital Marketing / Corporate Communications / Social Media / PR and External Affairs / Creative Studio / Other. Enterprise-appropriate — asks about team, not just individual. |
| **How many brands does your team manage?** | Dropdown: 1–2 / 3–4 / 5–8 / 9+. Sets up dashboard expectations — a user managing 9+ brands needs a very different workspace default than someone managing 1. |
| **Progress indicator** | Step 1 of 3 shown as three numbered dots. Active dot fills, future dots are outlined. Knowing the end of the tunnel reduces abandonment. |

---

### S2 — Brand Name

> **Phase 1 · Step 2 of 3** — "Name your first brand"
> `app.brandos.app/onboarding/brand-name`

S2 gains two new fields beyond brand name: **primary market** and **brand language**. These are critical for conglomerate marketers managing brands across multiple European markets — a French brand must generate French content by default.

| Element | Design Rationale |
|---|---|
| **Brand name** | Single text field. Helper text: "e.g. BHV Marais — the brand you write for, not your employer." Brand name typed here propagates to every subsequent screen, the unlock gate, kit cards, confidence test badge, and S7 summary. |
| **Primary market** | Dropdown: France / United Kingdom / Germany / United States / Pan-European / Global / Other. Calibrates cultural references and platform norms for this brand's audience. |
| **Brand language** | Dropdown: English / French / German / Spanish / Other. Content is generated in this language. For a French brand like BHV Marais, selecting French means all generated content defaults to French — no per-session configuration needed. |
| **Progress indicator** | Step 2 of 3. One dot behind, one ahead. User can see they are almost through Phase 1. |

---

### S3 — Content Types

> **Phase 1 · Step 3 of 3** — "What does your team produce?"
> `app.brandos.app/onboarding/content-types`

> **Key decision:** S3 is a **data capture screen**, not a product limitation screen.
> Sakshi feedback: limiting to Blog + LinkedIn causes drop-offs for users who produce other content types.
> All content types are shown. Available now tiles are selectable. Coming soon tiles capture roadmap data.
> Continue button enabled once at least one "Available now" tile is selected.

S3 is reframed from "what do you mainly write?" (individual framing) to "what does your team produce?" (enterprise framing). The screen is a multi-select grid of 8 content types.

| Element | Design Rationale |
|---|---|
| **LinkedIn posts** *(Available now)* | Selectable tile. Primary V1 format. Selected tiles shown as summary chips below the grid. |
| **Blog posts** *(Available now)* | Selectable tile. Primary V1 format. |
| **Email newsletters** *(Coming soon)* | Dashed border, visually de-emphasised. User can select to signal interest — captured as roadmap data. Does not enable the Continue button alone. |
| **Ad copy, Press releases, Video scripts, Social captions, Case studies** *(Coming soon)* | Six additional coming soon tiles. Same selection behaviour. Together these eight options capture the full picture of what enterprise marketing teams produce. |
| **Multi-select** | Teams produce multiple content types. Forcing a single choice was artificially limiting and lost roadmap signal. |
| **Selection summary chips** | Appear below the grid as tiles are selected. Shows which formats will be active in the workspace. |

---

### UG — Platform Unlock Gate

> **Gate** — "Phase 1 complete — platform access granted"
> `app.brandos.app/onboarding/unlocked`

The unlock gate is a deliberate pause between Phase 1 and Phase 2. It confirms the user is now in the platform, echoes back their four Phase 1 decisions, and frames the brand kit as something built inside the product rather than a gate before entry.

| Element | Design Rationale |
|---|---|
| **Phase 1 summary card** | Shows: Workspace (company), Team (department), First brand (name), Formats selected. The user sees their choices confirmed before Phase 2 begins — reduces anxiety about errors. |
| **Brand name personalisation** | Addresses the user's specific brand: "Now let's build [Brand Name]'s voice kit." First moment personalisation is fully visible. |
| **Single CTA: Build brand kit** | No secondary links. Phase 2 is the right next step — the dashboard is accessible but empty, so this gate directs the user to the one valuable action. |
| **Phase 2 label** | "Phase 2 · 2 steps · takes about 5 minutes" — sets the expectation that what follows is structured and time-bounded. |

---

### S4a — Brand Content

> **Phase 2 · Step 1 of 2** — "Seed content for the AI"
> `app.brandos.app/onboarding/brand-content`

S4 is split into two screens — S4a for brand content, S4b for audience, campaign context, and goals. This honours Sakshi's principle: **one screen, one task.** S4a is a clean three-field screen — the user provides the raw material the AI needs to understand how this brand sounds.

| Element | Design Rationale |
|---|---|
| **Website URL** | Single URL input. The AI reads the live website to extract tone, vocabulary, and structure from existing published content. |
| **Past content examples** | Textarea combining past campaigns and brand copy (previously two separate fields). Placeholder: "Paste a past campaign, LinkedIn post, blog excerpt, or any copy that already sounds like this brand." This is the strongest voice signal available. |
| **Upload brand guidelines** | File upload accepting PDF and DOCX. Covers brand guide, tone doc, and brand copy documents. Labelled Optional — the AI reads it so the user does not have to re-type the rules each time. |
| **Skip link** | Quiet text link: "Skip brand content — I'll add it later." Skipping produces a lower-confidence kit; the system signals this in S5b card labels. |

---

### S4b — Audience, Campaign, Goal

> **Phase 2 · Step 2 of 2** — "Audience, campaign context, and goal"
> `app.brandos.app/onboarding/audience-campaign`

S4b collects all audience, campaign, and goal parameters as dropdowns. All inputs are optional **except publishing frequency**, which Sakshi explicitly mentioned as a missing and important parameter. Every field has a `?` tooltip explaining why it matters.

#### Brand Audience Section

| Element | Design Rationale |
|---|---|
| **Audience type** | Dropdown: B2B decision makers / Young professionals / General consumers / Parents and families / Custom — I'll describe my audience. |
| **Buyer seniority** | Dropdown: C-suite / Director VP / Manager / Practitioner / Mixed. C-suite content is strategic and brief; practitioner-level can go deep and technical. |
| **Age range** | Dropdown. Affects cultural references and platform comfort level. |
| **Industry or sector** | Free text. Too variable to pre-define. |
| **Which industry are you targeting?** | Dropdown: Retail / Financial services / Technology and SaaS / Healthcare / Manufacturing / Media / Professional services / Education / Public sector / Hospitality / Other. |

#### Campaign Context Section

| Element | Design Rationale |
|---|---|
| **Campaign type** | Dropdown: Product launch / Brand awareness / Seasonal / Thought leadership / PR and press / Community. Shapes the content structure. |
| **Funnel stage** | Dropdown: Top of funnel — awareness / Mid funnel — consideration / Bottom of funnel — decision. The single biggest lever for B2B content effectiveness. |
| **Tone shift** | Dropdown: More urgent / More celebratory / More intimate / More authoritative / More playful / Keep baseline. Layered on top of brand voice — does not replace it. |
| **Proof point style** | Dropdown: Data-led / Case study-led / Opinion-led / Mixed. |
| **Content role in the sales cycle** | Dropdown: Standalone / Sales enablement / Account-based (ABM) / Partner co-marketing. |

#### Content Goal & Cadence Section

| Element | Design Rationale |
|---|---|
| **What should this content achieve?** | Dropdown: Lead generation / Brand visibility / Thought leadership / PR and press. Determines CTA style and closing structure. |
| **Publishing frequency** | Dropdown: Daily / 2–3 times per week / Weekly / Bi-weekly / Monthly or less. **Required** (marked in red). High-frequency teams need shorter, punchier content; low-frequency teams can invest in longer pieces. |
| **Voice formality** | Optional, hidden behind a checkbox gate. When ticked, a five-point slider reveals from Conversational to Formal with a Balanced default. |

---

### S5a — AI Generating

> **Phase 2 · Step 3 of 5** — "AI extraction in progress"
> `app.brandos.app/onboarding/generating`

S5a shows five labelled extraction steps as the AI builds the brand kit. The screen **auto-advances** to S5b — no user action required.

| Element | Design Rationale |
|---|---|
| **5 extraction steps** | Reading website content → Identifying brand voice patterns → Extracting vocabulary and tone → Mapping audience signals → Drafting kit cards. Each step shown at ~700ms intervals. |
| **Auto-advance** | The only screen in the entire flow with no button. The automatic transition is the payoff. |
| **Kit progress bar** | 5-segment bar at top. Fills progressively: S4a done · S4b done · extracting (active) · review · confidence test. |

---

### S5b — Review Kit Cards

> **Phase 2 · Step 4 of 5** — "Review and approve the AI-drafted kit"
> `app.brandos.app/onboarding/review-kit`

S5b presents five AI-drafted cards. The user is a **reviewer, not an author**. Each card has Approve and Edit actions. Approved cards shift to a teal "Approved" badge.

| Card | Element | Design Rationale |
|---|---|---|
| **Card 1** | Brand voice | Three adjectives extracted from seed content. Renamed from "Tone adjectives." Subtitle: "Used to calibrate every generation for this brand." |
| **Card 2** | Vocabulary to use | 5–8 word chips extracted from past content. |
| **Card 3** | Restricted words | AI-suggested words in red chip style with a lock icon. User can add terms via "+ Add word." Enforced at every generation — never overridden by tone shift. |
| **Card 4** | Channel rules | One line each for LinkedIn and Blog: word limits, hashtag counts, hook requirements, structural rules. |
| **Card 5** | Campaign core why *(Optional)* | Dashed-border opt-in toggle. When ticked, a free-text field reveals for a single-line brand proposition. Used as the anchor line for both formats at generation. |

**Card order rationale:** Brand voice → Vocabulary → Restrictions → Channel rules. Strategic to tactical.

---

### S6 — Confidence Test

> **Phase 2 · Step 5 of 5** — "Sample post — three reactions, three recovery paths"
> `app.brandos.app/onboarding/confidence-test`

S6 generates one sample post using the complete brand kit. The sample post badge includes **funnel stage** from S4b context.

#### Positive State — "This sounds right"

| Element | Design Rationale |
|---|---|
| **Green confirmation banner** | "The kit looks well-calibrated for this brand. You can still edit any card before going live." |
| **Approve and continue** | Active immediately. User proceeds to S7. |
| **Back to kit** | Available in all three states. |

#### Mixed State — "Close but not quite"

| Element | Design Rationale |
|---|---|
| **Recovery option 1 — Regenerate** *(pre-selected)* | Chip selector: tone too formal / wrong vocabulary / too long / weak opening / CTA missing. Plus free text. |
| **Recovery option 2 — Edit draft directly** | Opens the sample post as an inline rich-text editor. Kit stays unchanged. |
| **Recovery option 3 — Go back to kit** | Returns to S5b to adjust brand voice, vocabulary, or channel rules before re-testing. |

#### Negative State — "Doesn't sound like us"

| Element | Design Rationale |
|---|---|
| **Go back ranked first, labelled Recommended** | A completely wrong output means the kit is miscalibrated — regenerating gives a second bad output. |
| **Amber advisory banner** | "If the output feels completely wrong, going back to the kit gives the best result." |
| **All three paths still available** | Ranked order communicates priority without removing choice. |
| **Approve disabled** | User cannot approve a negative-rated output without at least one corrective action. |

---

### S7 — Brand Kit Live

> **Phase 2 complete** — "Kit confirmed — first session complete"
> `app.brandos.app/onboarding/kit-live`

S7 is a confirmation screen. The kit is live and summarised. Phase 3 items are signposted as **informational text only** — not demanded.

| Element | Design Rationale |
|---|---|
| **Kit summary chips** | Brand voice adjectives · Restricted word count · Channel rules · Content goal · Language and market (from S2) · Publishing frequency (from S4b). |
| **Primary CTA: Start generating content** | Takes user to content generation flow with brand kit pre-loaded. |
| **Secondary CTA: Add another brand** | Quiet underline link. Should not pull users away from generating their first content. |
| **Phase 3 signpost (informational only)** | Connect Gmail, add group layer, add next brand. Text only — no buttons. |

---

## Part B — Content Generation Flow (G1 to G5)

The content generation flow is triggered from the Brand Updates inbox. It uses campaign briefs extracted from tagged Gmail emails and the stored brand kit to generate LinkedIn posts and blog posts in 3 steps: confirm brief (G2), preview (G3), generate (G4). Output and iteration happen in G5.

---

### G1 — Brand Updates Inbox

> **Content generation entry** — "Email inbox — select brief and generate"
> `app.brandos.app/inbox`

> **Simplification applied from Sakshi feedback:**
> Confidence score numbers removed from the UI surface. The user sees field matching (green = extracted, grey = not detected), not a percentage.
> The backend still runs confidence scoring to rank and gate cards — but enterprise users respond better