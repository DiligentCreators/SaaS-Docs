# Workspace provisioning

Provisioning is an **explicit** lifecycle step. Authentication, login, dashboard, and role/user listing never create modules, roles, or permissions as a side effect.

## Flow

```
Admin creates workspace (POST /tenants)  OR  Self-service (POST /public/register-workspace)
  → Tenant row + domain
  → TenantProvisioningService::provision()
       → Initialize billing profile (anchor day, cycle, proration mode, next_billing_at)
       → Install every published module where is_default_included = true
            (today: Leads, Tasks, Communication Templates)
       → TenantAuthorizationProvisioningService::provisionDefaults()
            → Ensure shared permission vocabulary from config/tenant-permissions.php
            → Create workspace-scoped default roles (superadmin, admin, manager, staff)
            → Grant default permission maps (owner receives all)
       → Seed module-specific defaults (e.g. lead stages)
  → Create workspace owner User (superadmin) via TenantAuthBootstrapService::createOwner()
       → Requires roles already provisioned (fails closed if missing)
  → (Self-service only) Issue Sanctum tenant-token for SPA login
```

## Separation of concerns

| Service | Responsibility |
|---------|----------------|
| `TenantProvisioningService` | Billing profile, default modules, authorization defaults, module seed data |
| `TenantAuthorizationProvisioningService` | Workspace roles + default permission grants (explicit provisioning / maintenance only) |
| `TenantAuthBootstrapService` | Create owner user, assign owner role, issue access tokens — **no RBAC mutation** |
| Data migrations | Ship new catalog modules and additive permission grants on `php artisan migrate` |

Login, token issuance, dashboard, and role listing **never** provision or repair authorization state.

## Rules

- No plan assignment.
- Default modules are `source=included`, `is_billable=false`, `price=0`, `status=active`.
- Workspace owners cannot cancel included modules (`POST …/cancel` rejected); platform admin may deactivate.
- Missing default modules at provision time fails closed (exception).
- Additional modules are installed later via marketplace (`POST /tenants/{tenant}/modules`) or admin install; billable modules enter `pending` until the Billing Engine settles payment.
- Consolidated billing (`billing:run-consolidated`) picks up billable active subscriptions on `next_billing_at` — not at provision time for included modules.
- Both Central-admin create and self-service registration require owner credentials and create the owner after provisioning.
- Existing production workspaces receive **new** default-included modules and permissions through **idempotent data migrations**, not seeders and not login-time repair.

## Billing profile defaults

| Field | Initial value |
|-------|---------------|
| `billing_anchor_day` | Today's day, clamped 1–28 |
| `billing_cycle` | `monthly` |
| `proration_mode` | From system setting |
| `next_billing_at` | Next month on anchor day |

See [billing/billing-engine.md](/developer-guide/billing-engine) for consolidated invoice sequence.

## Related

- [Tenant RBAC](/developer-guide/tenant-rbac)
- [Entitlements](/developer-guide/entitlements)
- [Module production registration](/deployment/module-development)
- [Communication Templates deployment](/deployment/communication-templates)
