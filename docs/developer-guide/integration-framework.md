# Integration Framework (Phase 0+)

> **Status: Implemented (Phase 0+) with Architecture Freeze for Tenant-Owned Credentials**  
> Authoritative product architecture: SaleOS Platform Architecture v1.0. Binding ADRs: ADR-001…006, plus **[ADR-007](/architecture/adr/adr-007-tenant-owned-integration-credentials)** (frozen) and amendments to [ADR-002](/architecture/adr/adr-002-integration-manifest-v1-1-amendment) / [ADR-004](/architecture/adr/adr-004-oauth-architecture-amendment).  
> Credentials program: [Tenant-Owned Integration Credentials](./tenant-owned-integration-credentials) — **Phases C–E shipped; Release Hardening; Phase F deferred**.

Phase 0 delivered the Integration Framework foundation (manifests, Connections Center, OAuthManager, health, event envelope). Calendar, Meetings, Zoom, Microsoft, and sync shipped in later phases on this foundation.

## Two credential stores (ADR-007)

| Store | Table | Contents |
|-------|-------|----------|
| **Provider Credentials** | `integration_provider_credentials` | Application credentials only (`client_id`/`client_secret`, future API keys, …) |
| **Connections Center** | `integration_connections` | Runtime authorization only (tokens, status, health, external account) |

**There is never a platform fallback** for tenant integration app credentials. Runtime OAuth app credentials resolve **only** via `IntegrationCredentialManager` from `integration_provider_credentials`. Platform env `INTEGRATIONS_*_CLIENT_ID/SECRET` keys are **deprecated and unbound**.

## What shipped

| Component | Purpose |
|-----------|---------|
| Integration Manifest v1 (→ **v1.1** additive fields in ADR-002) | Declarative `*.integration.php` files |
| ManifestLoader / ManifestValidator | Boot-time load + schema validation |
| IntegrationRegistry / IntegrationManager | Discovery and capability lookup |
| Connections Center API | Runtime auth store (`integration_connections`) |
| OAuthManager + OAuth providers | Centralized OAuth (Google, Microsoft, Zoom) |
| ConnectionHealthService | Test connection + health status |
| ConnectionLock | Per-connection cache lock helper |
| Domain Event Envelope | ADR-006 envelope helpers |
| Correlation IDs | `X-Correlation-ID` middleware |

## Manifests

Path: `config/integrations/manifests/{slug}.integration.php`

Shipped manifests:

- `google.integration.php` — shared Google Workspace OAuth connection (ADR-005); **owns Provider Credentials** (primary)
- `google-meet.integration.php` — Meet adapter satellite (`connection_integration=google`)
- `google-calendar.integration.php` — Calendar sync adapter satellite (`connection_integration=google`)
- `microsoft.integration.php` — Microsoft 365 shared connection (ADR-005); **owns Provider Credentials** (primary)
- `outlook-calendar.integration.php` — Outlook Calendar sync adapter satellite (`connection_integration=microsoft`)
- `builtin.integration.php` — Built-in Meetings adapter (`connection_type=none`)
- `zoom.integration.php` — Zoom OAuth + meeting adapter; **owns Provider Credentials** (primary)

Optional manifest field `connection_integration` (ADR-005): connection/credential host slug when a capability adapter reuses another primary. Satellite manifests are excluded from Connections Center discovery and do **not** get Provider Credential rows.

Manifest **v1.1** adds `credential_type`, `credential_schema`, `credential_validator`, `supports_validation`, `supports_rotation`. See [ADR-002 amendment](/architecture/adr/adr-002-integration-manifest-v1-1-amendment).

Invalid manifests fail boot outside production; production logs and disables that slug.

Meeting provider discovery reads non-null `adapters.meeting`. See [Meetings](/developer-guide/meetings), [Zoom](/developer-guide/zoom-meeting-provider), [Google Meet](/developer-guide/google-meet-provider).

Calendar provider discovery reads non-null `adapters.calendar`. See [Google Calendar Sync](/developer-guide/google-calendar-sync), [Outlook Calendar Sync](/developer-guide/outlook-calendar-sync).

## Connections Center

- Stores **runtime** tokens and connection metadata on `integration_connections` (encrypted tokens).
- Does **not** own OAuth application client secrets after ADR-007 cutover.
- Permissions: `connections.view`, `connections.manage`, `connections.manage_user`
- Uniqueness: `(tenant_id, integration_slug, owner_type, owner_id, external_account_id)` among non-deleted rows

## OAuth

1. Tenant configures and validates **Provider Credentials** (Administration → Provider Credentials).
2. `POST /api/tenant/v1/connections/{integration}/oauth/start` → `authorize_url` + `state` (requires **validated** credentials)
3. Browser → provider → `GET /oauth/callback/{provider}` (fixed platform redirect URI)
4. Tokens stored encrypted on Connections Center; SPA redirected to success URL (default `/settings/connections`)

PKCE and the fixed callback URL are unchanged ([ADR-004 amendment](/architecture/adr/adr-004-oauth-architecture-amendment)).

### Enable flags (allowed) vs deprecated credential env

```env
INTEGRATIONS_GOOGLE_ENABLED=true
# Do NOT set INTEGRATIONS_GOOGLE_CLIENT_ID / SECRET — deprecated and unbound (ADR-007)
```

Enable flags may remain. Historical client id/secret env vars are ignored by runtime.

## Domain events

Use `App\Support\DomainEvents\DomainEventEnvelope` and `EnvelopedDomainEvent` (`ShouldDispatchAfterCommit`). Phase 0 emits `IntegrationConnected` / `IntegrationDisconnected`.

## Correlation IDs

Middleware `AssignCorrelationId` accepts/emits `X-Correlation-ID` and stores the value in Laravel Context.

## Related

- [Tenant-Owned Integration Credentials](./tenant-owned-integration-credentials)
- [Implementation Roadmap](./tenant-owned-credentials-implementation-roadmap)
- [ADR index](/architecture/adr/)
- [Tenant Integrations & Connections API](/api/tenant-v1-integrations)
- [Multi-Provider Email](./multi-provider-email) (separate runtime; may be bridged later via ADR-008)
- [Payment Gateways Overview](./payment-gateways-overview) (separate runtime; may be bridged later via ADR-008)
