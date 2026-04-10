# LinkedIn Personal Posting Design

_Date: April 10, 2026_

## Summary

BrandOS will add a v1 LinkedIn publishing integration that lets an authenticated BrandOS user connect their personal LinkedIn account from Settings and publish the final LinkedIn draft generated inside BrandOS directly to LinkedIn.

This v1 is intentionally narrow:

- personal LinkedIn posting only
- text-only posts
- one LinkedIn connection per BrandOS user
- no company-page posting
- no shared workspace-level posting identity
- no media upload in v1

BrandOS will own the full integration lifecycle:

- initiate LinkedIn OAuth
- receive and validate the callback
- exchange authorization code for user tokens
- encrypt and store tokens server-side
- expose connection state in Settings
- publish LinkedIn drafts on behalf of the connected user
- record publish results for auditing and support

## Goals

- Let each BrandOS user connect their own LinkedIn account from Settings.
- Let a connected user publish the final LinkedIn draft from the output screen with one explicit confirmation step.
- Keep customer authentication and posting isolated per user.
- Store LinkedIn tokens securely and never expose them to the frontend.
- Fit the implementation into existing BrandOS patterns for auth, settings, and generation output.

## Non-Goals

- company-page posting
- multi-image, video, or document posts
- scheduled publishing
- collaborative approval workflows
- workspace-shared LinkedIn identities
- social analytics sync
- generic third-party MCP dependency for customer auth

## Product Scope

### User Experience

The user journey is:

1. A signed-in BrandOS user opens Settings.
2. They see a new LinkedIn integration section showing current status.
3. They click `Connect LinkedIn`.
4. BrandOS redirects them to LinkedIn OAuth.
5. LinkedIn returns to a BrandOS callback route.
6. BrandOS exchanges the authorization code for tokens and stores them securely against that BrandOS user.
7. Settings refreshes and shows `Connected as <LinkedIn name>`.
8. In the LinkedIn output tab, the user clicks `Publish to LinkedIn`.
9. BrandOS validates that the user still has a valid LinkedIn connection and then publishes the text draft.
10. BrandOS shows success or failure and stores a publish record.

### UX Boundaries

- The LinkedIn connection lives at the BrandOS user level, not the workspace level.
- A user must explicitly connect LinkedIn before publishing.
- The publish action is available only on the LinkedIn output tab.
- The publish action is disabled when there is no connected LinkedIn account or the draft is empty.
- Publishing is always an explicit user action. AI generation alone will not auto-publish.

## Architecture

### Recommended Approach

BrandOS should implement LinkedIn as a native backend integration and optionally expose an internal MCP tool layer later if agent-driven publishing becomes useful.

For v1, customer auth and publishing logic should remain in BrandOS application code, not delegated to an external MCP server.

### Why This Approach

- OAuth credentials and tokens stay under BrandOS control.
- Per-user security boundaries are clearer.
- Settings and publish UI can rely on first-party APIs and data models.
- Support, audit, disconnect, and reconnect flows are easier to reason about.
- A later MCP layer can call the same internal publish service without changing the customer-facing flow.

## Environment Configuration

These values are configured once per BrandOS environment and are shared by the whole deployment:

- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_REDIRECT_URI`
- `LINKEDIN_SCOPES`
- `LINKEDIN_TOKEN_ENCRYPTION_KEY`

These values do not represent a customer. They identify BrandOS as the OAuth application and enable BrandOS to complete OAuth for any user who chooses to connect LinkedIn.

Recommended scope value for v1:

- `openid profile email w_member_social`

## Multi-Tenant Security Model

### Separation Model

BrandOS uses one LinkedIn developer application, but stores one LinkedIn connection per BrandOS user.

This means:

- global app credentials are stored in environment variables
- per-user LinkedIn tokens are stored in the database
- token records are linked to a specific BrandOS `user_id`
- publish requests only use the currently authenticated user’s LinkedIn record

### Security Rules

- LinkedIn access tokens are exchanged and used only on the server.
- LinkedIn access tokens are never returned to the browser.
- Stored tokens are encrypted at rest.
- OAuth callbacks must validate a signed `state` value tied to the requesting BrandOS user and intended return path.
- Publish logs must never include raw access tokens.
- Disconnect must remove stored LinkedIn secrets for that user.
- Expired or invalid tokens should produce a reconnect state rather than a silent failure.

## Data Model

### New Table: `linkedin_connections`

Purpose: store one active personal LinkedIn connection per BrandOS user.

Suggested fields:

- `id UUID PRIMARY KEY`
- `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`
- `linkedin_member_id TEXT`
- `linkedin_display_name TEXT`
- `linkedin_email TEXT`
- `person_urn TEXT`
- `access_token_encrypted TEXT NOT NULL`
- `refresh_token_encrypted TEXT`
- `scope TEXT`
- `token_type TEXT`
- `expires_at TIMESTAMPTZ`
- `last_validated_at TIMESTAMPTZ`
- `connection_status TEXT NOT NULL DEFAULT 'connected'`
- `connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints:

- unique index on `user_id`
- optional index on `workspace_id`

### New Table: `linkedin_post_publications`

Purpose: store publish attempts and successful post references for support, audit, and UI feedback.

Suggested fields:

- `id UUID PRIMARY KEY`
- `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`
- `generation_session_id UUID REFERENCES generation_sessions(id) ON DELETE SET NULL`
- `brand_id UUID REFERENCES brands(id) ON DELETE SET NULL`
- `linkedin_connection_id UUID REFERENCES linkedin_connections(id) ON DELETE SET NULL`
- `content_text TEXT NOT NULL`
- `linkedin_post_urn TEXT`
- `linkedin_share_urn TEXT`
- `status TEXT NOT NULL CHECK (status IN ('pending', 'published', 'failed'))`
- `failure_code TEXT`
- `failure_message TEXT`
- `published_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

## Backend Design

### New Route Group

Add a dedicated LinkedIn route module rather than overloading existing Google auth routes.

Suggested routes:

- `GET /api/linkedin/status`
- `GET /api/linkedin/connect`
- `GET /api/linkedin/callback`
- `POST /api/linkedin/disconnect`
- `POST /api/linkedin/publish`

### OAuth Connect Flow

`GET /api/linkedin/connect`

- requires authenticated BrandOS user
- loads the current user and workspace
- creates a signed `state` payload containing:
  - BrandOS `user_id`
  - optional return path
  - issue timestamp
  - nonce
- redirects to LinkedIn authorization URL using:
  - `client_id`
  - `redirect_uri`
  - requested scopes
  - `response_type=code`
  - signed `state`

### OAuth Callback Flow

`GET /api/linkedin/callback`

- reads `code`, `state`, and `error`
- validates and decodes signed `state`
- ensures the callback belongs to a valid BrandOS user
- exchanges the authorization code with LinkedIn
- fetches basic member identity for UI display
- derives `person_urn` for posting
- encrypts received tokens
- upserts the user’s row in `linkedin_connections`
- redirects the user back to Settings with a success or error flag

### Connection Status

`GET /api/linkedin/status`

Response shape should be optimized for the Settings UI. Suggested fields:

- `connected`
- `status`
- `displayName`
- `email`
- `expiresAt`
- `lastValidatedAt`
- `canPublish`

### Disconnect

`POST /api/linkedin/disconnect`

- requires authenticated BrandOS user
- deletes or scrubs that user’s `linkedin_connections` row
- leaves publish history intact
- returns the new disconnected state for UI refresh

### Publish Endpoint

`POST /api/linkedin/publish`

Suggested request body:

- `generationSessionId`
- `brandId`
- `content`

Behavior:

- requires authenticated BrandOS user
- loads the caller’s `linkedin_connections` row
- fails with `409` if there is no valid connection
- validates non-empty text
- decrypts the access token
- calls the LinkedIn posting API for the user’s `person_urn`
- writes a `linkedin_post_publications` row
- returns publish success metadata

Suggested response fields:

- `ok`
- `status`
- `postUrn`
- `publishedAt`
- `message`

## Service Layer

Add a LinkedIn service module responsible for:

- building LinkedIn auth URLs
- exchanging auth code for tokens
- optional token refresh handling when supported
- fetching member identity
- creating person URNs
- publishing text posts
- normalizing LinkedIn API errors into app-safe error objects
- encrypting and decrypting stored secrets through a small crypto helper

Suggested modules:

- `server/src/services/linkedin/client.js`
- `server/src/services/linkedin/oauth.js`
- `server/src/services/linkedin/publish.js`
- `server/src/services/linkedin/crypto.js`

## Frontend Design

### Settings

Extend [client/src/pages/settings/Settings.jsx](/Users/adi7192/Documents/BrandOS/client/src/pages/settings/Settings.jsx) with a new `LinkedIn` section.

Section states:

- `Not connected`
- `Connected`
- `Reconnect required`
- `Connection error`

Content:

- short description of personal posting support
- connection status pill
- connected LinkedIn name when available
- token expiry metadata when available
- primary CTA:
  - `Connect LinkedIn`
  - `Reconnect LinkedIn`
  - `Disconnect`

Settings copy should clearly explain that the connected account is personal to the signed-in BrandOS user.

### Output Screen

Extend [client/src/pages/generate/Output.jsx](/Users/adi7192/Documents/BrandOS/client/src/pages/generate/Output.jsx).

Behavior:

- show `Publish to LinkedIn` only when `activeTab === 'linkedin'`
- disable publish button if:
  - content is empty
  - no LinkedIn connection exists
  - publish request is in flight
- show inline success or error state after publish
- on success, surface the publish timestamp and returned LinkedIn post reference

### Confirmation Modal

Before publish, show a small confirmation step:

- target account name
- short content preview
- note that publishing happens immediately on LinkedIn

This keeps the user in control and reduces accidental live posting.

## Publish Flow

1. User creates LinkedIn content in BrandOS.
2. User reviews the final LinkedIn draft.
3. User clicks `Publish to LinkedIn`.
4. BrandOS checks connection state.
5. BrandOS opens confirmation UI.
6. User confirms.
7. Frontend calls `POST /api/linkedin/publish`.
8. Backend loads and decrypts the caller’s token.
9. Backend submits the text post to LinkedIn.
10. Backend stores the outcome in `linkedin_post_publications`.
11. Frontend shows success or actionable failure messaging.

## Error Handling

User-visible failure categories:

- LinkedIn not connected
- LinkedIn session expired, reconnect required
- LinkedIn publish rejected by API
- BrandOS network or server failure

Expected UX behavior:

- expired or invalid tokens produce a reconnect CTA
- failed publish attempts show a short message and preserve the draft
- generic API failures should not clear the editor state

## Token Lifetime Strategy

BrandOS should store `expires_at` and treat token validity as advisory rather than assumed.

If LinkedIn grants refresh tokens for the configured app, BrandOS may refresh server-side. If refresh is not available, BrandOS should require the user to reconnect when publish fails due to authorization expiry.

The v1 user experience must work cleanly even when refresh tokens are unavailable.

## MCP Position

BrandOS should not depend on an external LinkedIn MCP server for customer authentication or production publishing.

If BrandOS later wants agent-driven publishing, it can expose internal MCP tools backed by the same first-party LinkedIn service:

- `linkedin.get_status`
- `linkedin.connect_status`
- `linkedin.publish_text_post`

Those tools should remain an internal execution layer and should not change the end-user authentication model.

## Testing Strategy

### Backend

- unit tests for OAuth state signing and validation
- unit tests for token encryption and decryption
- unit tests for LinkedIn API request builders
- unit tests for error normalization
- route tests for:
  - status
  - disconnect
  - publish with missing connection
  - publish success with mocked LinkedIn API

### Frontend

- settings view-model tests for LinkedIn status states
- Settings UI tests for connected and disconnected states
- Output screen tests for publish button visibility and disabled states
- publish success and failure interaction tests

### Manual Verification

- connect a personal LinkedIn account in local/staging
- publish a text-only post
- verify success UI and stored publish record
- disconnect and verify the publish button is blocked afterward

## Rollout Plan

### Phase 1

- user-level LinkedIn connection from Settings
- text-only personal posting from Output screen
- publish audit log

### Later Phases

- image posting
- scheduled posting
- company-page posting
- workspace admin visibility into connected channels

## Open Decisions Resolved In This Spec

- connection scope: per user
- posting scope: personal only
- content scope: text only
- integration style: native BrandOS backend integration
- MCP role: optional internal wrapper later, not foundational in v1

## Implementation Notes For BrandOS

This feature aligns with existing BrandOS patterns:

- authenticated settings page already exists in [client/src/pages/settings/Settings.jsx](/Users/adi7192/Documents/BrandOS/client/src/pages/settings/Settings.jsx)
- protected API route patterns already exist in [server/src/routes/settings.js](/Users/adi7192/Documents/BrandOS/server/src/routes/settings.js)
- OAuth redirect handling patterns already exist in [server/src/routes/auth.js](/Users/adi7192/Documents/BrandOS/server/src/routes/auth.js)
- the final LinkedIn draft surface already exists in [client/src/pages/generate/Output.jsx](/Users/adi7192/Documents/BrandOS/client/src/pages/generate/Output.jsx)

The implementation should follow those existing boundaries instead of introducing a generic integrations framework in v1.
