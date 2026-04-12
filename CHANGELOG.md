# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### 🔒 Security Hardening
- **JWT Protection**: Implemented strict validation for `JWT_SECRET` (min 32 chars) and added an in-memory token revocation/denylist mechanism.
- **LinkedIn Encryption**: Upgraded LinkedIn integration to encrypt PII (email addresses) at rest using AES-256-GCM.
- **Middleware Security**: Integrated `helmet` for security headers (CSP, HSTS) and implemented a robust CORS allowlist via `ALLOWED_ORIGINS`.
- **Rate Limiting**: Added `express-rate-limit` protection to critical endpoints: Authentication, AI Generation, and Inbound Webhooks.
- **Least Privilege Access**: Introduced structured database roles (`brandos_app`) to minimize permissions for application-layer connections.

### 🗄️ Database
- **Migration 002**: Fixed foreign key cascade issues in the `drafts` table and prepared schema for LinkedIn PII encryption.
- **Migration 003**: Added uniqueness constraints and partial indices for inbound email deduplication.
- **Schema Refinement**: Updated `schema.sql` to align with the new security and deduplication requirements.

### 🚀 Onboarding & AI Extraction
- **Audience & Industry Expansion**: Added comprehensive field options for buyer seniority, industry targeting, age ranges, and tone shifts.
- **Improved Extraction**: Enhanced AI extraction logic to handle complex audience descriptions and normalize brand kit fields.
- **Normalization Utilities**: Centralized field formatting and normalization logic in shared libraries for consistent client/server behavior.

### 📥 Inbound & Generation Services
- **Inbox Deduplication**: Implemented provider-level deduplication for inbound emails to prevent duplicate card creation.
- **Robust AI Prompts**: Refined system prompts for AI generation to ensure higher quality output and better alignment with brand kits.
- **Public URL Resolution**: Improved logic for static asset and public URL derivation across environments.

### 🎨 Client & UI
- **Destructive Actions**: Enhanced `DangerConfirmModal` with explicit warnings and improved visual feedback for sensitive operations.
- **Auth Flow Polish**: Updated SignIn/SignUp logic to handle backend validation constraints and security errors gracefully.
- **Dashboard & Inbox**: Refined data fetching logic and error states for a more resilient user experience.

### 🧪 Testing
- Added unit tests for onboarding extraction logic and AI generation services to ensure consistency in field mapping and prompt generation.
