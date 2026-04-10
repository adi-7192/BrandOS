# First-Time User Feedback Phase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the mentor’s first-time-user feedback in phased releases that make BrandOS easier to understand, easier to activate, and easier to trust without changing product scope beyond the current MVP.

**Architecture:** Ship this in five product phases. Phase 1 fixes comprehension inside the product loop. Phase 2 makes integrations and activation visible. Phase 3 cleans Settings information architecture. Phase 4 improves entry and marketing clarity. Phase 5 validates outcomes and closes remaining first-run gaps. Each phase should be independently shippable.

**Tech Stack:** React, React Router, BrandOS frontend page/lib view-model pattern, existing LinkedIn personal-posting backend/routes, current inbox/generation workflow, lightweight product docs.

---

## Delivery Strategy

### Why this sequence

The mentor’s strongest friction was not visual polish. It was:
- not understanding how BrandOS works end to end
- not knowing when LinkedIn must be connected
- not finding the right mental model in Settings

So the plan prioritizes:
1. product-loop clarity
2. activation clarity
3. settings cleanup
4. front-door coherence
5. validation

### Phase order

1. Phase 1: Core workflow legibility and zero-data clarity
2. Phase 2: LinkedIn activation and integrations discoverability
3. Phase 3: Settings information architecture cleanup
4. Phase 4: Entry, onboarding, and landing-page coherence
5. Phase 5: Validation, instrumentation, and follow-up iteration

### Out of scope

- business/company-page LinkedIn posting
- major inbox ingestion architecture changes
- demo video production as a product requirement
- mobile-specific redesign

---

## Phase 1: Core Workflow Legibility And Zero-Data Clarity

**Outcome:** A first-time user with little or no inbox data can still understand what BrandOS does, how a brief becomes content, and where they are in the workflow.

**User problems solved:**
- “How does this actually go from email to content?”
- “I can’t replicate the journey because my inbox is not configured.”
- “I made a brand kit, but I still don’t understand the system.”

**Files:**
- Modify: `client/src/pages/dashboard/Dashboard.jsx`
- Modify: `client/src/pages/inbox/Inbox.jsx`
- Modify: `client/src/pages/generate/Brief.jsx`
- Modify: `client/src/pages/generate/Preview.jsx`
- Modify: `client/src/pages/generate/Creating.jsx`
- Modify: `client/src/pages/generate/Output.jsx`
- Modify: `client/src/lib/dashboard-flow.js`
- Modify: `client/src/lib/inbox-view.js`
- Modify: `client/src/lib/inbox-ai-view.js`
- Modify: `client/src/lib/generation-flow.js`
- Test: `client/src/lib/dashboard-flow.test.js`
- Test: `client/src/lib/inbox-view.test.js`
- Test: `client/src/lib/inbox-ai-view.test.js`
- Test: `client/src/lib/generation-flow.test.js`

### Phase 1A: Add a product-loop explainer

- [ ] Add a compact “How BrandOS works” explainer model to `client/src/lib/dashboard-flow.js`.
- [ ] Render that explainer on `client/src/pages/dashboard/Dashboard.jsx` in a visible first-run panel.
- [ ] Mirror the same three-step explanation on the inbox screen in `client/src/pages/inbox/Inbox.jsx`.
- [ ] Add tests in `client/src/lib/dashboard-flow.test.js` for explainer state visibility and copy shape.

**Definition of done:**
- Dashboard and Inbox both explain the same loop:
  - stakeholder input arrives
  - BrandOS turns it into a brief
  - BrandOS generates reviewable content

### Phase 1B: Upgrade empty states from “missing data” to “guided next steps”

- [ ] Update `client/src/lib/inbox-view.js` to expose first-run empty-state guidance instead of only counts/status.
- [ ] Update `client/src/pages/inbox/Inbox.jsx` to render:
  - how to forward a thread
  - what AI extracts
  - what the user reviews next
- [ ] Add a manual-brief guidance block in `client/src/pages/generate/Brief.jsx` explaining when to use manual brief creation.
- [ ] Add coverage in `client/src/lib/inbox-view.test.js` and `client/src/lib/generation-flow.test.js`.

**Definition of done:**
- Empty screens teach what to do next.
- A user does not need prior knowledge to interpret the inbox or brief screens.

### Phase 1C: Add provenance cues through the generation journey

- [ ] Extend `client/src/lib/generation-flow.js` with a simple origin model:
  - `inbox`
  - `manual`
  - `sample`
- [ ] Show source/provenance badges in:
  - `client/src/pages/generate/Brief.jsx`
  - `client/src/pages/generate/Preview.jsx`
  - `client/src/pages/generate/Creating.jsx`
  - `client/src/pages/generate/Output.jsx`
- [ ] Add small “using your brand kit rules” helper copy at preview/output stages.
- [ ] Add tests in `client/src/lib/generation-flow.test.js`.

**Definition of done:**
- Users can tell where the current content came from.
- Users can see that brand-kit context is shaping output.

### Phase 1D: Add a sample-data path for zero-data users

- [ ] Add a lightweight sample-flow entry point on Dashboard or Inbox.
- [ ] Represent the sample flow as clearly labeled example data, not real data.
- [ ] Reuse existing generation flow components instead of building a separate fake flow.
- [ ] Extend `client/src/lib/inbox-ai-view.js` and/or `client/src/lib/generation-flow.js` to support a sample origin state.
- [ ] Add tests for sample labeling in `client/src/lib/inbox-ai-view.test.js` and `client/src/lib/generation-flow.test.js`.

**Definition of done:**
- A brand-new user can click into a safe example and understand the workflow.
- The sample path is clearly separated from real inbox content.

**Phase 1 verification:**
- Run: `node --test client/src/lib/dashboard-flow.test.js client/src/lib/inbox-view.test.js client/src/lib/inbox-ai-view.test.js client/src/lib/generation-flow.test.js`
- Run: `npm run build --workspace=client`

**Phase 1 exit criteria:**
- Zero-data users can understand the product loop without founder explanation.
- Inbox, brief, preview, and output screens all reinforce the same story.

---

## Phase 2: LinkedIn Activation And Integrations Discoverability

**Outcome:** Users understand early that LinkedIn is a one-time connection required for direct publishing, and they can discover integrations before they hit a blocked publish action.

**User problems solved:**
- “Why wasn’t LinkedIn part of setup?”
- “What happens after I connect LinkedIn?”
- “Is this for personal posting or business pages?”

**Files:**
- Modify: `client/src/pages/onboarding/S7KitLive.jsx`
- Modify: `client/src/pages/settings/Settings.jsx`
- Modify: `client/src/pages/generate/Output.jsx`
- Modify: `client/src/lib/kit-live-flow.js`
- Modify: `client/src/lib/linkedin-view.js`
- Modify: `client/src/lib/settings-view.js`
- Test: `client/src/lib/kit-live-flow.test.js`
- Test: `client/src/lib/linkedin-view.test.js`
- Test: `client/src/lib/settings-view.test.js`
- Optional modify: `docs/superpowers/specs/2026-04-10-linkedin-personal-posting-design.md`

### Phase 2A: Make onboarding completion an activation checklist

- [ ] Extend `client/src/lib/kit-live-flow.js` with a post-onboarding activation checklist model.
- [ ] Update `client/src/pages/onboarding/S7KitLive.jsx` to show three concrete next steps:
  - connect inbox
  - connect LinkedIn
  - create first campaign
- [ ] Add `Skip for now` treatment for LinkedIn so the checklist remains helpful, not blocking.
- [ ] Add tests in `client/src/lib/kit-live-flow.test.js`.

**Definition of done:**
- LinkedIn is visible at onboarding completion, not buried later in Settings.

### Phase 2B: Standardize LinkedIn explanation across the product

- [ ] Update `client/src/lib/linkedin-view.js` so every state exposes consistent explanation copy:
  - connect once
  - post directly from BrandOS afterwards
  - personal account only in v1
- [ ] Update `client/src/pages/settings/Settings.jsx` to reuse that model.
- [ ] Update `client/src/pages/generate/Output.jsx` to match the same language.
- [ ] Add tests in `client/src/lib/linkedin-view.test.js`.

**Definition of done:**
- The explanation of LinkedIn no longer changes from page to page.

### Phase 2C: Create a clearly named integrations area

- [ ] Refactor `client/src/pages/settings/Settings.jsx` so integrations are grouped together and visually prominent.
- [ ] Update `client/src/lib/settings-view.js` to expose grouped settings sections or nav anchors.
- [ ] Show:
  - inbox/email intake
  - LinkedIn
  - Google sign-in/access state
  - optional future integrations as roadmap tiles only if helpful
- [ ] Add tests in `client/src/lib/settings-view.test.js`.

**Definition of done:**
- A user can go to Settings and immediately identify the integrations surface.

### Phase 2D: Clarify current scope and future scope

- [ ] Remove any ambiguous copy that implies company-page posting is already supported.
- [ ] Add explicit “personal LinkedIn posting in v1” language where setup or publish decisions happen.
- [ ] Keep future-state hints brief and non-blocking.

**Definition of done:**
- Users do not confuse current personal posting with business-page support.

**Phase 2 verification:**
- Run: `node --test client/src/lib/kit-live-flow.test.js client/src/lib/linkedin-view.test.js client/src/lib/settings-view.test.js`
- Run: `npm run build --workspace=client`

**Phase 2 exit criteria:**
- LinkedIn setup is visible before the first attempted publish.
- Users understand what connecting LinkedIn unlocks.

---

## Phase 3: Settings Information Architecture Cleanup

**Outcome:** Settings feels like a clean control center for profile, workspace, integrations, and access instead of a mixed collection of system terms.

**User problems solved:**
- “What is AI status?”
- “Why is security here and what does it mean?”
- “Where do I go for integrations?”

**Files:**
- Modify: `client/src/pages/settings/Settings.jsx`
- Modify: `client/src/lib/settings-view.js`
- Modify: `client/src/lib/linkedin-view.js`
- Modify: `server/src/routes/settings.js`
- Test: `client/src/lib/settings-view.test.js`
- Test: `server/src/routes/settings.test.js`

### Phase 3A: Re-group Settings around user tasks

- [ ] Reorganize `client/src/lib/settings-view.js` into explicit page sections:
  - profile
  - workspace
  - integrations
  - content preferences
  - access and sign-in
- [ ] Update `client/src/pages/settings/Settings.jsx` to render those sections in that order.
- [ ] Add descriptive helper text for each section.
- [ ] Update tests in `client/src/lib/settings-view.test.js`.

**Definition of done:**
- Section titles are understandable to a new user without product context.

### Phase 3B: Remove or rename vague/internal concepts

- [ ] Audit all labels in `client/src/pages/settings/Settings.jsx`.
- [ ] Replace or remove `AI status` if it does not help a user take action.
- [ ] Rename `Security` to `Access and sign-in` unless a true security-center concept exists.
- [ ] Keep any system/internal-only data off the main settings surface.

**Definition of done:**
- No top-level section uses unclear internal language.

### Phase 3C: Keep server-backed state aligned with the new settings model

- [ ] Verify `server/src/routes/settings.js` returns all data required for the regrouped settings screen.
- [ ] Add any missing mapped fields in a backward-compatible way.
- [ ] Add or update regression tests in `server/src/routes/settings.test.js`.

**Definition of done:**
- The frontend grouping is fully supported by the settings payload.

**Phase 3 verification:**
- Run: `node --test client/src/lib/settings-view.test.js server/src/routes/settings.test.js`
- Run: `npm run build --workspace=client`

**Phase 3 exit criteria:**
- Settings is easier to scan.
- Integrations are easy to find.
- Access/sign-in states are understandable.

---

## Phase 4: Entry, Onboarding, And Landing-Page Coherence

**Outcome:** The front door and onboarding path feel like one coherent product with a clear promise and a clear first-run journey.

**User problems solved:**
- “Start setup” and “Sign in” feel disconnected
- it is not obvious what will happen after account creation
- the landing page value proposition is not sharp enough

**Files:**
- Modify: `client/src/pages/marketing/LandingPage.jsx`
- Modify: `client/src/pages/auth/SignUp.jsx`
- Modify: `client/src/pages/auth/SignIn.jsx`
- Modify: `client/src/pages/auth/CompleteProfile.jsx`
- Modify: `client/src/pages/onboarding/S1Team.jsx`
- Modify: `client/src/lib/auth-flow.js`
- Test: `client/src/lib/auth-flow.test.js`
- Optional modify: `docs/brandos-platform-overview-2026-04-09.md`

### Phase 4A: Unify sign-in and sign-up framing

- [ ] Update `client/src/pages/auth/SignUp.jsx` and `client/src/pages/auth/SignIn.jsx` so they share a matching structure and purpose language.
- [ ] Clarify:
  - new user creates a workspace
  - returning user signs in to an existing workspace
- [ ] Add a short “what happens next” line to both pages.
- [ ] Update `client/src/lib/auth-flow.js` and `client/src/lib/auth-flow.test.js` if view-model state is used.

**Definition of done:**
- The two entry pages feel related and intentional.

### Phase 4B: Add onboarding orientation at the start

- [ ] Update `client/src/pages/onboarding/S1Team.jsx` to include a simple setup roadmap.
- [ ] Explain the upcoming phases:
  - workspace and brand memory
  - content inputs and preferences
  - generation and publishing
- [ ] Make the roadmap concise and non-blocking.

**Definition of done:**
- Users know what onboarding is leading toward before filling the first setup form.

### Phase 4C: Sharpen the landing-page value proposition

- [ ] Update hero copy in `client/src/pages/marketing/LandingPage.jsx`.
- [ ] Add a clearer “from scattered briefs and repeated prompting -> one workspace with remembered brand context” value statement.
- [ ] Add benefit framing around speed, fewer rewrites, and fewer tool hops.
- [ ] Avoid unsupported hard metrics unless validated.

**Definition of done:**
- A new visitor can explain what BrandOS replaces and why it is useful.

**Phase 4 verification:**
- Run: `node --test client/src/lib/auth-flow.test.js`
- Run: `npm run build --workspace=client`

**Phase 4 exit criteria:**
- The marketing and auth surfaces set accurate expectations.
- Onboarding feels like the start of a complete workflow, not isolated setup.

---

## Phase 5: Validation, Instrumentation, And Follow-Up Iteration

**Outcome:** The team can measure whether the revised first-run experience is actually clearer and can prioritize the next iteration based on evidence.

**User problems solved:**
- confusion is currently anecdotal
- the team needs evidence of whether fixes worked

**Files:**
- Create: `docs/product/usability-research-round-2.md`
- Create: `docs/product/mentor-feedback-synthesis.md`
- Optional modify: analytics/event tracking locations if already present

### Phase 5A: Capture the revised learning agenda

- [ ] Write `docs/product/mentor-feedback-synthesis.md` summarizing:
  - original confusion points
  - phases shipped
  - hypotheses being tested
- [ ] Write `docs/product/usability-research-round-2.md` with the next user-test script.

**Definition of done:**
- The team has a consistent research brief for the next round.

### Phase 5B: Define instrumentation and observation points

- [ ] Track first-run drop-off conceptually at:
  - landing -> sign-up
  - sign-up -> onboarding completion
  - onboarding completion -> integration setup
  - integration setup -> first generation
  - generation -> first publish attempt
- [ ] If event tracking already exists, add the missing events.
- [ ] If event tracking does not exist yet, document the required event names and properties before implementation.

**Definition of done:**
- The team can observe whether users are still getting lost at the same moments.

### Phase 5C: Run a focused usability check

- [ ] Test with 3-5 first-time users after Phases 1-4 ship.
- [ ] Confirm whether users can:
  - explain what BrandOS does
  - find how inbox input becomes content
  - understand when LinkedIn must be connected
  - find integrations in Settings
  - understand personal-posting scope

**Definition of done:**
- The next iteration is based on actual observed user behavior.

**Phase 5 exit criteria:**
- The team has evidence on clarity, activation, and first-run comprehension.

---

## Suggested Release Strategy

### Release A
- Phase 1
- Phase 2A
- Phase 2B

Reason:
- This is the fastest way to make the product understandable at the point of use.

### Release B
- Phase 2C
- Phase 2D
- Phase 3

Reason:
- This consolidates integrations and fixes Settings navigation/structure.

### Release C
- Phase 4
- Phase 5

Reason:
- This sharpens the front door and measures whether the core fixes worked.

---

## Verification Checklist

- [ ] Each phase ships with updated tests for its view-model logic.
- [ ] `npm run build --workspace=client` passes after every frontend phase.
- [ ] Settings payload changes are covered in `server/src/routes/settings.test.js`.
- [ ] LinkedIn-related messaging stays consistent across onboarding, settings, and output.
- [ ] No copy implies business-page posting before that feature exists.

---

## Final Success Criteria

By the end of all five phases:
- a first-time user understands the BrandOS workflow without founder narration
- a first-time user knows when and why to connect LinkedIn
- Settings is organized around user tasks
- landing and auth pages explain the product more clearly
- the team can validate whether confusion has materially decreased
