# Architecture Decision Records

Binding ADRs for the SaleOS platform. Formal ADR markdown for ADR-001, ADR-003, ADR-005, and ADR-006 is still reconstructed from code and developer guides; **ADR-002**, **ADR-004**, and **ADR-007** are the credentials-program source of truth after Phase B (2026-07-20).

| ADR | Title | Status |
|-----|-------|--------|
| ADR-001 | Scheduling Platform is source of truth; Calendar is presentation | Accepted (cited) |
| [ADR-002](./adr-002-integration-manifest-v1-1-amendment) | Integration Manifest (v1 → **v1.1**) | Accepted + amended |
| ADR-003 | Schedule ownership key (`ScheduleOwner`) | Accepted (cited) |
| [ADR-004](./adr-004-oauth-architecture-amendment) | Centralized OAuth + Connections Center | Accepted + amended |
| ADR-005 | Shared multi-capability connection (`connection_integration`) | Accepted (cited) |
| ADR-006 | Domain event envelope | Accepted (cited) |
| [ADR-007](./adr-007-tenant-owned-integration-credentials) | Tenant-Owned Integration Credentials | **Accepted (frozen)** |

## Related guides

- [Tenant-Owned Integration Credentials](/developer-guide/tenant-owned-integration-credentials)
- [Implementation Roadmap (Phases C–G)](/developer-guide/tenant-owned-credentials-implementation-roadmap)
- [Integration Framework](/developer-guide/integration-framework)
- [Documentation Review Report](./documentation-review-tenant-owned-credentials)

## Governance

Phase A architecture freeze (2026-07-20) approved the two-store model. Phase B documents it. **Do not redesign** in later phases unless a genuine implementation blocker is raised and approved.
