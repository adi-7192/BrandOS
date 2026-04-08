# Customer Intent Capture — Build Spec

Build three passive intent capture touchpoints across the user journey. No separate survey screens. No interruptions. All embedded inline. All single-select chip UI. All dismissible or optional. Store responses to a table called `intent_signals`.

---

## Database

```sql
CREATE TABLE intent_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  moment VARCHAR(20) NOT NULL, -- 'signup' | 'kit_live' | 'post_generation'
  question_key VARCHAR(50) NOT NULL,
  answer VARCHAR(100) NOT NULL,
  content_piece_count INTEGER, -- only for moment 3, which piece triggered it
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Moment 1 — Sign-up screen

**Where:** Between the form fields and the submit button on `/signup`.

**Render:** Two questions, each as a horizontal row of chip-style buttons. Single select per question. No submit needed — selection records immediately via POST to `/api/intent`.

**Question 1**
```
Label: "What brought you to BrandOS today?"
question_key: "signup_trigger"
Options:
  - "Struggling with brand consistency across AI tools"
  - "Managing too many brands manually"
  - "Evaluating tools for my team"
  - "Exploring what's available"
  - "Other"
```

**Question 2**
```
Label: "How are you currently creating brand content?"
question_key: "current_method"
Options:
  - "ChatGPT or Claude directly"
  - "Jasper or similar tool"
  - "Manually without AI"
  - "Mixed approach"
  - "First time using AI for this"
```

**Rules:**
- Neither question blocks form submission. User can submit without answering.
- On chip click: record immediately, chip stays visually selected, no toast or confirmation.
- Do not re-show on sign-in.

---

## Moment 2 — S7 Kit live screen

**Where:** On `/onboarding/kit-live`, below the summary chips row and above the primary CTA button.

**Render:** A single label line + one row of chip-style buttons. Selecting one records and removes the entire row (smooth fade out). If user ignores it and clicks the CTA, record nothing and remove the row.

**Question**
```
Label: "One quick thing — what would make BrandOS essential to your workflow?"
question_key: "success_criteria"
Options:
  - "Saving time on content production"
  - "Consistent brand voice across the team"
  - "Reducing back-and-forth with brand managers"
  - "Replacing a more expensive tool"
  - "Making AI output actually usable"
```

**Rules:**
- One question only. Do not add more.
- Row disappears on selection OR when user clicks primary CTA — whichever comes first.
- Never shown again after S7 is completed.

---

## Moment 3 — G5 Output screen (post 3rd generation)

**Where:** Bottom of `/generate/output`, inside the output area below the export row. Appears as a slim banner.

**When to show:**
- Only after the user has completed 3 or more total generation sessions (count rows in `drafts` table per user).
- Show one question per session, rotating through the three questions below in order.
- Stop showing after all three have been answered or after 8 total generation sessions (whichever comes first).
- Never show more than once per session.

**Banner UI:** Single line label + chip row + X dismiss button on the right. No modal. No overlay.

**Question rotation:**

```
Piece 3 trigger:
  Label: "How does BrandOS output compare to what you were producing before?"
  question_key: "output_comparison"
  Options:
    - "Significantly better"
    - "Slightly better"
    - "About the same"
    - "Still needs too much editing"
    - "Not what I expected"

Piece 5 trigger:
  Label: "What would you improve first?"
  question_key: "top_improvement"
  Options:
    - "Brand voice accuracy"
    - "The inbox integration"
    - "How much editing the output needs"
    - "Speed of generation"
    - "Managing multiple brands"

Piece 8 trigger:
  Label: "Are you evaluating BrandOS for just yourself or your wider team?"
  question_key: "expansion_intent"
  Options:
    - "Just myself"
    - "My immediate team (2–5 people)"
    - "Wider marketing department"
    - "Enterprise-wide rollout consideration"
```

**Rules:**
- X dismiss records nothing and sets a flag so that question is not shown again.
- On chip select: record to `intent_signals` with `content_piece_count` set to current draft count, then remove banner.
- If `expansion_intent` answer is "Enterprise-wide rollout consideration": also write a row to an `expansion_leads` table `(user_id, triggered_at)` — this is a sales signal.
- Do not block output interaction. The banner sits below the fold — user does not have to see it to use the output.

---

## API endpoint

```
POST /api/intent
Body: { moment, question_key, answer, content_piece_count? }
Auth: required (use existing session)
Response: 200 OK — no body needed
```

No GET endpoint needed. This data is read via direct DB query for analytics — not surfaced in the product UI.

---

## What not to build

- No survey modal or separate screen
- No NPS widget (too early — add at day 30 via email)
- No "How did you hear about us?" in the product (send via email at day 3)
- No progress bar or "question 1 of 2" framing
- No required fields — all intent capture is optional
