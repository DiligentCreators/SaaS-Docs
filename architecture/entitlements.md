# Entitlements model (Phase 1)

## Concepts

| Concept | Meaning | Example |
|---------|---------|---------|
| Module | Sellable product package | Leads, Tasks, Storage |
| Feature | Boolean capability inside a module | `leads.create` |
| Limit definition | Named quota metric | `leads.max` |
| Plan module | Modules included in a plan | Professional → Leads+Tasks |
| Plan limit | Quota value for a plan | `leads.max = 500` or `NULL` (unlimited) |

Features are **not** limits. Limits are never hardcoded in PHP application config for product quotas.

## Default plan resolution

1. `system_settings.default_plan_id` if set and plan exists / active
2. Else `plans.is_default = true` (exactly one enforced in app)
3. Else fail closed with a clear admin error

## Trial rules

- Trial length comes from the **resolved plan’s `trial_days`**
- Never from `.env` or `config/`
- `system_settings.trial_enabled = false` ⇒ assign plan with `status=active` and no trial window
- Changing default plan or `trial_days` affects **future** tenants only

## Runtime resolution (future product use)

`Tenant → current TenantSubscription → Plan → plan_modules / plan_limits`

Phase 1 exposes this data via central APIs only; no CRM enforcement paths.
