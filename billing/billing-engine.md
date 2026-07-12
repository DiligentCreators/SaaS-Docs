# Billing Engine

Gateway-agnostic billing orchestration. Business licensing remains `workspace_module_subscriptions`; the engine handles purchase settlement, consolidated invoicing, and payment ledger writes.

See also: [Payment Gateway Architecture](payment-gateways.md).

## Components

| Piece | Role |
|-------|------|
| `BillingEngine` | Orchestrates install → invoice → payment → activation |
| `GatewayManager` | Resolves `PaymentGatewayInterface` drivers (`manual`, `stripe`) |
| `ManualGateway` | Synchronous settle (admin/manual payments) |
| `StripeGateway` | Checkout + webhook normalization to `GatewayEvent` (**only** Cashier/Stripe touchpoint) |
| `ProrationCalculator` | Mid-cycle purchase amount from workspace `proration_mode` |
| `InvoiceService` / `PaymentService` | Ledger CRUD |
| `PaymentGatewayService` | Admin gateway management |

Drivers implement `PaymentGatewayInterface`. Cashier tables are a Stripe mirror only — not the licensing or invoice SoT. `BillingEngine` must never import Stripe or Cashier.

## Proration modes

Set per workspace (`tenants.proration_mode`) or default via system setting.

| Mode | Mid-cycle purchase charge |
|------|---------------------------|
| `prorated` | Remaining days in current period ÷ period length × module price |
| `free_until_next` | `0` until next consolidated invoice |
| `none` | Full period price immediately |

## Purchase sequence (`purchaseModule`)

```
POST /tenants/{tenant}/modules  →  ModuleSubscriptionService::install
  ├─ non-billable / included → status=active immediately
  └─ billable → status=pending
       ├─ manual gateway → draft invoice (proration line) → open → mark payment succeeded → activate
       └─ other gateway → createCheckout via interface → return redirect URL; webhook activates on success
```

## Consolidated billing sequence

Command: `php artisan billing:run-consolidated` (scheduled daily in `routes/console.php`).

```
For each tenant where next_billing_at <= now:
  1. Collect active, billable workspace_module_subscriptions
  2. Skip if none
  3. Create draft invoice with one line per subscription (type=module)
  4. Open invoice
  5. Record payment; auto-succeed on manual gateway only
  6. Advance next_billing_at by one month (anchor day 1–28)
```

## Webhooks

- `POST /webhooks/gateways/{code}` → driver `parseWebhook` → `BillingEngine::handleGatewayEvent`
- `POST /stripe/webhook` → Cashier handlers + same Billing Engine dispatch

Tenant resolution (provider-agnostic; no Stripe/Cashier columns in the engine):

1. `GatewayEvent.tenantId` (set by the driver when the customer map resolves)
2. `providerSubscriptionId` → `workspace_module_subscriptions`
3. `meta.payment_id` → `payments` (covers `payment_failed` when no customer → tenant map exists)

## Default gateway

`default_payment_gateway` system setting → `payment_gateways.is_default` → `manual` (see `config/core-platform.php`).
