# BrandOS Landing Page Design

Date: 2026-04-07
Status: Proposed and validated in text review
Owner: Codex

## Goal

Design and implement a public landing page for BrandOS that acts as the product front door for internal content marketers at enterprise organizations managing multiple brands.

The page should:

- communicate that BrandOS gives AI persistent brand memory
- emphasize multi-brand workflow as a core differentiator
- feel like a modern software platform with premium polish
- route users into the existing auth flow with `Start setup` and `Sign in`
- establish a design system that can later be reused across auth, onboarding, inbox, and generation flows

## Audience

Primary persona:

- internal content marketer at a multi-brand enterprise organization
- manages several distinct brands with separate voices, markets, and rules
- works in a B2B environment and evaluates tools with an enterprise mindset
- values output quality, consistency, and clarity over novelty

## Positioning

Primary message:

`AI with brand memory for teams managing multiple brands`

Supporting message:

BrandOS stores each brand's voice kit, turns tagged campaign briefs into structured inputs, and generates on-brand LinkedIn and blog drafts without re-explaining context every session.

## Design Direction

Chosen direction: `Refined Brand-Tech`

Interpretation:

- modern software platform first
- premium and polished, but not fashion-luxury
- calm, structured, and credible
- avoids generic AI startup tropes

## Design System

### Color Palette

Locked palette: `Slate + Cobalt`

- `--bg`: `#F7F9FC`
- `--surface`: `#FFFFFF`
- `--surface-subtle`: `#EEF2F7`
- `--text`: `#111827`
- `--text-muted`: `#667085`
- `--border`: `#D7DFEA`
- `--primary`: `#2563EB`
- `--primary-hover`: `#1D4ED8`
- `--primary-soft`: `#DBEAFE`
- `--accent`: `#8FB4FF`
- `--success`: `#178A5B`
- `--warning`: `#C97A10`
- `--danger`: `#D14343`

Usage rules:

- neutrals do most of the work
- blue is the single dominant product accent
- accent blue is used sparingly for soft highlights
- semantic colors are reserved for status and validation
- no purple, neon, or rainbow UI

### Typography

- headings: `Manrope`
- body and UI: `Inter`

Type scale:

- hero display: `56/60`
- h1: `44/48`
- h2: `32/38`
- h3: `24/30`
- body large: `18/30`
- body: `16/26`
- small: `14/22`
- caption: `12/18`

Typography rules:

- headings are concise and high-contrast
- body copy is readable and enterprise-direct
- avoid decorative type treatments

### Spacing

Base spacing system:

- `4, 8, 12, 16, 24, 32, 48, 64, 80, 96`

Layout rules:

- generous section spacing on desktop
- tight but breathable card padding on mobile
- no cramped multi-column layouts below tablet

### Shape and Depth

- buttons and inputs: `12px`
- cards: `20px`
- large hero panels: `28px`

Elevation rules:

- borders carry primary separation
- shadows are soft and subtle
- large shadows are used sparingly

### Motion

- control hover and press: `180ms` to `220ms`
- section reveal: `240ms` to `320ms`
- motion uses opacity and transform only
- reduced motion collapses reveals to fade-only

## Component Language

### Navigation

- minimal top bar
- left-aligned BrandOS wordmark
- links: `How it works`, `For teams`, `Sign in`
- primary CTA: `Start setup`
- becomes sticky after initial scroll

### Buttons

Primary:

- solid cobalt background
- white text
- slightly darker hover

Secondary:

- white background
- dark text
- cool border

Tertiary:

- soft blue tint
- used for lighter emphasis only

### Cards

- white surfaces on slate background
- cool 1px borders
- moderate internal padding
- slight lift on hover where interactive

### Inputs

- white fields
- clear labels
- cool border
- cobalt focus ring

### Icons and Badges

- one outline icon family only
- chips and badges primarily neutral or soft-blue
- no overuse of badge styles

## Landing Page Structure

### 1. Top Navigation

Purpose:

- orient users immediately
- provide clear entry into the existing auth flow

Content:

- BrandOS wordmark
- `How it works`
- `For teams`
- `Sign in`
- `Start setup`

### 2. Hero

Purpose:

- establish the product category and differentiator above the fold

Headline:

`AI with brand memory for teams managing multiple brands`

Supporting copy:

BrandOS stores each brand's voice kit, turns tagged campaign briefs into structured inputs, and generates on-brand LinkedIn and blog drafts without re-explaining context every session.

Actions:

- primary: `Start setup`
- secondary: `Sign in`

Hero visual:

- believable product composition rather than abstract illustration
- should show a multi-brand workspace with brand context, incoming brief, and generated output state

### 3. Proof Strip

Purpose:

- reinforce credibility quickly without relying on customer logos

Suggested proof points:

- built for multi-brand enterprise teams
- brand voice stored once, reused every session
- LinkedIn and blog workflows in V1
- structured review before generation

### 4. Problem and Solution

Purpose:

- contrast the current manual workflow with the BrandOS workflow

Left side:

- every session starts blank
- teams re-explain tone, audience, and restrictions brand by brand

Right side:

- each brand has its own persistent voice kit
- tagged briefs become usable structured inputs
- outputs start much closer to final

### 5. How It Works

Three-step sequence:

1. capture the brand
2. bring in the brief
3. generate with context

The language should feel procedural, concrete, and product-led.

### 6. Multi-Brand Workspace

Purpose:

- make the second key differentiator explicit

Headline:

`One workspace. Distinct voices for every brand.`

Supporting message:

teams can manage market, language, vocabulary, and restrictions per brand without blending brand contexts together

### 7. Product Detail Band

Three product detail cards:

- brand kits that persist
- brief confirmation before generation
- reviewer-first output workflow

Purpose:

- connect the landing page to the real product flow already present in the application

### 8. Final CTA

Headline:

`Start building your first brand kit`

Actions:

- `Start setup`
- `Sign in`

Purpose:

- close with confident next steps rather than sales-heavy conversion language

## Art Direction

The page should feel like a polished software product, not a generic marketing site.

Rules:

- use mostly slate background plus white product surfaces
- keep a strong grid and generous whitespace
- use subtle blue-tinted highlights, not dominant gradients
- prioritize product UI compositions over illustrations or stock imagery
- keep copy concise and concrete

## Page Behavior

- sticky nav after slight scroll
- hero CTA visible immediately above the fold
- subtle section reveals only
- no carousel
- no animated counters
- no autoplay media
- mobile layout stacks copy first, then product composition, then proof points

## Routing and Integration

Current routing redirects `/` to `/signin`.

Implementation should change routing to:

- `/` -> landing page
- `/signin` -> existing sign-in page
- `/signup` -> existing sign-up page

The landing page should link into current auth flows without changing the underlying auth logic.

## Reuse Plan

This landing page should introduce reusable global design tokens for:

- colors
- typography
- radius
- shadows
- motion

Follow-up visual refresh targets after landing page:

- sign-in
- sign-up
- onboarding shell
- dashboard and inbox surfaces

## Non-Goals

- no dark mode in this first marketing implementation
- no sales-led demo funnel
- no testimonials carousel
- no stock photography
- no attempt to market unsupported V1 features

## Content Constraints

The page must align with the current product scope:

- V1 supports LinkedIn posts and blog posts only
- messaging must not imply publishing, analytics, approval workflow, or multi-user features beyond what is already defined
- the tone should stay enterprise-focused and operational rather than consumer-friendly

## Implementation Scope

Expected implementation work after spec approval:

1. add a new landing page route and component
2. move `/` from redirect to rendered landing page
3. introduce global design tokens into the shared stylesheet
4. build responsive landing page sections
5. ensure CTA links point to existing auth routes
6. verify the new route does not break current sign-in and onboarding flow

## Review Checklist

- the design direction matches `modern software platform`
- the palette is locked to `Slate + Cobalt`
- the page prioritizes brand memory and multi-brand workflow
- the CTA strategy remains `Start setup` and `Sign in`
- the implementation scope is limited to the landing page and foundational tokens
