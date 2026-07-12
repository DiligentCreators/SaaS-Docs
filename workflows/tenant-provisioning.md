# Workspace provisioning

## Flow

```
Admin creates workspace (POST /tenants)
  → Tenant row + domain
  → Initialize billing profile (anchor day, cycle, proration mode, next_billing_at)
  → Install every published module where is_default_included = true
       (today: Leads, Tasks)
  → Record workspace_module_subscription_history (module_installed)
  → Entitlement cache ready

Self-service registration (POST /public/register-workspace)
  → Same provisioning as above
  → Ensure tenant-api roles + permissions
  → Create workspace owner User (superadmin)
  → Issue Sanctum tenant-token for SPA login
```

## Rules

- No plan assignment.
- Default modules are `source=included`, `is_billable=false`, `price=0`, `status=active`.
- Workspace owners cannot cancel included modules (`POST …/cancel` rejected); platform admin may deactivate.
- Missing default modules at provision time fails closed (exception).
- Additional modules are installed later via marketplace (`POST /tenants/{tenant}/modules`) or admin install; billable modules enter `pending` until the Billing Engine settles payment.
- Consolidated billing (`billing:run-consolidated`) picks up billable active subscriptions on `next_billing_at` — not at provision time for included modules.
- Admin-created workspaces do not auto-create an owner user (invite/create later). Self-service registration always creates the owner.

## Billing profile defaults

| Field | Initial value |
|-------|---------------|
| `billing_anchor_day` | Today's day, clamped 1–28 |
| `billing_cycle` | `monthly` |
| `proration_mode` | From system setting |
| `next_billing_at` | Next month on anchor day |

See [billing/billing-engine.md](../billing/billing-engine.md) for consolidated invoice sequence.
