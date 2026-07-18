# Tenant RBAC — Production Guide

Operational and security notes for workspace-isolated RBAC.

## Security invariants

1. **Workspace isolation** — Tenancy middleware + `roles.tenant_id` ensure users/roles never leak across workspaces.
2. **Module licensing** — `module:{slug}` must stay in front of product routes; permissions alone must not unlock unlicensed modules.
3. **RBAC** — Prefer role→permission grants; avoid direct user permissions unless there is a documented exception.
4. **Guard separation** — Tenant (`tenant-api` / `User`) and Central (`central-api` / `CentralUser`) credentials never interchange.
5. **Owner protection** — Do not allow deleting the Owner role or the last Owner without an explicit product rule.

## Implementation checklist

- [ ] `config/tenant-permissions.php` lists every tenant permission used in routes/policies/UI
- [ ] New workspaces provision roles via `TenantAuthorizationProvisioningService` with `tenant_id` set before owner creation
- [ ] New permissions ship in additive data migrations; login never repairs RBAC
- [ ] Role sync uses Role **models**, not bare names
- [ ] Policies deny cross-tenant subjects even if IDs collide
- [ ] Product routes use `module:` + `can:` together
- [ ] SPA tenant nav items gated by the same permission names as the API

## Operational risks

| Risk | Mitigation |
|------|------------|
| Assigning roles by name across tenants | Always resolve roles with `tenant_id` |
| Enabling Spatie teams without migration | Keep custom `tenant_id` until pivots use UUID team keys |
| Privilege escalation | Policies block self-escalation / Owner self-delete where defined; audit role updates |
| Stale permission cache | Data migrations and provisioning clear Spatie's permission cache |
| Incomplete deploy “fixed” on login | Forbidden — auth has no RBAC side effects; ship additive permission migrations |

## Maintenance

Legacy shared roles (`tenant_id` null) — explicit only:

```bash
php artisan tenants:isolate-roles
```

Do not expect role listing or dashboard to backfill isolation.

## Monitoring

- Audit role and user mutations (activity log where enabled)
- Alert on repeated 403s on admin APIs (possible probing)
- After permission catalog changes, re-run Pest isolation + Playwright `test:e2e:tenant-rbac`

## Related

- [Developer guide](/developer-guide/tenant-rbac)
- [User guide](/user-guide/tenant-rbac)
- [Entitlements](/developer-guide/entitlements)
