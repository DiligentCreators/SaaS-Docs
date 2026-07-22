# Database architecture

Single shared database. Catalog tables are **central-only** (no `tenant_id`). Workspace-scoped rows use `tenant_id` FKs.

## Entity overview

```
central_users          tenants ──has──► workspace_module_subscriptions ──► modules
                              │                │
                              │                └── workspace_module_subscription_history
                              │
                              ├── tenant_settings
                              ├── billing profile columns (anchor, cycle, proration, next_billing_at)
                              ├── invoices ──► invoice_items
                              ├── payments ──► payment_transactions
                              ├── payment_methods, billing_addresses
                              ├── impersonation_sessions (central_user_id)
                              ├── (Cashier) subscriptions ──► subscription_items
                              ├── stripe_id / pm_type / pm_last_four (Billable / Stripe)
                              └── tenant_gateway_customers (provider-neutral customer_reference)

modules ──► module_categories
modules ──► module_dependencies (depends_on_module_id)
payment_gateways ──► gateway_logs, webhook_logs, payment_attempts, tenant_gateway_customers
system_settings (key/value — Central Application settings; see Settings section)

lead_stages / leads / lead_notes / lead_follow_ups / lead_activities
lead_assignment_histories
  (tenant-scoped CRM — Leads module)

tasks / task_notes / task_activities
task_digest_deliveries
daily_summary_deliveries
  (tenant-scoped work items — Tasks module + CRM daily digests)

communication_templates
  (tenant-scoped plain-text templates — Communication Templates module)

notifications
  (Laravel database notifications — polymorphic notifiable)
```

`tenants` is the Cashier **billable** model. Cashier's `subscriptions`/`subscription_items` are the Stripe mirror. **`workspace_module_subscriptions` is the business source of truth** for licensing. **`invoices` / `payments` are the financial ledger SoT.**

Plans, plan pivots, limit definitions, feature catalogs, and `tenant_subscriptions` have been **removed**.

## Leads module tables

### `lead_stages`

Per-workspace pipeline: `tenant_id`, `uuid`, `name`, `slug`, `color`, `sort_order`, `is_won`, `is_lost`, `is_default`, soft deletes. Seeded New → Contacted → Qualified → Proposal → Negotiation → Won / Lost.

### `leads`

`tenant_id`, `uuid`, `name`, contact fields, `stage_id`, `status` (`active`|`waiting`|`on_hold`|`closed`|`archived`), `priority` (`low`|`medium`|`high`|`urgent`), `assigned_to`, `lead_value` (renamed from `estimated_value`), `last_contacted_at`, `next_follow_up_at`, `converted_at`, `conversion_meta` (JSON), soft deletes. Status is **independent** of stage. Spatie activity log name `leads`.

### `lead_notes` / `lead_follow_ups` / `lead_activities`

Notes (author + body), follow-ups (due/complete/status), and CRM timeline (`type`, `description`, `properties` JSON).

### `lead_assignment_histories`

`tenant_id`, `lead_id`, `old_user_id`, `new_user_id`, `changed_by`, `reason`, timestamps. Records assignee changes.

## Tasks module tables

### `tasks`

`tenant_id`, `uuid`, `title`, `description`, `status` (`open`|`in_progress`|`waiting`|`completed`|`cancelled`), `priority` (`low`|`medium`|`high`|`urgent`), `due_at`, `assigned_to`, `created_by`, `completed_at`, soft deletes. Spatie activity log name `tasks`. UI labels `open` as **To Do**.

### `task_notes` / `task_activities`

Notes / comments (author + body) and task timeline (`type`, `description`, `properties` JSON).

### `task_digest_deliveries`

Once-per-day mail ledger for task due digests: `tenant_id`, `user_id`, `digest_date`, `status` (`queued`|`sent`|`failed`), `attempts`, `queued_at` / `sent_at` / `failed_at` / `retry_after`, `failure_reason`. Unique `(tenant_id, user_id, digest_date)`.

### `daily_summary_deliveries`

Once-per-day mail ledger for CRM summaries: same columns as task digests plus `kind` (`personal`|`team`). Unique `(tenant_id, user_id, digest_date, kind)`. Stale `queued` may be reclaimed after 45 minutes (max 5 attempts).

### Users CRM flags

Tenant `users` includes:

- `exclude_from_lead_auto_assign` (boolean) — omit from lead assignee pickers / equal distribute
- `receive_all_users_daily_summary` (boolean, default `false`) — receive team CRM summary email instead of personal

## Communication Templates module tables

### `communication_templates`

`tenant_id`, `uuid` (route key), `name`, `context` (e.g. `leads`), `channel` (MVP: `whatsapp`), `category` (nullable), `body` (plain text), `is_active`, `created_by`, `updated_by`, `last_used_at`, soft deletes. Unique name per tenant+context+channel among non-deleted rows. Placeholders are not stored as rows — they come from the in-code registry.

## Notifications

### `notifications`

Laravel standard table: UUID `id` (stable public notification id), `type`, morphs `notifiable`, `data` (JSON envelope `schema_version: 1`), `read_at`, timestamps.

Indexes: morph index plus composites `(notifiable_type, notifiable_id, read_at)` and `(notifiable_type, notifiable_id, created_at)` for unread/list queries.

Retention: `php artisan notifications:prune --days=90` (scheduled weekly) deletes **read** rows only. See [notification-architecture-contract](/developer-guide/notification-architecture-contract).

## Table dictionary (licensing & catalog)

### `module_categories`

`name`, `slug` (unique), `description`, `sort_order`, `is_active`.

### `modules`

| Column | Notes |
|--------|-------|
| `uuid` | Unique public id |
| `name`, `slug` (unique), `description`, `icon` | |
| `category_id` | FK `module_categories`, nullable |
| `monthly_price`, `yearly_price`, `currency`, `setup_fee` | Catalog amounts; default CRM modules are `0`. No provider IDs on modules |
| `trial_days`, `version`, `status` | `draft` \| `published` \| `deprecated` |
| `is_default_included` | Auto-install on workspace create |
| `is_billable` | Whether the module can be charged when platform-managed |
| `sort_order`, `is_active` | |
| soft deletes | |

Default-included catalog modules today: **Leads**, **Tasks**, **Communication Templates** (`is_default_included=true`, `is_billable=false`). Production receives new default modules via **data migrations** (`DefaultModuleRegistrar`), not seeders. Modules are pure licensing products — they do not store permission lists. User authorization uses Spatie Roles & Permissions separately.

### `payment_gateway_module_prices`

Per-gateway catalog mapping (provider-agnostic price references):

| Column | Notes |
|--------|-------|
| `payment_gateway_id`, `module_id`, `billing_cycle` | Unique triple (`monthly` \| `yearly`) |
| `gateway_product_reference` | e.g. Stripe `prod_…`, PayPal plan id — nullable |
| `gateway_price_reference` | e.g. Stripe `price_…` — required for checkout when gateway `requiresProductMapping()` |
| `gateway_metadata` | JSON bag for driver-specific extras |

### `module_dependencies`

`(module_id, depends_on_module_id)` unique. Optional flag `is_optional`. Enforced on marketplace install.

### `workspace_module_subscriptions`

| Column | Notes |
|--------|-------|
| `tenant_id`, `module_id` | Unique pair |
| `status` | `pending` \| `trial` \| `active` \| `expired` \| `cancelled` \| `suspended` |
| `source` | `included` \| `purchased` \| `trial` |
| `billing_cycle`, `price`, `currency`, `is_billable` | Snapshot for billing |
| period timestamps | `trial_*`, `starts_at`, `ends_at`, `renews_at`, `cancelled_at` |
| `provider`, `provider_subscription_id` | Gateway-facing refs |
| `payment_gateway_id` | FK to `payment_gateways` (nullable) — which driver owns renewals |
| soft deletes | |

### `workspace_module_subscription_history`

Append-only events: `module_installed`, `module_purchase_pending`, `module_activated`, `module_cancelled`, `module_suspended`, etc.

### `tenants` billing profile columns

| Column | Notes |
|--------|-------|
| `billing_anchor_day` | 1–28 |
| `billing_cycle` | Workspace default (`monthly` / `yearly`) |
| `proration_mode` | `prorated` \| `free_until_next` \| `none` |
| `next_billing_at` | Next consolidated invoice run |

Workspace profile columns include `company_name`, `workspace_name`, `slug`, `email`, `phone`, `logo_path`, `notes`, `timezone`, `currency`, `country`, `locale`. There is **no** `owner_id` or `address` column.

## Table dictionary (financial ledger)

### `payment_gateways`

| Column | Notes |
|--------|-------|
| `code` (unique), `name`, `driver` | Driver class FQCN |
| `is_active`, `is_default`, `mode` | `sandbox` \| `live` |
| `config` | Encrypted array (credentials); never expose secrets via API |
| `supported_currencies`, `capabilities` | Cached/display; drivers remain source of truth |
| `webhook_status`, `webhook_last_received_at` | Ingress health |
| `last_tested_at`, `last_test_status`, `last_test_message` | Connection probe |
| `sort_order` | |

Seeded: `manual`, `stripe`.

### `payment_methods`

Workspace preferred / saved methods: `tenant_id`, `payment_gateway_id`, `type`, `brand`, `last_four`, encrypted `token`, `is_default`.

### `payment_attempts`

Gateway-agnostic checkout/charge attempts linked to optional `payment_id` / `invoice_id`.

### `gateway_logs` / `webhook_logs`

Operational admin/driver events and inbound webhook audit trail.

### `billing_addresses`

Workspace billing addresses: `tenant_id`, address lines, `is_default`.

### `taxes`, `coupons`, `refunds`, `credit_notes`

Supporting ledger tables for future tax/discount/refund flows. Not exposed in Central v1 read APIs yet.

### `invoices`

| Column | Notes |
|--------|-------|
| `uuid`, `number` | Unique identifiers |
| `tenant_id` | FK `tenants` |
| `status` | `draft` \| `open` \| `paid` \| `void` \| … |
| `subtotal`, `tax_total`, `discount_total`, `total`, `amount_paid`, `amount_due` | |
| `payment_gateway_id`, `coupon_id`, `billing_address_id` | Nullable FKs |
| `issue_date`, `due_date`, `paid_at` | |
| soft deletes | |

### `invoice_items`

Line items: `invoice_id`, `type` (`module` \| `proration` \| …), optional `module_id` + `workspace_module_subscription_id`, `description`, `quantity`, `unit_amount`, `total`, `meta`.

### `payments`

| Column | Notes |
|--------|-------|
| `uuid` | Unique public id |
| `tenant_id`, `invoice_id` | |
| `payment_gateway_id`, `payment_method_id` | |
| `amount`, `tax`, `currency`, `status` | `pending` \| `succeeded` \| `failed` \| … |
| `transaction_id`, `reference`, `gateway_response`, `webhook_payload` | |
| `captured_at`, `failure_reason` | |

### `payment_transactions`

Append-only gateway status events per payment: `payment_id`, `status`, `amount`, `error`, `raw_payload`.

## Table dictionary (impersonation)

### `impersonation_sessions`

| Column | Notes |
|--------|-------|
| `central_user_id` | FK `central_users` (admin) |
| `tenant_id` | FK `tenants` |
| `reason` | Required audit text |
| `ip_address`, `user_agent` | Request metadata |
| `started_at`, `ended_at`, `duration_seconds` | Session window |

### `system_settings`

Key/value store for Central Application settings (`key` unique, `value`, `type`, `group`).

Groups: `general`, `localization`, `mail`, `branding`, `security`, `maintenance`, `billing`.

Sensitive values (`mail_password`) are encrypted at rest and masked in the admin API. Logo/favicon paths store relative object keys (`branding/logos`, `branding/favicons`) on the configured uploads disk (`public` locally / `s3` in production).

`maintenance_mode` gates the **Tenant Application** only — never Laravel `artisan down` for Central.

Catalog (see `App\Support\SystemSettingDefinitions`):

| Group | Keys |
|-------|------|
| general | `app_name`, `company_name`, `timezone`, `locale`, `currency`, `registration_enabled` |
| localization | `date_format`, `time_format` |
| mail | `mail_driver`, `mail_host`, `mail_port`, `mail_username`, `mail_password`, `mail_encryption`, `mail_from_name`, `mail_from_address` |
| branding | `button_color`, `support_email`, `logo_path`, `favicon_path` |
| security | `session_lifetime_minutes`, `password_min_length`, `password_require_special` |
| maintenance | `maintenance_mode`, `maintenance_message`, `maintenance_eta` |
| billing | `invoice_prefix`, `proration_mode`, `trial_enabled`, `stripe_enabled`, `stripe_webhook_configured`, `default_payment_gateway` |

Obsolete (removed by migration/seeder): `primary_color`, `queue_connection_display`, `filesystem_disk`, `feature_registration`, `feature_invites`, `default_plan_id`.

Docs: [settings/settings.md](/user-guide/central-settings-overview).

### `tenant_settings`

Per-workspace overrides of Central defaults (`tenant_id` + `key` unique, `value`, `type`, `group`).

Resolution hierarchy (via `TenantSettingService`): tenant override → tenant profile columns → Central `system_settings` → system default.

Groups: `general`, `security`, `branding`, `mail`. Sensitive `mail_password` encrypted. Branding files under `tenants/{uuid}/branding/…` on the configured uploads disk. `session_lifetime_minutes` (`0` = never expire) may override Central.

Docs: [settings/tenant-settings.md](/user-guide/tenant-settings-overview).

## Removed tables

`plans`, `plan_module`, `plan_feature`, `plan_limits`, `limit_definitions`, `tenant_usage_counters`, `tenant_subscriptions`, `subscription_events` (replaced by module subscription history), `features` (removed — modules are licensing only; Spatie permissions handle authorization).

## Archive vs soft delete

Unchanged: `archived_at` is independent of soft delete.

