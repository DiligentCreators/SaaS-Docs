# Documentation Review Report — Tenant-Owned Integration Credentials (Phase B)

- **Date:** 2026-07-20
- **Scope:** SaaS-Docs only (Phase B architecture governance)
- **Architecture:** Frozen per Phase A approval — [ADR-007](./adr-007-tenant-owned-integration-credentials)

## Summary

Phase B documentation is complete for ADR-007, ADR-004 amendment, ADR-002 v1.1 amendment, the developer architecture guide, and the C–G implementation roadmap. Cross-references and terminology were updated across Integration Framework, provider, meetings/calendar, deployment, API, architecture index, platform freeze, and changelog pages.

**Verdict:** Ready for Phase C approval gate. No production code in this phase.

---

## PASS

| Check | Result |
|-------|--------|
| ADR-007 created with required sections | PASS |
| ADR-004 amendment documents no-config tenant credential resolution, fixed callback, PKCE, Connections Center role, no fallback | PASS |
| ADR-002 amendment documents Manifest v1.1 fields + discovery + backward compatibility | PASS |
| Architecture overview guide with diagrams + glossary | PASS |
| Implementation roadmap Phases C–G with objectives, deliverables, exit criteria, rollback, quality gates | PASS |
| Two-store terminology consistent in Integration Framework | PASS |
| Meeting/Calendar provider docs cite ADR-007; satellites do not own credential rows | PASS |
| API docs list planned Provider Credentials endpoints without claiming shipped | PASS |
| Architecture index + VitePress sidebar wired | PASS |
| Changelog delivery note for Phase B | PASS |
| Platform freeze documents approved pre-v1.0 ADR-007 correction path | PASS |
| Non-goals preserved (Cashier, Creem, APP_KEY, central mail, email/payment parallel stores) | PASS |
| No backend/frontend/migration files modified in this phase | PASS (Docs repo only) |

---

## WARNINGS

| ID | Warning | Severity | Notes |
|----|---------|----------|-------|
| W1 | ADR-001, ADR-003, ADR-005, ADR-006 still lack standalone formal ADR markdown | Medium | Cited in code/guides; index labels them “Accepted (cited)”. Not a credentials redesign — formalize later without changing meaning. |
| W2 | User Guide lacks Provider Credentials / Connections Center pages | Medium | Expected until Phase E. Meeting/Calendar user guides still describe Connect without tenant app setup steps. |
| W3 | `INTEGRATIONS_*_CLIENT_*` still appears in docs | Low | Intentionally marked **deprecated** where shown; must not be removed until Phase D/H or readers lose migration context. |
| W4 | `/settings/connections` still a shipped product gap | Medium | Documented in ADR-007 / roadmap Phase E; not inventing new architecture. |
| W5 | `connections.manage_user` still unused on routes (code fact) | Low | Outside Phase B; do not “fix” in docs beyond noting Connections permissions exist. |
| W6 | Multi-provider email + payment_gateways remain parallel credential stores | Low | Explicit ADR-007 non-goal / future ADR-008; no conflict if docs keep saying “separate runtime”. |
| W7 | Manifest `manifest_version` integer bump vs additive v1.1 | Low | ADR-002 records this as Phase C Note — architecture allows either if boot stays compatible. |
| W8 | Product roadmap / older changelog entries still say “ADR-001–006 unchanged” | Low | Historical; new changelog entry supersedes for credentials program. Do not rewrite history. |
| W9 | No dedicated global glossary site page | Low | Glossary lives in the Tenant-Owned Credentials guide; sufficient for Phase B. |
| W10 | Docs Quality Gate (VitePress build) | — | **PASS** — `npm run docs:build` succeeded 2026-07-20 (`ignoreDeadLinks: false`) |

---

## Architecture conflict scan

| Topic | Conflict? | Resolution |
|-------|-----------|------------|
| “Credentials live only on integration_connections” | Was conflict | Updated Integration Framework to two-store model |
| “Connections Center owns credentials” (ops docs) | Was conflict | Updated scheduling-ops wording |
| Platform env as production credential path | Deprecated, not current target | Labeled deprecated + roadmap removal |
| Single status ladder mixing credential+connection+health | Rejected in Phase A | ADR-007 documents split + UX composite |
| Satellite credential rows | None | Primaries only |

---

## Broken references

Internal links introduced in Phase B target existing new pages. Run VitePress build to confirm (`ignoreDeadLinks: false`).

---

## Required follow-up for Phase C

1. Implement `integration_provider_credentials` migration exactly as ADR-007 schema (no redesign).
2. Resolve ADR-007 Phase C Notes: soft-delete retention, `azure_tenant` validation set, Zoom app-type wizard copy, four-vs-two permissions decision for defaults.
3. Update `database.md` table dictionary with concrete columns once migration exists (placeholder section already present).
4. Add permission rows to tenant RBAC user/developer docs when permissions land.
5. Keep User Guide Provider Credentials pages for **Phase E** (do not invent UI copy that implies shipped).
6. Formalize ADR-001/003/005/006 markdown in a separate docs PR (optional; not a Phase C blocker).
7. Do not introduce platform env fallback “for convenience” during Phase C scaffolding.

---

## Phase C Notes (implementation questions — not architecture changes)

Carried from ADR-007:

1. Soft-delete retention window (recommended 30 days) and purge job ownership.
2. Exact Microsoft `azure_tenant` allowed values.
3. Zoom Marketplace app type assumptions for wizard copy.
4. Ship four `provider_credentials.*` permissions vs fold validate/rotate into manage.
5. Non-prod demo seeder only — never runtime fallback.

---

## Related

- [ADR index](./)
- [Tenant-Owned Integration Credentials](/developer-guide/tenant-owned-integration-credentials)
- [Implementation Roadmap](/developer-guide/tenant-owned-credentials-implementation-roadmap)
