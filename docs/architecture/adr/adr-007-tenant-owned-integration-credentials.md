# ADR-007 — Tenant-Owned Integration Credentials Framework

- **Status:** Accepted (Architecture Frozen — Phase A approved 2026-07-20)
- **Date:** 2026-07-20
- **Deciders:** Platform Architecture (SaleOS pre-v1.0)
- **Amends / relates:** [ADR-002 v1.1](./adr-002-integration-manifest-v1-1-amendment), [ADR-004 amendment](./adr-004-oauth-architecture-amendment), ADR-005 (unchanged semantics)
- **Guide:** [Tenant-Owned Integration Credentials](/developer-guide/tenant-owned-integration-credentials)

## Context

SaleOS has not been released publicly. The Scheduling Platform, Integration Framework, OAuth Framework, Meeting Providers, and Calendar Providers are feature-complete under Architecture v1.0 (ADR-001…006).

Today, **runtime authorization** (user OAuth tokens) correctly lives on `integration_connections` (Connections Center). However, **provider application credentials** (`client_id` / `client_secret`) are resolved from platform environment variables (`INTEGRATIONS_*_CLIENT_ID` / `INTEGRATIONS_*_CLIENT_SECRET`) via `config/integrations.php` and OAuth provider classes.

That ownership model is wrong for a multi-tenant product SaaS: every tenant must own its own provider applications (Google, Zoom, Microsoft, and future providers).

## Problem Statement

1. Platform-owned OAuth apps couple all tenants to a single Google / Zoom / Microsoft application.
2. Tenants cannot bring their own apps for compliance, branding, or marketplace verification.
3. Connections Center was documented as “the credential store,” but it mixes **application secrets** (future api_key payloads) with **runtime tokens**.
4. Future providers (Twilio, Mailgun, OpenAI, Meta, etc.) must not require new database migrations for secret field shapes.

## Decision

**Every tenant owns its own provider credentials for tenant integrations.**

- **Provider Credentials** store **only** application credentials (OAuth app client id/secret, API keys, etc.).
- **Connections Center** stores **only** runtime authorization (access/refresh tokens, connection status, health, external account identity).
- **There is never a platform fallback** for tenant integration app credentials.
- Future providers declare secrets via Integration Manifest **`credential_schema`** (Manifest v1.1) — zero schema migrations per provider.

Table name (frozen): **`integration_provider_credentials`**.  
Manager name (frozen): **`IntegrationCredentialManager`**.  
Model name (frozen): **`IntegrationProviderCredential`**.

## Scope

Applies **only** to **tenant integrations**, including:

- Google OAuth (Workspace / Meet / Calendar)
- Microsoft OAuth (Outlook Calendar and future Microsoft capabilities)
- Zoom OAuth
- Future: Meta App, Twilio, Mailgun, Postmark, OpenAI, Anthropic, tenant-side Stripe integrations (if applicable)

## Non-goals

Explicitly **not** included (remain platform-owned):

- Platform billing, Marketplace payments, Central licensing
- Stripe Cashier, Creem
- Platform infrastructure: `APP_KEY`, database credentials, Redis, queue, Reverb, central mail
- Redesign of Authentication, Tenancy, RBAC licensing model, or AppLayout (platform freeze)

Parallel credential stores that remain separate until a future ADR-008 (not this program):

- Multi-provider email tenant/central mail credentials
- `payment_gateways.config`

## Two-store architecture

| Store | Table | Contents | Owner |
|-------|-------|----------|-------|
| Provider Credentials | `integration_provider_credentials` | Application credentials only (`payload` encrypted JSON) | Tenant |
| Connections Center | `integration_connections` | Runtime tokens, scopes, status, health, external account | Tenant (or user owner for user-owned connections) |

```
Admin UI (Provider Credentials)
        │
        ▼
IntegrationCredentialManager ──► integration_provider_credentials
        ▲
        │ resolveAppCredentials(tenant, primarySlug)
        │
OAuthManager ──► integration_connections (tokens)
        │
        ▼
Meeting / Calendar / Sync / Health (consume tokens only)
```

## Provider Credential lifecycle

### Persisted credential status

```
not_configured → configured → validated
                    ↓             ↓
                 invalid ←────────┘
                    ↓
                 revoked
```

Optional transient `rotating` may be used during multi-step rotation; otherwise omit.

**Connected / Healthy / Needs Reauthentication are not credential statuses.** Those belong to Connections Center (and health), composed in the Admin UX.

### Derived Admin UX composite (not stored)

| Composite label | Rule |
|-----------------|------|
| Not Configured | No credential row (or empty) |
| Configured | Status `configured` |
| Validated | Status `validated`; no connected connection (or connection not yet established) |
| Connected | Connection `connected`; health not yet proven |
| Healthy | Connection `connected` + `health_status=healthy` |
| Needs Reauthentication | Connection `needs_reauth` |
| Disconnected | Credentials exist; connection disconnected/absent |
| Revoked | Credential status `revoked` |

## Connection lifecycle

Existing Connections Center machine remains authoritative:

```
disconnected → oauth (in flight) → connected
                                     ↓
                         refresh / needs_reauth / error
                                     ↓
                              reconnect → connected
                                     ↓
                         disconnect / revoke → disconnected
```

**Hard gate:** OAuth start and token refresh **must fail** if provider credentials are missing, `invalid`, or `revoked`. No silent env fallback.

## Security model

| Concern | Rule |
|---------|------|
| Encryption | `payload` cast as Laravel `encrypted:array` (Crypt / `APP_KEY`) |
| Masking | Secrets never returned from APIs; secret fields expose `is_set` only |
| Audit | `PlatformAuditService` on create/update/validate/rotate/revoke — never log secret values |
| Permissions | `provider_credentials.view`, `.manage`, `.validate`, `.rotate` (distinct from `connections.*`) |
| Caching | **Never** cache decrypted secrets; may cache status metadata briefly |
| Logging | Redact `*_secret`, `*_token`, `api_key`, `auth_token`, `payload` |
| API | Tenant API only; no central dump of tenant provider secrets |

## Encryption

Same pattern as `integration_connections` tokens and `payment_gateways.config`. APP_KEY stability and rotation follow the platform production runbook. Soft-deleted rows retain encrypted payload until retention purge (default recommendation: 30 days — confirm in Phase C Notes).

## Rotation

- `POST …/rotate` replaces secret fields without requiring full credential rewrite UX.
- **Secret-only** rotation (same `client_id`): existing connections typically remain valid; re-validate credentials.
- **`client_id` change:** mark related connections `needs_reauth` and require reconnect.
- Rotation does not store plaintext history of previous secrets.

## Validation

| Aspect | Rule |
|--------|------|
| Who | `IntegrationCredentialManager` + optional manifest `credential_validator` |
| When | On save (schema); on explicit Validate; before OAuth start if status ≠ `validated` (hard-block) |
| vs Health | Validation = app credentials usable. Health = runtime token works against provider APIs |

OAuth app live validation is best-effort (e.g. distinguish `invalid_client` on token endpoint). It does **not** prove a user meeting/calendar call will succeed.

## Credential schema

Every **primary** integration declares `credential_schema` in the Integration Manifest (v1.1). Field definitions drive Admin UI and server validation. **Future providers require zero database migrations.**

Examples:

| Integration | Fields |
|-------------|--------|
| Google | `client_id`, `client_secret` |
| Microsoft | `client_id`, `client_secret`, `azure_tenant` |
| Zoom | `client_id`, `client_secret` |
| Twilio (future) | `account_sid`, `auth_token` |
| Mailgun (future) | `api_key`, `domain` |

## Integration Manifest v1.1

See [ADR-002 amendment](./adr-002-integration-manifest-v1-1-amendment). Required additive fields: `credential_type`, `credential_schema`, `credential_validator`, `supports_validation`, `supports_rotation`. ADR-005 `connection_integration` unchanged.

## Provider resolution

1. Resolve integration slug → manifest.
2. Primary slug = `credentialIntegrationSlug()` (`connection_integration` ?? `slug`).
3. Load `integration_provider_credentials` for `(tenant_id, primary_slug)`.
4. OAuth providers receive client id/secret **only** from `IntegrationCredentialManager`.
5. Meeting/Calendar/Sync continue to load **tokens** from Connections Center only.

## OAuth flow

1. Tenant configures and **validates** provider credentials (Provider Credentials UI).
2. Tenant starts OAuth (`POST /connections/{integration}/oauth/start`) — gated on validated credentials.
3. Browser redirects to provider; callback remains **`GET /oauth/callback/{provider}`** on the Central/API host (fixed platform redirect URI).
4. Tenant must register that fixed redirect URI in **their** Google / Azure / Zoom console.
5. Tokens stored on `integration_connections`; app secrets remain on `integration_provider_credentials`.
6. PKCE, state cache, and success redirect allowlist behavior remain as today (ADR-004).

## Satellite provider rules (ADR-005)

- Satellites (`google-meet`, `google-calendar`, `outlook-calendar`) **do not** own provider credential rows.
- Credentials attach only to primaries (`google`, `microsoft`, `zoom`, …).
- Connections Center discovery continues to exclude satellite manifests.
- OAuth via a satellite slug still upserts the **primary** connection row.

## Migration strategy

Pre-v1.0 (no public release):

1. Prefer **break-and-rebuild** over dual-read platform fallback. **Done** for OAuth (Phases C–E + Release Hardening).
2. Staging: enter tenant apps → validate → reconnect; existing tokens become unusable when client apps change.
3. Migrate `integration_connections.credentials` api_key payloads into `integration_provider_credentials` where a schema exists — **Phase F deferred** until the first production API-key integration (no such providers today).
4. Remove `INTEGRATIONS_*_CLIENT_ID/SECRET` as tenant credential source — **Done** (Release Hardening; keys unbound). Kill switches (`INTEGRATIONS_*_ENABLED`) may remain.
5. Email and payment gateway stores are untouched.

## Consequences

### Positive

- Correct multi-tenant ownership and compliance posture.
- Schema-driven secrets — extensible without migrations.
- Clear separation of app credentials vs runtime tokens.
- Aligns Meetings/Calendar/Sync consumers (unchanged token path).

### Negative / costs

- Every tenant must create provider console apps and register the SaleOS redirect URI (support + wizard burden).
- Day-1 Connect UX is worse than platform-owned apps until Admin wizard ships.
- Staging/dev environments using shared env OAuth apps must be cut over.

### Neutral

- Fixed platform callback URL retained (operational simplicity).
- Parallel email/payment credential stores remain until ADR-008.

## Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| Keep platform-owned OAuth apps | Wrong tenancy model for product SaaS |
| Dual-read env fallback “temporarily” | Violates “never a platform fallback”; hides misconfiguration |
| Store app secrets on `integration_connections` | Collapses two concerns; complicates satellites and rotation |
| Per-tenant OAuth callback hosts | Unnecessary complexity; fixed callback is industry BYOA pattern |
| Single persisted status enum mixing credential + connection + health | Weaker than existing Connections Center split; rejected in Phase A |

## Phase C Notes (implementation questions — not architecture changes)

Documented for implementers; do not reopen architecture without a blocker:

1. Confirm soft-delete retention window (recommended 30 days) and purge job ownership.
2. Exact Microsoft `azure_tenant` allowed values and validation rules.
3. Zoom Marketplace app type assumptions (user-managed vs account-level) for docs/wizard copy.
4. Whether `provider_credentials.validate` / `.rotate` ship as four permissions or fold into `manage` for v1.0 RBAC surface (architecture prefers four).
5. Local demo seeder for non-prod only (Q6) — never a runtime fallback.

## Related

- [ADR-004 amendment](./adr-004-oauth-architecture-amendment)
- [ADR-002 amendment](./adr-002-integration-manifest-v1-1-amendment)
- [Implementation Roadmap](/developer-guide/tenant-owned-credentials-implementation-roadmap)
- [Integration Framework](/developer-guide/integration-framework)
