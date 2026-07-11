# Entitlements model (Phase 1)

## Concepts

| Concept | Meaning | Example |
|---------|---------|---------|
| Module | Sellable product package | Leads, Tasks, Storage |
| Feature | Boolean capability inside a module | `leads.create` |
| Limit definition | Named quota metric | `leads.max` |
| Plan module | Modules included in a plan | Professional → Leads+Tasks |
| Plan feature | Feature-level override for a plan | Professional → Leads minus `leads.export` |
| Plan limit | Quota value for a plan | `leads.max = 500` or `NULL` (unlimited) |

Features are **not** limits. Limits are never hardcoded in PHP application config for product quotas.

## Feature resolution: modules vs. plan_feature overrides

A plan's effective feature set is no longer purely "all features of included modules". Two pivots exist:

1. **`plan_module`** — including a module in a plan grants that module's full set of active features by default.
2. **`plan_feature`** — an explicit per-feature override on the plan, managed independently via `GET/PUT /plans/{plan}/features` (admin UI: Plan editor → **Features** tab, separate from the **Modules** tab).

`plan_feature` lets a plan diverge from "whole module in, whole module out" — e.g. grant a single gated feature without including its module, or include a module but withhold one premium feature within it. Both pivots are synced independently; there is no automatic reconciliation between "modules selected" and "features selected" — an admin managing a plan is expected to configure both tabs deliberately.

## Default plan resolution

1. `system_settings.default_plan_id` if set and plan exists / active
2. Else `plans.is_default = true` (exactly one enforced in app)
3. Else fail closed with a clear admin error

## Trial rules

- Trial length comes from the **resolved plan's `trial_days`**
- Never from `.env` or `config/`
- `system_settings.trial_enabled = false` ⇒ assign plan with `status=active` and no trial window
- Changing default plan or `trial_days` affects **future** tenants only

## Stripe price mapping (billing, not entitlements)

Plans carry manual `stripe_product_id`, `stripe_monthly_price_id`, `stripe_yearly_price_id` columns (see [architecture/database.md](database.md)). These map a plan to Stripe billing objects that already exist in the Stripe dashboard — the platform does not create or manage Stripe products/prices. Entitlement resolution (modules/features/limits) is independent of whether a plan has Stripe IDs configured; a plan without Stripe IDs still resolves normally, it just can't be billed through Cashier. See [billing/stripe-cashier.md](../billing/stripe-cashier.md).

## Runtime resolution (future product use)

`Tenant → current TenantSubscription → Plan → plan_modules / plan_feature overrides / plan_limits`

Phase 1 exposes this data via central APIs and the admin UI only; no CRM enforcement paths. `tenant_usage_counters` exists to record consumption per limit but is not yet checked against `plan_limits.value` at write time.
