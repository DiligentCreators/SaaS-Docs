# Database architecture

Single shared database. Catalog tables are **central-only** (no `tenant_id`). Workspace-scoped rows use `tenant_id` FKs.

## Entity overview

```
central_users ──owns──► tenants ──has──► workspace_module_subscriptions ──► modules ──► features
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
                              └── stripe_id / pm_type / pm_last_four (Billable)

modules ──► module_categories
modules ──► module_dependencies (depends_on_module_id)
payment_gateways
system_settings (key/value)
```

`tenants` is the Cashier **billable** model. Cashier's `subscriptions`/`subscription_items` are the Stripe mirror. **`workspace_module_subscriptions` is the business source of truth** for licensing. **`invoices` / `payments` are the financial ledger SoT.**

Plans, plan pivots, limit definitions, and `tenant_subscriptions` have been **removed**.

## Table dictionary (licensing & catalog)

### `module_categories`

`name`, `slug` (unique), `description`, `sort_order`, `is_active`.

### `modules`

| Column | Notes |
|--------|-------|
| `uuid` | Unique public id |
| `name`, `slug` (unique), `description`, `icon` | |
| `category_id` | FK `module_categories`, nullable |
| `monthly_price`, `yearly_price`, `setup_fee` | Ready for paid modules; Leads/Tasks are `0` |
| `trial_days`, `version`, `status` | `draft` \| `published` \| `deprecated` |
| `is_default_included` | Auto-install on workspace create |
| `is_billable` | Whether consolidated billing charges this module |
| `stripe_*_price_id` | Manual Stripe mapping for future paid modules |
| `sort_order`, `is_active` | |
| soft deletes | |

Seeded today: **Leads**, **Tasks** only (`is_default_included=true`, `is_billable=false`).

### `features`

Boolean capabilities belonging to one module (`module_id`). Globally unique `slug` (e.g. `leads.create`). Never sold separately.

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
| `provider`, `provider_subscription_id` | Gateway refs |
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

## Table dictionary (financial ledger)

### `payment_gateways`

`code` (unique), `name`, `is_active`, `config`, `sort_order`. Seeded via engine on first use (`manual`, `stripe`).

### `payment_methods`

Workspace-scoped saved methods: `tenant_id`, `payment_gateway_id`, `type`, `brand`, `last_four`, `token`, `is_default`.

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

## Removed tables

`plans`, `plan_module`, `plan_feature`, `plan_limits`, `limit_definitions`, `tenant_usage_counters`, `tenant_subscriptions`, `subscription_events` (replaced by module subscription history).

## Archive vs soft delete

Unchanged: `archived_at` is independent of soft delete.
