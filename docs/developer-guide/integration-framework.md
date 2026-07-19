# Integration Framework (Phase 0)

> **Status: Implemented (Phase 0)**  
> Authoritative product architecture: SaleOS Platform Architecture v1.0 (Final). Binding ADRs: ADR-001…006. This page documents the **shipped** Phase 0 surface only.

Phase 0 delivers the platform Integration Framework foundation. Calendar, Meetings, Zoom, sync, and booking are **not** included.

## What shipped

| Component | Purpose |
|-----------|---------|
| Integration Manifest v1 | Declarative `*.integration.php` files |
| ManifestLoader / ManifestValidator | Boot-time load + schema validation |
| IntegrationRegistry / IntegrationManager | Discovery and capability lookup |
| Connections Center API | Tenant credential store (`integration_connections`) |
| OAuthManager + GoogleOAuthProvider | Centralized OAuth (Google only in Phase 0) |
| ConnectionHealthService | Test connection + health status |
| ConnectionLock | Per-connection cache lock helper |
| Domain Event Envelope | ADR-006 envelope helpers |
| Correlation IDs | `X-Correlation-ID` middleware |

## Manifests

Path: `config/integrations/manifests/{slug}.integration.php`

Shipped manifests:

- `google.integration.php` — shared Google Workspace OAuth connection (ADR-005)
- `google-meet.integration.php` — Meet adapter satellite (`connection_integration=google`)
- `builtin.integration.php` — Built-in Meetings adapter (`connection_type=none`)
- `zoom.integration.php` — Zoom OAuth + meeting adapter

Optional manifest field `connection_integration` (ADR-005): credential store slug when a capability adapter reuses another connection. Satellite manifests are excluded from Connections Center discovery.

Invalid manifests fail boot outside production; production logs and disables that slug.

Meeting provider discovery reads non-null `adapters.meeting`. See [Meetings](/developer-guide/meetings), [Zoom](/developer-guide/zoom-meeting-provider), [Google Meet](/developer-guide/google-meet-provider).

## Connections

- Credentials live **only** on `integration_connections` (encrypted tokens/credentials).
- Permissions: `connections.view`, `connections.manage`, `connections.manage_user`
- Uniqueness: `(tenant_id, integration_slug, owner_type, owner_id, external_account_id)` among non-deleted rows

## OAuth (Google)

1. `POST /api/tenant/v1/connections/google/oauth/start` → `authorize_url` + `state`
2. Browser → Google → `GET /oauth/callback/google`
3. Tokens stored encrypted; SPA redirected to Connections success URL

Central credentials:

```env
INTEGRATIONS_GOOGLE_ENABLED=true
INTEGRATIONS_GOOGLE_CLIENT_ID=
INTEGRATIONS_GOOGLE_CLIENT_SECRET=
```

## Domain events

Use `App\Support\DomainEvents\DomainEventEnvelope` and `EnvelopedDomainEvent` (`ShouldDispatchAfterCommit`). Phase 0 emits `IntegrationConnected` / `IntegrationDisconnected`.

## Correlation IDs

Middleware `AssignCorrelationId` accepts/emits `X-Correlation-ID` and stores the value in Laravel Context.

## Explicitly out of Phase 0

Calendar, Meetings, Scheduling Platform tables, Zoom/Microsoft OAuth, WebhookRouter, booking, workflow, outbox.

## Related

- [Tenant Integrations & Connections API](/api/tenant-v1-integrations)
- [Multi-Provider Email](./multi-provider-email) (separate runtime; may be bridged later)
- [Payment Gateways Overview](./payment-gateways-overview) (separate runtime; may be bridged later)
