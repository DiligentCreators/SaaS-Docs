# Billing Engine

Gateway-agnostic billing orchestration. Business licensing remains `workspace_module_subscriptions`; the engine handles purchase settlement, consolidated invoicing, and payment ledger writes.

## Components

| Piece | Role |
|-------|------|
| `BillingEngine` | Orchestrates install → invoice → payment → activation |
| `GatewayManager` | Resolves `PaymentGatewayInterface` drivers (`manual`, `stripe`) |
| `ManualGateway` | Synchronous settle (admin/manual payments) |
| `StripeGateway` | Checkout + webhook normalization to `GatewayEvent` |
| `ProrationCalculator` | Mid-cycle purchase amount from workspace `proration_mode` |
| `InvoiceService` / `PaymentService` | Ledger CRUD |

Drivers implement `PaymentGatewayInterface`. Cashier tables are a Stripe mirror only — not the licensing or invoice SoT.

## Proration modes

Set per workspace (`tenants.proration_mode`) or default via system setting.

| Mode | Mid-cycle purchase charge |
|------|---------------------------|
| `prorated` | Remaining days in current period ÷ period length × module price |
| `free_until_next` | `0` until next consolidated invoice |
| `none` | Full period price immediately |

## Purchase sequence (`purchaseModule`)

Used when a billable module is installed (future paid catalog entries).

```
POST /tenants/{tenant}/modules  →  ModuleSubscriptionService::install
  ├─ non-billable / included → status=active immediately
  └─ billable → status=pending
       ├─ manual gateway → draft invoice (proration line) → open → mark payment succeeded → activate
       └─ stripe gateway → createCheckout → return redirect URL; webhook activates on success
```

`install` on the controller calls `ModuleSubscriptionService` directly (no charge). `BillingEngine::purchaseModule` is the charge path for billable pending subscriptions.

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

One invoice per workspace per billing cycle — not per module.

## Webhooks

`POST /stripe/webhook` → `StripeWebhookController` → `BillingService::syncFromStripe()` (Cashier mirror) + `BillingEngine::handleGatewayEvent()` (activate pending subs, settle/fail payments, gateway cancellations).

## Default gateway

`default_payment_gateway` system setting → `payment_gateways.is_default` → `manual` (see `config/core-platform.php`).
