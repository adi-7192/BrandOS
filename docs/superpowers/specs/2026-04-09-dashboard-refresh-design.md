# BrandOS Dashboard Refresh Design

Date: 2026-04-09
Status: Proposed and validated in text review
Owner: Codex

## Goal

Refresh the authenticated BrandOS dashboard so it helps a content marketer answer two questions immediately:

- what should I work on next
- how is my workspace doing

The dashboard should stay calm and concise, keep the current BrandOS design system, and only surface data that exists in the product today.

## Product Direction

Chosen direction: `Balanced upgrade`

Interpretation:

- keep the current visual language and page shell
- improve information hierarchy rather than redesigning the whole product
- place action and health in the same top area instead of forcing one global priority
- avoid speculative analytics or campaign-management UI that the current data model cannot support truthfully

## User Experience Principles

- The first screen should help a user choose between new intake and ongoing work without guessing for them.
- The dashboard should feel stable from visit to visit. Only the content inside sections changes.
- Every number or item on the page should map to a real entity in the database.
- The page should remain scannable in under ten seconds.
- Empty states should still guide progress without making the workspace feel broken.

## Current Dashboard

Today the dashboard includes:

- a greeting header
- a four-card KPI row
- a large `Recent Activity` section
- a right-rail `Needs Attention` section

This works, but the most important user actions are split between multiple areas and the page does not yet show a concise per-brand workspace view.

## Proposed Dashboard

### 1. Greeting Header

Keep the current greeting and supporting sentence.

Purpose:

- orient the user
- maintain continuity with the current dashboard

### 2. KPI Row

Keep a four-card row at the top, but tune the cards to better reflect workspace health.

Proposed cards:

- `Brand Kits`
- `Pending Briefs`
- `In Progress`
- `Saved Drafts`

Rules:

- each card uses real counts from the summary API
- each card includes a short note that clarifies state
- cards stay compact and glanceable
- cards are not overloaded with secondary metrics

### 3. Action Center

Replace the current split between `Recent Activity` and `Needs Attention` as the main top-level workflow area with one stable `Action Center`.

Layout:

- one section title: `Action Center`
- two side-by-side cards on desktop
- stacked cards on smaller screens

#### Left Card: New Briefs To Review

Purpose:

- surface fresh intake that is ready to become work

Content:

- total pending brief count
- up to three pending brief items
- each item shows:
  - brief title or email subject
  - brand name
  - relative age
  - extraction quality signal derived from matched fields or overall score
  - CTA to open the brief

Sorting:

- newest first

Empty state:

- explain that new extracted briefs will appear here
- link to inbox

#### Right Card: Continue Working

Purpose:

- let users resume work already in motion without losing context

Content:

- combined view of in-progress sessions and recent drafts
- up to three items total
- each item shows:
  - item title
  - brand name
  - item type such as `Live session` or `Saved draft`
  - relative last-updated time
  - CTA to resume

Sorting:

- most recently updated items first
- in-progress sessions appear before drafts when timestamps are similar

Empty state:

- explain that active sessions and saved drafts will appear here

### 4. Brand Portfolio

Add a full-width `Brand Portfolio` section below the Action Center.

Purpose:

- give a concise workspace-health view across brands
- surface which brands are active, under-configured, or carrying pending intake

Layout:

- table-like list using current card and border language
- one row per brand

Each row shows:

- brand name
- market and language
- kit status
- short tone summary when available
- pending brief count
- CTA to open the brand kit

Status rules:

- `Active` when the brand has kit signals such as voice or vocabulary
- `Draft` when the brand exists but the kit is still sparse

Sorting:

- brands with pending briefs first
- then most recently updated brands

Empty state:

- guide the user to create their first brand

### 5. Recent Activity

Keep `Recent Activity`, but move it below the Brand Portfolio and keep it compact.

Purpose:

- provide a quick audit trail without competing with primary actions

Content:

- latest meaningful events from recent sessions, pending briefs, drafts, and brand updates
- maximum of five or six items

Rules:

- concise item titles
- relative timestamps
- each row remains clickable

## Data Sources

The first implementation should use only existing entities already present in the schema and dashboard route.

Available sources:

- `brands`
- `brand_kits`
- `inbox_cards`
- `generation_sessions`
- `drafts`

Existing dashboard route:

- `/api/dashboard/summary`

## Backend Scope

The dashboard summary endpoint should be extended only where needed to support the new layout cleanly.

Recommended additions:

- a separate `savedDrafts` count if we rename the current `recentDrafts` KPI label to mean total drafts
- a combined `continueWorking` list built from sessions and drafts, or enough raw fields for the client to build it
- richer brand portfolio fields where useful, such as whether a kit has meaningful signals

Preferred approach:

- keep aggregation in the backend when it simplifies dashboard logic
- keep presentation-specific formatting in the client

## Explicit Non-Goals

Do not implement these in this dashboard refresh:

- campaign calendars
- upcoming deadlines
- approval-rate analytics
- review-time analytics
- campaign counts as a first-class object
- any metric that depends on a workflow not represented in the current schema

These can be explored later if the product introduces dedicated campaign or review entities.

## Interaction Model

- KPI cards remain informational first and can later become navigational if useful
- brief items open the brief flow with the selected inbox card
- live sessions open the correct generation step
- drafts open the output view with the saved draft state
- brand rows open the brand settings editor
- the dashboard should not require filters or mode toggles in this first refresh

## Responsive Behavior

- KPI row wraps cleanly across tablet and mobile
- Action Center becomes a vertical stack below desktop widths
- Brand Portfolio remains readable on smaller screens by collapsing supporting text instead of introducing dense horizontal scrolling
- Recent Activity stays single-column

## Empty and Transitional States

- If the workspace has no brands, the dashboard should still render and guide setup.
- If there are no pending briefs, the `New Briefs To Review` card should show a quiet empty state instead of disappearing.
- If there is no active work, the `Continue Working` card should show a quiet empty state instead of disappearing.
- If the workspace has no recent activity, the bottom section should explain what events will appear there.

## Testing Strategy

Implementation should include:

- unit tests for any new dashboard view-model builders
- updates to existing dashboard-flow tests for new prioritization and presentation logic
- route-level coverage for any new summary fields
- manual verification that dashboard navigation routes still work for briefs, sessions, drafts, and brands

## Rollout Plan

Phase 1 in this task:

- update dashboard summary data shape as needed
- add Action Center
- add Brand Portfolio
- refine KPI row
- compress Recent Activity

Future phase:

- deeper workspace analytics after the product has explicit campaign and approval data

## Success Criteria

The refresh is successful when:

- users can identify both new intake and existing work from the first screen
- the dashboard shows only truthful, supportable metrics
- the page feels more informative without feeling busier
- key navigation paths remain one click from the dashboard
