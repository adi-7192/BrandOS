# LinkedIn Settings UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the LinkedIn integration experience in Settings so users can immediately understand whether LinkedIn is connected, which account is connected, and what actions are available next.

**Architecture:** Keep the existing backend integration and Settings route shape, but redesign the frontend presentation around explicit connection states. The refresh centers on a richer LinkedIn view-model, a purpose-built integration card inside Settings, and clearer state-specific feedback for connect, reconnect, and disconnect.

**Tech Stack:** React, existing BrandOS Settings page, node:test client helper tests, Tailwind utility classes, existing Button and StatusPill patterns.

---

## File Map

- Modify: `client/src/lib/linkedin-view.js`
- Modify: `client/src/lib/linkedin-view.test.js`
- Modify: `client/src/lib/settings-view.js`
- Modify: `client/src/lib/settings-view.test.js`
- Modify: `client/src/pages/settings/Settings.jsx`

### Task 1: Strengthen the LinkedIn view-model for UI state clarity

**Files:**
- Modify: `client/src/lib/linkedin-view.js`
- Test: `client/src/lib/linkedin-view.test.js`

- [ ] **Step 1: Write the failing tests for the new connected and disconnected presentation model**

```js
test('buildLinkedInViewModel returns stable connected-state actions and account metadata', () => {
  assert.deepEqual(
    buildLinkedInViewModel({
      connected: true,
      status: 'connected',
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      lastValidatedAt: '2026-04-10T08:45:00.000Z',
    }),
    {
      title: 'LinkedIn connected',
      tone: 'success',
      badgeLabel: 'Connected',
      primaryActionLabel: 'Connected',
      secondaryActionLabel: 'Disconnect',
      reconnectActionLabel: 'Reconnect',
      summary: 'BrandOS can publish approved posts to your personal LinkedIn account.',
      connectedAs: 'Ada Lovelace',
      accountEmail: 'ada@example.com',
      readinessLabel: 'Ready to publish',
      lastCheckedLabel: 'Last checked',
      lastCheckedValue: '2026-04-10T08:45:00.000Z',
    }
  );
});

test('buildLinkedInViewModel returns onboarding-style guidance when disconnected', () => {
  assert.deepEqual(
    buildLinkedInViewModel({
      connected: false,
      status: 'not_connected',
    }),
    {
      title: 'Connect LinkedIn',
      tone: 'neutral',
      badgeLabel: 'Not connected',
      primaryActionLabel: 'Connect LinkedIn',
      secondaryActionLabel: '',
      reconnectActionLabel: '',
      summary: 'Connect your personal LinkedIn account to publish approved drafts directly from BrandOS.',
      connectedAs: '',
      accountEmail: '',
      readinessLabel: 'Publishing unavailable',
      lastCheckedLabel: '',
      lastCheckedValue: '',
    }
  );
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test client/src/lib/linkedin-view.test.js`
Expected: FAIL because the helper does not yet return the richer state shape.

- [ ] **Step 3: Implement the richer LinkedIn view-model**

```js
export function buildLinkedInViewModel(linkedin = {}) {
  if (linkedin.connected && linkedin.status === 'connected') {
    return {
      title: 'LinkedIn connected',
      tone: 'success',
      badgeLabel: 'Connected',
      primaryActionLabel: 'Connected',
      secondaryActionLabel: 'Disconnect',
      reconnectActionLabel: 'Reconnect',
      summary: 'BrandOS can publish approved posts to your personal LinkedIn account.',
      connectedAs: linkedin.displayName || '',
      accountEmail: linkedin.email || '',
      readinessLabel: 'Ready to publish',
      lastCheckedLabel: linkedin.lastValidatedAt ? 'Last checked' : '',
      lastCheckedValue: linkedin.lastValidatedAt || '',
    };
  }

  if (linkedin.status === 'reconnect_required') {
    return {
      title: 'Reconnect LinkedIn',
      tone: 'warning',
      badgeLabel: 'Reconnect required',
      primaryActionLabel: 'Reconnect LinkedIn',
      secondaryActionLabel: 'Disconnect',
      reconnectActionLabel: '',
      summary: 'Your LinkedIn connection needs attention before BrandOS can publish again.',
      connectedAs: linkedin.displayName || '',
      accountEmail: linkedin.email || '',
      readinessLabel: 'Publishing blocked',
      lastCheckedLabel: '',
      lastCheckedValue: '',
    };
  }

  return {
    title: 'Connect LinkedIn',
    tone: 'neutral',
    badgeLabel: 'Not connected',
    primaryActionLabel: 'Connect LinkedIn',
    secondaryActionLabel: '',
    reconnectActionLabel: '',
    summary: 'Connect your personal LinkedIn account to publish approved drafts directly from BrandOS.',
    connectedAs: '',
    accountEmail: '',
    readinessLabel: 'Publishing unavailable',
    lastCheckedLabel: '',
    lastCheckedValue: '',
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test client/src/lib/linkedin-view.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/linkedin-view.js client/src/lib/linkedin-view.test.js
git commit -m "Refine LinkedIn settings view model states"
```

### Task 2: Tighten the Settings section status summary

**Files:**
- Modify: `client/src/lib/settings-view.js`
- Modify: `client/src/lib/settings-view.test.js`

- [ ] **Step 1: Write the failing status-summary tests**

```js
test('buildSettingsViewModel summarizes connected linkedin state with readiness copy', () => {
  const model = buildSettingsViewModel({
    linkedin: {
      connected: true,
      status: 'connected',
      displayName: 'Ada Lovelace',
    },
  });

  assert.deepEqual(model.linkedinStatus, {
    label: 'Connected',
    tone: 'success',
    meta: 'Ready to publish',
  });
});

test('buildSettingsViewModel summarizes reconnect state clearly', () => {
  const model = buildSettingsViewModel({
    linkedin: {
      connected: false,
      status: 'reconnect_required',
      displayName: 'Ada Lovelace',
    },
  });

  assert.deepEqual(model.linkedinStatus, {
    label: 'Reconnect required',
    tone: 'warning',
    meta: 'Publishing blocked',
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test client/src/lib/settings-view.test.js`
Expected: FAIL because the current LinkedIn summary meta is too generic.

- [ ] **Step 3: Update the status helper to use user-facing readiness language**

```js
export function buildLinkedInStatus(linkedin = {}) {
  if (linkedin.connected && linkedin.status === 'connected') {
    return buildStatus('Connected', 'success', 'Ready to publish');
  }

  if (linkedin.status === 'reconnect_required') {
    return buildStatus('Reconnect required', 'warning', 'Publishing blocked');
  }

  if (linkedin.status === 'connection_error') {
    return buildStatus('Needs attention', 'warning', 'Check connection');
  }

  return buildStatus('Not connected', 'neutral', 'Personal publishing unavailable');
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test client/src/lib/settings-view.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/settings-view.js client/src/lib/settings-view.test.js
git commit -m "Clarify LinkedIn settings status summaries"
```

### Task 3: Replace the current LinkedIn section with a state-first integration card

**Files:**
- Modify: `client/src/pages/settings/Settings.jsx`
- Test: `client/src/lib/linkedin-view.test.js`

- [ ] **Step 1: Add a failing test for the helper copy that drives the integration card**

```js
test('buildLinkedInViewModel exposes onboarding bullets for disconnected state', () => {
  const model = buildLinkedInViewModel({ connected: false, status: 'not_connected' });

  assert.deepEqual(model.bullets, [
    'Connect once from Settings',
    'Approve BrandOS in LinkedIn',
    'Publish approved LinkedIn drafts directly from BrandOS',
  ]);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test client/src/lib/linkedin-view.test.js`
Expected: FAIL because `bullets` is not returned yet.

- [ ] **Step 3: Extend the helper and replace the LinkedIn section layout**

```js
return {
  ...existing,
  bullets: [
    'Connect once from Settings',
    'Approve BrandOS in LinkedIn',
    'Publish approved LinkedIn drafts directly from BrandOS',
  ],
};
```

```jsx
<SettingsSection
  title="LinkedIn"
  description="Publish approved LinkedIn drafts from BrandOS using your personal account."
  aside={<StatusPill status={viewModel.linkedinStatus} />}
>
  <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_320px]">
    <div className="rounded-[24px] border border-[#dce7f3] bg-[linear-gradient(135deg,#f7fbff_0%,#ffffff_100%)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0a66c2]">LinkedIn integration</p>
          <h3 className="mt-2 text-2xl font-semibold text-[#111827]">{linkedinView.title}</h3>
          <p className="mt-3 text-sm leading-6 text-[#667085]">{linkedinView.summary}</p>
        </div>
        <span className="inline-flex rounded-full bg-[#e7f8ef] px-3 py-1.5 text-xs font-semibold text-[#178A5B]">
          {linkedinView.badgeLabel}
        </span>
      </div>

      {linkedinView.connectedAs ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <MetricCard label="Connected account" value={linkedinView.connectedAs} />
          <MetricCard label="Account email" value={linkedinView.accountEmail || 'Unavailable'} />
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-[#e7ecf3] bg-white px-4 py-4">
          <p className="text-sm font-medium text-[#111827]">What happens after you connect</p>
          <ul className="mt-3 space-y-2 text-sm text-[#667085]">
            {linkedinView.bullets.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      <SectionActions>
        <Button
          variant={linkedinView.tone === 'neutral' ? 'primary' : 'secondary'}
          disabled={linkedinAction.loading || linkedinView.primaryActionLabel === 'Connected'}
          onClick={handleLinkedInConnect}
        >
          {linkedinAction.loading ? 'Opening LinkedIn…' : linkedinView.primaryActionLabel}
        </Button>
        {linkedinView.reconnectActionLabel ? (
          <Button variant="secondary" disabled={linkedinAction.loading} onClick={handleLinkedInConnect}>
            {linkedinView.reconnectActionLabel}
          </Button>
        ) : null}
        {linkedinView.secondaryActionLabel ? (
          <Button variant="ghost" disabled={linkedinAction.loading} onClick={handleLinkedInDisconnect}>
            {linkedinView.secondaryActionLabel}
          </Button>
        ) : null}
      </SectionActions>
    </div>

    <div className="rounded-[24px] border border-[#e7ecf3] bg-[#fbfcfe] p-5">
      <p className="text-sm font-medium text-[#111827]">Connection details</p>
      <div className="mt-4 space-y-3">
        <StatusLine label="Status" value={linkedinView.badgeLabel} />
        <StatusLine label="Publishing" value={linkedinView.readinessLabel} />
        <StatusLine label="Connected account" value={linkedinView.connectedAs || 'No account connected'} />
        {linkedinView.lastCheckedLabel ? (
          <StatusLine label={linkedinView.lastCheckedLabel} value={linkedinView.lastCheckedValue} />
        ) : null}
      </div>
    </div>
  </div>
</SettingsSection>
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test client/src/lib/linkedin-view.test.js client/src/lib/settings-view.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/settings/Settings.jsx client/src/lib/linkedin-view.js client/src/lib/linkedin-view.test.js
git commit -m "Redesign LinkedIn settings integration card"
```

### Task 4: Upgrade success and error feedback for LinkedIn actions

**Files:**
- Modify: `client/src/pages/settings/Settings.jsx`
- Test: `client/src/lib/linkedin-view.test.js`

- [ ] **Step 1: Add a failing helper test for feedback tone mapping**

```js
test('buildLinkedInViewModel exposes success and warning banner tones', () => {
  assert.equal(buildLinkedInFeedbackState('connected').tone, 'success');
  assert.equal(buildLinkedInFeedbackState('error').tone, 'warning');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test client/src/lib/linkedin-view.test.js`
Expected: FAIL because no feedback-state helper exists yet.

- [ ] **Step 3: Add the helper and render semantic feedback banners**

```js
export function buildLinkedInFeedbackState(status) {
  if (status === 'connected') {
    return {
      tone: 'success',
      message: 'LinkedIn connected. BrandOS is ready to publish approved LinkedIn posts from your personal account.',
    };
  }

  if (status === 'error') {
    return {
      tone: 'warning',
      message: 'LinkedIn could not be connected. Try again or reconnect from Settings.',
    };
  }

  return { tone: 'neutral', message: '' };
}
```

```jsx
{linkedinBanner.message ? (
  <div className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
    linkedinBanner.tone === 'success'
      ? 'border border-[#cfe9db] bg-[#eefaf3] text-[#146c43]'
      : 'border border-[#f2ddad] bg-[#fff8e6] text-[#9a6b12]'
  }`}>
    {linkedinBanner.message}
  </div>
) : null}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test client/src/lib/linkedin-view.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/settings/Settings.jsx client/src/lib/linkedin-view.js client/src/lib/linkedin-view.test.js
git commit -m "Improve LinkedIn settings feedback states"
```

### Task 5: Final verification

**Files:**
- Verify all modified files above

- [ ] **Step 1: Run the LinkedIn helper tests**

Run: `node --test client/src/lib/linkedin-view.test.js client/src/lib/settings-view.test.js`
Expected: PASS

- [ ] **Step 2: Run a client build**

Run: `npm run build --workspace=client`
Expected: PASS

- [ ] **Step 3: Review the final diff scope**

Run: `git diff --stat`
Expected: only the LinkedIn settings UI refresh files changed

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/linkedin-view.js client/src/lib/linkedin-view.test.js client/src/lib/settings-view.js client/src/lib/settings-view.test.js client/src/pages/settings/Settings.jsx docs/superpowers/plans/2026-04-10-linkedin-settings-ui-refresh.md
git commit -m "Refresh LinkedIn settings UI clarity"
```
