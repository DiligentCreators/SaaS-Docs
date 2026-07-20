# Tenant-Owned Integration Credentials — Implementation Roadmap

> **Status: Phases C–E complete · Release Hardening in progress · Phase F deferred**  
> Phase A approved 2026-07-20. Binding: [ADR-007](/architecture/adr/adr-007-tenant-owned-integration-credentials), [ADR-004 amendment](/architecture/adr/adr-004-oauth-architecture-amendment), [ADR-002 v1.1](/architecture/adr/adr-002-integration-manifest-v1-1-amendment).  
> Guide: [Tenant-Owned Integration Credentials](./tenant-owned-integration-credentials)

Do **not** redesign architecture in these phases. Platform credential fallback is forbidden.

**Branch strategy:** `feature/tenant-provider-credentials` with stacked PRs per phase.

**Release train rule:** Provider Credentials Admin UI (Phase E) ships with OAuth env credential removal (Release Hardening). Phase F is **not** required for OAuth v1.0.

---

## Phase status summary

| Phase | Focus | Status |
|-------|-------|--------|
| A | Architecture freeze | Complete |
| B | Documentation | Complete |
| C | Database | Complete |
| D | Backend services + OAuth cutover | Complete |
| E | Admin API + UI | Complete |
| **Release Hardening** | Cleanup, audits, docs, quality gates | **This phase** |
| F | API-key credential migration | **Deferred** |
| G | Extra testing matrix (folded into Release Hardening) | Superseded / covered |

---

## Phase F — Migration (DEFERRED)

### Status

**Deferred** until the first production **API-key** integration (e.g. Twilio, Mailgun, Postmark, Meta, OpenAI, Anthropic).

### Reason

No production API-key providers currently exist on the Integration Framework. OAuth providers (Google, Microsoft, Zoom) never stored application secrets on `integration_connections` — they already use `integration_provider_credentials`.

Migrating `integration_connections.credentials` api_key payloads is therefore unnecessary for v1.0 OAuth readiness and would be speculative.

### When to implement

Implement Phase F **together with** the first API-key based integration that uses Provider Credentials schema, in the same milestone as that provider.

### Explicit non-goals until then

- Do **not** move `connection.credentials`
- Do **not** modify `integration_connections` schema for this program
- Do **not** add dual-read compatibility layers
- Do **not** invent placeholder API-key providers solely to exercise migration

### Original objectives (retained for future work)

Cut over api_key-style `integration_connections.credentials` into Provider Credentials where schemas exist; deprecate writing provider secrets into Connections Center for schema-backed integrations.

---

## Release Hardening (post-E)

### Objectives

Prepare tenant-owned Provider Credentials for v1.0: remove obsolete env credential bindings, verify architecture/security/regression, update docs, run full quality gates.

### Deliverables

- Zero runtime reads of `config('integrations.*.client_id|client_secret')`
- Deprecated markers for historical `INTEGRATIONS_*_CLIENT_*` env keys
- Architecture / security / regression audits
- Roadmap + developer docs reflect Phase F deferred
- Pest architecture guards; Playwright + PHPStan + Pint + frontend build green

### Exit criteria

- [x] Config no longer binds client id/secret env keys
- [x] OAuth providers resolve only via `IntegrationCredentialManager` + `ProviderAppCredentials`
- [x] Phase F marked deferred with rationale
- [x] Quality gates green

---

## Historical phase notes (C–E)

Phases C–E delivered the table, manager, OAuth cutover, Admin API, Provider Credentials UI, `/settings/connections`, and Connect gating. See CHANGELOG delivery notes and [Tenant-Owned Integration Credentials](./tenant-owned-integration-credentials).

---

## Summary timeline (estimate)

| Phase | Focus | Est. duration | Risk | Status |
|-------|-------|---------------|------|--------|
| C | Database | 3–5 days | Medium | Done |
| D | Backend | 3–4 days | High | Done |
| E | Frontend | 4–6 days | Medium | Done |
| Release Hardening | Cleanup + audits | 1–2 days | Low | This phase |
| F | API-key migration | With first API-key provider | Medium | **Deferred** |

## Related

- [Tenant-Owned Integration Credentials](./tenant-owned-integration-credentials)
- [ADR-007](/architecture/adr/adr-007-tenant-owned-integration-credentials)
- [Documentation Review](/architecture/adr/documentation-review-tenant-owned-credentials)
