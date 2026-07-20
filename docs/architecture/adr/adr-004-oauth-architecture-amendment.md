# ADR-004 Amendment — OAuth Architecture (Tenant-Owned Credentials)

- **Status:** Accepted amendment (Architecture Frozen — Phase A approved 2026-07-20)
- **Date:** 2026-07-20
- **Original ADR-004:** Centralized OAuth manager + Connections Center for runtime credentials (cited in code / Phase 0 docs; formal original text reconstructed here for amendment clarity)
- **Supersedes (partial):** Platform env (`INTEGRATIONS_*_CLIENT_ID` / `*_CLIENT_SECRET`) as the source of **tenant** OAuth application credentials
- **Companion:** [ADR-007](./adr-007-tenant-owned-integration-credentials)

## Original ADR-004 (summary)

ADR-004 established:

1. A single **`OAuthManager`** for authorize / callback / refresh / reconnect / revoke.
2. **PKCE** + signed/cached OAuth `state`.
3. A **fixed platform callback** on the Central/API host: `GET /oauth/callback/{provider}`.
4. **Connections Center** (`integration_connections`) as the store for **runtime** OAuth tokens (encrypted).
5. OAuth provider adapters registered in `OAuthRegistry` (Google, Microsoft, Zoom).

Those decisions remain in force except where this amendment changes **credential resolution**.

## Problem addressed by this amendment

OAuth provider classes currently resolve `client_id` / `client_secret` from `config('integrations.{provider}.client_id|client_secret')`, which is fed by platform environment variables. That made SaleOS the OAuth application owner for all tenants.

## Decision (amendment)

### 1. OAuthManager does not resolve tenant app credentials from `config()`

For **tenant integration** OAuth flows, `OAuthManager` and OAuth provider adapters **must not** read:

- `config('integrations.google.client_id|client_secret')`
- `config('integrations.microsoft.client_id|client_secret')`
- `config('integrations.zoom.client_id|client_secret')`
- or equivalent env-backed config keys

as the source of client credentials used in authorize, code exchange, refresh, or revoke.

### 2. IntegrationCredentialManager is the only credential source

`IntegrationCredentialManager` (ADR-007) is the **sole** source of tenant OAuth application credentials.

Resolution path:

1. Manifest → primary integration slug (ADR-005 `connection_integration` when satellite).
2. `IntegrationCredentialManager::resolve(tenant, primarySlug)` → decrypted payload fields required by the provider.
3. Pass client id/secret into the OAuth provider call (authorize URL, token exchange, refresh, revoke).

Missing / `invalid` / `revoked` credentials → fail the OAuth operation with a stable error code (e.g. `credentials_missing`, `credentials_invalid`). **No silent fallback.**

### 3. Fixed callback URL remains unchanged

```
{APP_URL}/oauth/callback/{provider}
```

- Still Central/API host (not tenant subdomain).
- Tenants register this **same** redirect URI in their own Google Cloud / Azure AD / Zoom Marketplace applications.
- Success redirect allowlist and default success path behavior unchanged.

### 4. PKCE unchanged

- `code_verifier` / `code_challenge` (S256) remain required for OAuth start.
- State TTL and cache key pattern remain as implemented.

### 5. Connections Center responsibilities unchanged

Connections Center continues to own:

- `access_token` / `refresh_token` / `token_expires_at` / `scopes`
- Connection `status` and `health_status`
- External account identity fields
- Connect / reconnect / disconnect / test (token health)

Connections Center does **not** become the store for OAuth **application** client secrets (ADR-007).

### 6. No platform fallback

There is **never** a runtime fallback from tenant Provider Credentials to platform env OAuth apps for tenant integrations.

Pre-v1.0 cutover may wipe or force-reconnect existing staging connections. Dual-read “temporary” fallbacks are rejected.

Kill switches such as `INTEGRATIONS_GOOGLE_ENABLED` may remain as feature flags; they are **not** credential sources.

## What does not change

| Area | Status |
|------|--------|
| OAuthRegistry + provider interface | Unchanged role |
| Satellite → primary connection upsert (ADR-005) | Unchanged |
| Token encryption on `integration_connections` | Unchanged |
| ConnectionLock around refresh | Unchanged |
| Meeting / Calendar / Sync consuming connection tokens | Unchanged |
| Permissions `connections.*` for connection APIs | Unchanged (Provider Credentials add separate permissions) |

## Consequences

- OAuth provider classes must be refactored in Implementation Phase D to accept or resolve credentials via `IntegrationCredentialManager`.
- Deployment docs must stop presenting `INTEGRATIONS_*_CLIENT_ID/SECRET` as the production tenant credential path (see roadmap Phase H).
- Admin Provider Credentials UI (Phase E) is required in the same release train as Phase D.

## Related

- [ADR-007](./adr-007-tenant-owned-integration-credentials)
- [ADR-002 v1.1](./adr-002-integration-manifest-v1-1-amendment)
- [Tenant-Owned Integration Credentials guide](/developer-guide/tenant-owned-integration-credentials)
- [Tenant Integrations API](/api/tenant-v1-integrations)
