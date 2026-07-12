# Stripe / Cashier notes

Cashier remains installed on the `Tenant` billable model as the **Stripe gateway driver** — not the business source of truth.

## Layering

| Layer | Source of truth |
|-------|-----------------|
| Licensing | `workspace_module_subscriptions` |
| Invoicing / payments | `invoices`, `payments` (Billing Engine ledger) |
| Stripe mirror | Cashier `subscriptions` / `subscription_items` on `Tenant` |
| Credentials | Encrypted `payment_gateways.config` (fallback: env `STRIPE_*`) |

See [billing/billing-engine.md](billing-engine.md) and [payment-gateways.md](payment-gateways.md).

## Current state

- `Tenant` uses Cashier's `Billable` trait (`stripe_id`, `pm_type`, `pm_last_four` are custom columns)
- `StripeGateway` implements `PaymentGatewayInterface` (checkout, refunds, webhook normalization, testConnection)
- `ManualGateway` is the default driver for synchronous settle
- `GatewayManager` resolves drivers from `payment_gateways` table + `config/core-platform.php`
- Webhooks:
  - `POST /stripe/webhook` → Cashier + Billing Engine
  - `POST /webhooks/gateways/stripe` → Billing Engine only

## Manual price mapping

Modules may store `stripe_product_id`, `stripe_monthly_price_id`, `stripe_yearly_price_id`. The platform never auto-creates Stripe products/prices.

## When Stripe is used

- Default gateway = `stripe`: billable module installs return a Checkout redirect; webhook activates pending subscriptions and settles payments
- Default gateway = `manual`: purchases and consolidated runs mark payments succeeded immediately

Cashier subscription rows stay in sync for Stripe-backed workspaces but do not drive entitlements.
