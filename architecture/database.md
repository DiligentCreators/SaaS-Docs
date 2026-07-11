# Database architecture (Phase 1)

Single shared MySQL database. Catalog tables are **central-only** (no `tenant_id`). Tenant-scoped rows use `tenant_id` FKs.

## Entity overview

```
central_users ──owns──► tenants ──has──► tenant_subscriptions ──► plans
                              │                                    │
                              └── tenant_settings                  ├── plan_module ──► modules ──► features
                                                                   └── plan_limits ──► limit_definitions
system_settings (key/value; may reference default_plan_id)
```

## Table dictionary

### `central_users`

Platform identities (admins). Spatie roles on `central-api` guard. Tenants reference `owner_id`.

### `tenants`

| Column | Notes |
|--------|-------|
| `id` | UUID string PK (Stancl) |
| `owner_id` | FK `central_users`, nullable |
| `company_name`, `slug`, `email` | slug unique |
| `status` | `active` \| `suspended` \| `cancelled` |
| `timezone`, `currency`, `country`, `locale` | first-class |
| `trial_ends_at` | denormalized from subscription for filters |
| `data` | Stancl virtual storage only |

### `plans`

`name`, `slug`, `description`, `monthly_price`, `yearly_price`, `currency`, `trial_days`, `is_default`, `is_public`, `sort_order`, `is_active`, soft deletes.

### `modules`

Sellable capability packages: `name`, `slug`, `description`, `icon`, `category`, `sort_order`, `is_active`, soft deletes.

### `features`

Boolean capabilities belonging to one module (`module_id`). Globally unique `slug` (e.g. `leads.create`).

### `plan_module`

M:N `(plan_id, module_id)`. Including a module grants all of that module’s active features.

### `limit_definitions`

Quota catalog: unique `key` (`leads.max`), optional `module_id`, `unit` (`count`, `bytes`, `calls`), `is_active`.

### `plan_limits`

`(plan_id, limit_definition_id)` unique. `value` is `BIGINT UNSIGNED NULL` — **`NULL` means unlimited**.

### `tenant_subscriptions`

Placeholder plan assignment: `status`, `billing_cycle`, trial/period timestamps, nullable `provider` / `provider_subscription_id`, `meta` JSON. No payment processing.

### `tenant_settings`

Open key/value per tenant (`tenant_id`, `key`, `value`).

### `system_settings`

Platform key/value. Keys include `default_plan_id`, `registration_enabled`, `trial_enabled`, `maintenance_mode`, `company_name`, `timezone`, `currency`.

## Unlimited semantics

Never use `-1` sentinels. `plan_limits.value IS NULL` ⇒ unlimited.

## Expansion points (not Phase 1)

- `tenant_members`, `plan_feature` overrides, `usage_counters`, billing provider columns usage, subscription snapshots.
