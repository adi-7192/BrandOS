# LinkedIn Personal Posting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure per-user LinkedIn personal-posting integration so BrandOS users can connect LinkedIn from Settings and publish text-only LinkedIn drafts from the output screen.

**Architecture:** BrandOS keeps LinkedIn as a first-party backend integration. OAuth, token encryption, token storage, connection state, and publish requests all stay server-side; the frontend only consumes connection status and publish results. The implementation extends existing auth/settings/output patterns instead of introducing a generic integrations platform.

**Tech Stack:** Express, PostgreSQL schema SQL, node:test, React, axios, existing BrandOS auth/settings UI.

---

## File Map

- Create: `server/src/services/linkedin/crypto.js`
- Create: `server/src/services/linkedin/oauth.js`
- Create: `server/src/services/linkedin/publish.js`
- Create: `server/src/services/linkedin/crypto.test.js`
- Create: `server/src/services/linkedin/oauth.test.js`
- Create: `server/src/services/linkedin/publish.test.js`
- Create: `server/src/routes/linkedin.js`
- Create: `client/src/lib/linkedin-view.js`
- Create: `client/src/lib/linkedin-view.test.js`
- Modify: `server/src/db/schema.sql`
- Modify: `server/src/index.js`
- Modify: `server/src/lib/public-url.js`
- Modify: `server/src/lib/public-url.test.js`
- Modify: `server/src/routes/settings.js`
- Modify: `client/src/pages/settings/Settings.jsx`
- Modify: `client/src/lib/settings-view.js`
- Modify: `client/src/lib/settings-view.test.js`
- Modify: `client/src/pages/generate/Output.jsx`

### Task 1: Add Data Model And URL Helpers

**Files:**
- Modify: `server/src/db/schema.sql`
- Modify: `server/src/lib/public-url.js`
- Test: `server/src/lib/public-url.test.js`

- [ ] **Step 1: Write the failing redirect helper test**

```js
test('getLinkedInRedirectUri prefers env override and falls back to request origin', () => {
  assert.equal(
    getLinkedInRedirectUri({ headers: { host: 'brandos.test' } }, { LINKEDIN_REDIRECT_URI: 'https://api.example.com/api/linkedin/callback' }),
    'https://api.example.com/api/linkedin/callback'
  );

  assert.equal(
    getLinkedInRedirectUri({ headers: { host: 'brandos.test' } }, {}),
    'http://brandos.test/api/linkedin/callback'
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test server/src/lib/public-url.test.js`
Expected: FAIL because `getLinkedInRedirectUri` is not defined.

- [ ] **Step 3: Add the helper and LinkedIn tables**

```js
export function getLinkedInRedirectUri(req, env = process.env) {
  return env.LINKEDIN_REDIRECT_URI || `${getRequestOrigin(req)}/api/linkedin/callback`;
}
```

```sql
CREATE TABLE IF NOT EXISTS linkedin_connections (...);
CREATE UNIQUE INDEX IF NOT EXISTS linkedin_connections_user_id_idx ON linkedin_connections(user_id);

CREATE TABLE IF NOT EXISTS linkedin_post_publications (...);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test server/src/lib/public-url.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/src/db/schema.sql server/src/lib/public-url.js server/src/lib/public-url.test.js
git commit -m "Add LinkedIn schema and redirect helper"
```

### Task 2: Add LinkedIn Crypto, OAuth, And Publish Services

**Files:**
- Create: `server/src/services/linkedin/crypto.js`
- Create: `server/src/services/linkedin/oauth.js`
- Create: `server/src/services/linkedin/publish.js`
- Test: `server/src/services/linkedin/crypto.test.js`
- Test: `server/src/services/linkedin/oauth.test.js`
- Test: `server/src/services/linkedin/publish.test.js`

- [ ] **Step 1: Write failing service tests**

```js
test('encryptSecret and decryptSecret round-trip values', () => {
  const encrypted = encryptSecret('token-value', { key: '12345678901234567890123456789012' });
  assert.notEqual(encrypted, 'token-value');
  assert.equal(decryptSecret(encrypted, { key: '12345678901234567890123456789012' }), 'token-value');
});

test('buildLinkedInAuthUrl includes signed state and requested scopes', () => {
  const url = buildLinkedInAuthUrl({
    clientId: 'client-id',
    redirectUri: 'https://api.brandos.test/api/linkedin/callback',
    scope: 'openid profile email w_member_social',
    state: 'signed-state',
  });

  assert.match(url, /client-id/);
  assert.match(url, /w_member_social/);
  assert.match(url, /signed-state/);
});

test('buildLinkedInTextPostRequest creates a text-only ugc post payload', () => {
  assert.deepEqual(buildLinkedInTextPostRequest({
    authorUrn: 'urn:li:person:abc123',
    content: 'Hello LinkedIn',
  }), {
    author: 'urn:li:person:abc123',
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: 'Hello LinkedIn' },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test server/src/services/linkedin/*.test.js`
Expected: FAIL because the service modules do not exist yet.

- [ ] **Step 3: Implement minimal services**

```js
export function encryptSecret(value, options = {}) { /* aes-256-gcm */ }
export function decryptSecret(payload, options = {}) { /* aes-256-gcm */ }
export function buildLinkedInAuthUrl({ clientId, redirectUri, scope, state }) { /* URLSearchParams */ }
export function signLinkedInState(payload, options = {}) { /* HMAC */ }
export function readLinkedInState(token, options = {}) { /* verify and parse */ }
export function buildPersonUrn(memberId) { return `urn:li:person:${memberId}`; }
export function buildLinkedInTextPostRequest({ authorUrn, content }) { /* UGC payload */ }
export function normalizeLinkedInPublishError(error) { /* safe app error */ }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test server/src/services/linkedin/*.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/src/services/linkedin/crypto.js server/src/services/linkedin/oauth.js server/src/services/linkedin/publish.js server/src/services/linkedin/crypto.test.js server/src/services/linkedin/oauth.test.js server/src/services/linkedin/publish.test.js
git commit -m "Add LinkedIn service helpers"
```

### Task 3: Add LinkedIn API Routes And Settings Response

**Files:**
- Create: `server/src/routes/linkedin.js`
- Modify: `server/src/index.js`
- Modify: `server/src/routes/settings.js`
- Test: `server/src/services/linkedin/oauth.test.js`
- Test: `server/src/services/linkedin/publish.test.js`

- [ ] **Step 1: Extend tests for route-facing helpers**

```js
test('mapLinkedInConnectionStatus marks expired tokens as reconnect_required', () => {
  assert.deepEqual(mapLinkedInConnectionStatus({
    linkedin_display_name: 'Ada Lovelace',
    expires_at: '2020-01-01T00:00:00.000Z',
    connection_status: 'connected',
  }, { now: '2026-04-10T00:00:00.000Z' }), {
    connected: false,
    status: 'reconnect_required',
    displayName: 'Ada Lovelace',
    canPublish: false,
    expiresAt: '2020-01-01T00:00:00.000Z',
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test server/src/services/linkedin/oauth.test.js server/src/services/linkedin/publish.test.js`
Expected: FAIL because the mapping helpers do not exist yet.

- [ ] **Step 3: Implement route module and settings enrichment**

```js
router.get('/status', authenticate, async (req, res, next) => { ... });
router.get('/connect', authenticate, async (req, res, next) => { ... });
router.get('/callback', async (req, res, next) => { ... });
router.post('/disconnect', authenticate, async (req, res, next) => { ... });
router.post('/publish', authenticate, async (req, res, next) => { ... });
```

```js
linkedin: buildLinkedInSettings(connection)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test server/src/services/linkedin/oauth.test.js server/src/services/linkedin/publish.test.js server/src/lib/public-url.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/src/routes/linkedin.js server/src/index.js server/src/routes/settings.js server/src/services/linkedin/oauth.js server/src/services/linkedin/publish.js
git commit -m "Add LinkedIn routes and settings data"
```

### Task 4: Add Settings View Model And Settings UI

**Files:**
- Create: `client/src/lib/linkedin-view.js`
- Create: `client/src/lib/linkedin-view.test.js`
- Modify: `client/src/lib/settings-view.js`
- Modify: `client/src/lib/settings-view.test.js`
- Modify: `client/src/pages/settings/Settings.jsx`

- [ ] **Step 1: Write failing client tests**

```js
test('buildLinkedInViewModel derives CTA and tone from connection status', () => {
  assert.deepEqual(buildLinkedInViewModel({
    connected: false,
    status: 'reconnect_required',
    displayName: 'Ada Lovelace',
  }), {
    label: 'Reconnect required',
    tone: 'warning',
    ctaLabel: 'Reconnect LinkedIn',
    helper: 'Reconnect your personal LinkedIn account to keep publishing from BrandOS.',
    connectedAs: 'Ada Lovelace',
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test client/src/lib/linkedin-view.test.js client/src/lib/settings-view.test.js`
Expected: FAIL because the LinkedIn view helper does not exist yet.

- [ ] **Step 3: Implement minimal client view helpers and Settings section**

```js
export function buildLinkedInViewModel(linkedin) { ... }
```

```jsx
<SettingsSection title="LinkedIn" ...>
  <StatusPill status={viewModel.linkedinStatus} />
  ...
  <Button onClick={handleLinkedInConnect}>Connect LinkedIn</Button>
</SettingsSection>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test client/src/lib/linkedin-view.test.js client/src/lib/settings-view.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/linkedin-view.js client/src/lib/linkedin-view.test.js client/src/lib/settings-view.js client/src/lib/settings-view.test.js client/src/pages/settings/Settings.jsx
git commit -m "Add LinkedIn settings UI"
```

### Task 5: Add LinkedIn Publish UI In Output Screen

**Files:**
- Modify: `client/src/pages/generate/Output.jsx`
- Modify: `client/src/lib/linkedin-view.js`
- Test: `client/src/lib/linkedin-view.test.js`

- [ ] **Step 1: Write failing publish-state tests**

```js
test('buildLinkedInPublishState disables publish without a connection or content', () => {
  assert.deepEqual(buildLinkedInPublishState({
    activeTab: 'linkedin',
    content: '',
    linkedin: { connected: false, status: 'not_connected' },
    publishing: false,
  }), {
    visible: true,
    disabled: true,
    label: 'Publish to LinkedIn',
    helper: 'Connect LinkedIn in Settings before publishing.',
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test client/src/lib/linkedin-view.test.js`
Expected: FAIL because publish-state helper does not exist yet.

- [ ] **Step 3: Implement publish state helper and output-screen UI**

```js
export function buildLinkedInPublishState({ activeTab, content, linkedin, publishing }) { ... }
```

```jsx
<Button variant="secondary" disabled={publishState.disabled} onClick={() => setPublishModalOpen(true)}>
  {publishState.label}
</Button>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test client/src/lib/linkedin-view.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/linkedin-view.js client/src/lib/linkedin-view.test.js client/src/pages/generate/Output.jsx
git commit -m "Add LinkedIn publish flow to output screen"
```

### Task 6: Final Verification

**Files:**
- Verify all modified files above

- [ ] **Step 1: Run targeted server tests**

Run: `node --test server/src/lib/public-url.test.js server/src/services/linkedin/*.test.js`
Expected: PASS

- [ ] **Step 2: Run targeted client tests**

Run: `node --test client/src/lib/settings-view.test.js client/src/lib/linkedin-view.test.js`
Expected: PASS

- [ ] **Step 3: Run one broader regression sweep**

Run: `node --test client/src/lib/auth-session.test.js client/src/lib/settings-view.test.js server/src/lib/public-url.test.js server/src/services/linkedin/*.test.js`
Expected: PASS

- [ ] **Step 4: Review git diff**

Run: `git diff --stat`
Expected: only LinkedIn-related files plus the implementation plan

- [ ] **Step 5: Commit**

```bash
git add server/src/db/schema.sql server/src/lib/public-url.js server/src/lib/public-url.test.js server/src/services/linkedin/ server/src/routes/linkedin.js server/src/routes/settings.js server/src/index.js client/src/lib/linkedin-view.js client/src/lib/linkedin-view.test.js client/src/lib/settings-view.js client/src/lib/settings-view.test.js client/src/pages/settings/Settings.jsx client/src/pages/generate/Output.jsx docs/superpowers/plans/2026-04-10-linkedin-personal-posting.md
git commit -m "Implement LinkedIn personal posting"
```
