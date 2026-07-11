# Billing: Stripe + Laravel Cashier

Backend: `SaaS-Backend`, package `laravel/cashier` ^16.6.

## Billable model

`Tenant` (not `CentralUser`) is the Cashier customer. `AppServiceProvider::register()` calls `Cashier::useCustomerModel(Tenant::class)`. The `Tenant` model uses Cashier's `Billable` trait, which adds `stripe_id`, `pm_type`, `pm_last_four`, and `trial_ends_at` columns (see [architecture/database.md](../architecture/database.md)) and Cashier's own `subscriptions()` relation on top of the platform's `tenant_subscriptions`.

`Tenant::stripeName()` returns `workspace_name ?: company_name` — the name Stripe will show for the customer.

Cashier's default routes are disabled (`Cashier::ignoreRoutes()`); the webhook route is registered manually.

## Two subscription ledgers

| Ledger | Purpose | Keyed by |
|--------|---------|----------|
| `tenant_subscriptions` | Business source of truth: plan, limits, features, dashboard stats | `tenant_id` |
| Cashier `subscriptions` / `subscription_items` | Stripe mirror, used by Cashier's own APIs | `tenant_id` (customized from default `user_id`) |

`BillingService` (`app/Services`) bridges the two:

- `cancel()` / `resume()` — update `tenant_subscriptions.status` and, when `provider === 'stripe'`, call the matching Cashier subscription
- `suspend()` — local-only status change, no Stripe call
- `syncFromStripe()` — called from the webhook handler; maps Stripe subscription status onto `tenant_subscriptions.status` and appends a `subscription_events` row

### Stripe status → platform status mapping

| Stripe `stripe_status` | `tenant_subscriptions.status` |
|-------------------------|-------------------------------|
| `active` | `active` |
| `trialing` | `trial` |
| `past_due`, `unpaid`, `incomplete` | `suspended` |
| `canceled` | `cancelled` |
| `incomplete_expired` | `expired` |

## Manual Stripe ID mapping on plans

Plans do **not** get Stripe products/prices auto-created. Admins configure existing Stripe objects on the plan record:

- `stripe_product_id` (`prod_...`)
- `stripe_monthly_price_id` (`price_...`)
- `stripe_yearly_price_id` (`price_...`)

These fields are editable in the admin UI's Plan editor, under a "Stripe mapping" section on the Details tab, and settable via the Plans API (see [api/central-v1.md](../api/central-v1.md#plans-stripe-fields)). `BillingService` reads `stripe_monthly_price_id` or `stripe_yearly_price_id` depending on the subscription's `billing_cycle` when building a checkout. Creating a plan with no Stripe IDs is valid — it simply can't be billed through Cashier until IDs are added.

## Webhook

| Method | Path | Notes |
|--------|------|-------|
| POST | `/stripe/webhook` | Outside `/api/central/v1`; path = `config('cashier.path')` + `/webhook` (default `stripe`) |

Handled by `App\Http\Controllers\Central\StripeWebhookController`, which extends Cashier's `WebhookController`. After Cashier's default handling, `customer.subscription.created|updated|deleted` events also trigger `BillingService::syncFromStripe()` for the tenant matched by `stripe_id`.

Signature verification runs through Cashier's `VerifyWebhookSignature` middleware whenever `STRIPE_WEBHOOK_SECRET` is configured.

## Environment variables

```env
STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
```

Optional Cashier config (see `config/cashier.php`): `CASHIER_PATH` (webhook path prefix, default `stripe`), `CASHIER_CURRENCY`.

The Settings → Billing tab in the admin UI surfaces read-only `stripe_enabled` / `stripe_webhook_configured` indicators so admins can see at a glance whether these env vars are set, without exposing secret values.

## What's not built yet

- No public Stripe Checkout Session endpoint — `BillingService` has the pricing-lookup logic, but nothing exposes it via a route yet
- No customer billing portal link
- `billing.manage` permission is seeded but not yet referenced by any controller/policy

## Screenshots

If this doc ever needs a screenshot (e.g. the Plan editor's Stripe mapping section, or the Settings → Billing tab), place the image under `SaaS-Docs/assets/billing/` and reference it with a relative path. Do not add placeholder/fake images — only real captures, and never commit screenshots into the Backend or Frontend repos.
