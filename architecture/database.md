# Database architecture (Phase 1)

Single shared MySQL database. Catalog tables are **central-only** (no `tenant_id`). Tenant-scoped rows use `tenant_id` FKs.

## Entity overview

```
central_users ──owns──► tenants ──has──► tenant_subscriptions ──► plans
                              │                │                   │
                              │                └── subscription_events
                              │                                    │
                              ├── tenant_settings                  ├── plan_module ──► modules ──► features
                              ├── tenant_usage_counters ──► limit_definitions
                              ├── (Cashier) subscriptions ──► subscription_items      ├── plan_feature ──► features
                              └── stripe_id / pm_type / pm_last_four (Billable)       └── plan_limits ──► limit_definitions
system_settings (key/value; may reference default_plan_id)
```

`tenants` is the Cashier **billable** model (`stripe_id`, `pm_type`, `pm_last_four`, `trial_ends_at`). Cashier's `subscriptions`/`subscription_items` tables are the Stripe mirror, keyed by `tenant_id`; `tenant_subscriptions` remains the platform's business source of truth for plan/limit/feature resolution. See [billing/stripe-cashier.md](../billing/stripe-cashier.md) for how the two ledgers stay in sync.

## Table dictionary

### `central_users`

Platform identities (admins). Spatie roles on `central-api` guard. Tenants reference `owner_id`.

| Column | Notes |
|--------|-------|
| `id` | Auto-increment PK |
| `name`, `email` (unique), `password` | |
| `phone` | Nullable |
| `avatar_path` | Nullable |
| `is_suspended` | Boolean, default `false` |
| `last_login_at` | Set on successful login |
| `invite_token`, `invite_sent_at` | Set when the user is created via the invite flow |
| soft deletes | |

Activity (`spatie/laravel-activitylog`) is logged for `name`, `email`, `is_suspended`, `last_login_at` and surfaced per-user via `GET /users/{user}/activity`.

### `tenants`

| Column | Notes |
|--------|-------|
| `id` | UUID string PK (Stancl) |
| `owner_id` | FK `central_users`, nullable |
| `company_name`, `workspace_name` | `workspace_name` is optional, falls back to `company_name` for the Cashier customer name |
| `slug` (unique), `email`, `phone` | |
| `logo_path`, `address`, `notes` | Nullable profile fields |
| `status` | `active` \| `suspended` \| `cancelled` |
| `archived_at` | Nullable; independent of soft delete — see [Archive vs soft delete](#archive-vs-soft-delete) |
| `stripe_id`, `pm_type`, `pm_last_four` | Cashier `Billable` columns |
| `timezone`, `currency`, `country`, `locale` | first-class |
| `trial_ends_at` | denormalized from subscription for filters; also read by Cashier's `Billable` trial checks |
| `data` | Stancl virtual storage only |
| soft deletes | |

### `plans`

| Column | Notes |
|--------|-------|
| `name`, `slug` (unique), `description` | |
| `monthly_price`, `yearly_price`, `currency`, `trial_days` | |
| `is_default`, `is_public`, `is_popular` | Booleans; exactly one plan should have `is_default = true` |
| `stripe_product_id`, `stripe_monthly_price_id`, `stripe_yearly_price_id` | **Manually entered** in the plan form — the platform never creates Stripe products/prices on a plan's behalf |
| `sort_order`, `is_active` | |
| soft deletes | |

### `modules`

Sellable capability packages: `name`, `slug`, `description`, `icon`, `category`, `sort_order`, `is_active`, soft deletes.

### `features`

Boolean capabilities belonging to one module (`module_id`). Globally unique `slug` (e.g. `leads.create`).

### `plan_module`

M:N `(plan_id, module_id)`, unique pair. Including a module grants all of that module's active features, unless overridden — see `plan_feature`.

### `plan_feature`

M:N `(plan_id, feature_id)`, unique pair. Lets a plan grant or restrict individual features independently of module inclusion — e.g. a plan can include the Leads module but exclude one gated feature, or grant a feature without granting the whole module. See [entitlements.md](entitlements.md) for resolution order.

### `limit_definitions`

Quota catalog: unique `key` (`leads.max`), optional `module_id`, `unit` (`count`, `bytes`, `calls`), `is_active`.

### `plan_limits`

`(plan_id, limit_definition_id)` unique. `value` is `BIGINT UNSIGNED NULL` — **`NULL` means unlimited**.

### `tenant_usage_counters`

`(tenant_id, limit_definition_id)` unique. `used` (`BIGINT UNSIGNED`, default `0`) tracks consumption against the tenant's resolved `plan_limits.value`. Populated by the tenant details page's usage card; not yet wired to live enforcement — see [README non-goals](../README.md#explicit-non-goals).

### `tenant_subscriptions`

Business-facing plan assignment: `tenant_id`, `plan_id`, `status`, `billing_cycle`, trial/period timestamps, nullable `provider` / `provider_subscription_id` (Stripe subscription ID when `provider = 'stripe'`), `meta` JSON, soft deletes.

`status` values: `trial`, `active`, `expired`, `cancelled`, `suspended`. Cancel/resume/suspend actions transition this row and append a `subscription_events` entry.

### `subscription_events`

Append-only audit trail: `tenant_subscription_id` (FK, cascade), `event` (e.g. `cancelled`, `resumed`, `suspended`, `status_changed`), `description`, `meta` JSON, `created_at` only (no `updated_at`). Rendered as a timeline on the subscription view sheet and the tenant details page.

### Cashier `subscriptions` / `subscription_items`

Laravel Cashier's own tables, customized to key off `tenant_id` instead of `user_id`:

- `subscriptions`: `tenant_id` (FK `tenants`, cascade), `type`, `stripe_id` (unique), `stripe_status`, `stripe_price`, `quantity`, `trial_ends_at`, `ends_at`
- `subscription_items`: `subscription_id`, `stripe_id` (unique), `stripe_product`, `stripe_price`, `quantity`, plus `meter_id` / `meter_event_name` for Stripe usage-based pricing

These are the Stripe mirror used by Cashier's billing portal/checkout APIs. `BillingService::syncFromStripe()` keeps `tenant_subscriptions.status` aligned with Stripe subscription status on webhook events. See [billing/stripe-cashier.md](../billing/stripe-cashier.md).

### `tenant_settings`

Open key/value per tenant (`tenant_id`, `key`, `value`).

### `system_settings`

Platform key/value with `type` and `group`. Groups map to the settings UI sections: `general`, `localization`, `mail`, `branding`, `security`, `maintenance`, `billing`, `feature_flags`. Keys include `default_plan_id`, `registration_enabled`, `trial_enabled`, `maintenance_mode`, `stripe_enabled`, `stripe_webhook_configured`, plus branding/mail/security fields — see [api/central-v1.md](../api/central-v1.md#system-settings) for the full key list.

## Archive vs soft delete

Tenants have two independent lifecycle signals:

- **`archived_at`** — a reversible, non-destructive "hide from active view" flag toggled via `/tenants/{tenant}/archive` and `/unarchive`. Archived tenants keep their data, users, and subscriptions untouched.
- **Soft delete (`deleted_at`)** — the standard delete/restore/force-delete lifecycle. Deleting a tenant also cascades to its domains and tenant subscriptions on force delete; restoring a tenant restores its soft-deleted users and domains too.

A tenant can be archived and not deleted, but archiving does not imply deletion (and vice versa).

## Unlimited semantics

Never use `-1` sentinels. `plan_limits.value IS NULL` ⇒ unlimited.

## Remaining expansion (not yet built)

- Tenant-side product/CRM data model (Leads, Tasks, Contacts, Pipelines, Calendar) — out of scope for the Central Platform
- Live usage-metering enforcement against `tenant_usage_counters` (the table and admin display exist; nothing increments or blocks on it yet)
- Stripe Checkout Session endpoint (the `BillingService` method exists but isn't exposed via a route)
