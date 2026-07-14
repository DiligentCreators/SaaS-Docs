# Creem Payment Gateway

Creem is a second payment provider (Merchant of Record) that plugs into the existing gateway-agnostic billing stack. Business logic stays in `BillingEngine` / `ModuleSubscriptionService`; Creem only translates between Creem’s REST API and `PaymentGatewayInterface`.

Stripe remains fully supported and unchanged. Drivers never share implementation.

## Architecture

```
BillingEngine → GatewayManager → PaymentGatewayInterface
                                      ├── ManualGateway
                                      ├── StripeGateway
                                      └── CreemGateway  (+ CreemClient, CreemWebhookVerifier)
```

Do **not** add `creem_*` columns. Creem customer ids live in provider-neutral `tenant_gateway_customers.customer_reference`. Product/price mapping uses `payment_gateway_module_prices.gateway_*_reference`.

## Installation

1. Pull backend changes and run migrations:

```bash
php artisan migrate
php artisan db:seed --class=Database\\Seeders\\Central\\PaymentGatewaySeeder
```

2. Configure credentials (env fallbacks **or** Central admin UI).

3. Map each billable module to a Creem Product ID under **Billing → Payment Gateways → Product mapping**.

4. Point Creem webhooks to `POST /webhooks/gateways/creem`.

5. Enable Creem and optionally set it as the default gateway (only one default).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `CREEM_ENABLED` | Seed row starts active when `true` |
| `CREEM_ENV` | `sandbox` \| `live` (seeded `mode`) |
| `CREEM_API_URL` | Optional override (default test/live Creem hosts) |
| `CREEM_SECRET_KEY` | API key fallback (`x-api-key`) |
| `CREEM_WEBHOOK_SECRET` | HMAC secret for `creem-signature` |
| `CREEM_TIMEOUT` / `CREEM_CONNECT_TIMEOUT` | HTTP timeouts |

Prefer storing secrets in encrypted `payment_gateways.config` via the admin UI (`secret_key`, `webhook_secret`). Env values are fallbacks when the row is empty.

Config file: `config/creem.php`.

## Sandbox setup

1. Create a Creem test account → **Developers → API Keys** (`ck_test_…`).
2. Create recurring products in the Creem dashboard; copy each `prod_…` id.
3. In Central admin: enable Creem, mode **sandbox**, paste Secret key + Webhook secret.
4. Product mapping: put `prod_…` in **Product reference** (Price reference may repeat the same id).
5. Register webhook URL (ngrok / Herd share):

```text
https://your-app.test/webhooks/gateways/creem
```

Subscribe at least: `checkout.completed`, `subscription.active`, `subscription.paid`, `subscription.canceled`, `subscription.expired`, `subscription.past_due`, `subscription.update`, `subscription.trialing`, `subscription.paused`, `subscription.scheduled_cancel`, `refund.created`.

## Production setup

1. Switch Creem dashboard to live; create live API key + webhook secret.
2. Admin: mode **live**, paste live credentials (do not mix test keys).
3. Webhook URL must be HTTPS public: `https://api.yourdomain.com/webhooks/gateways/creem`.
4. Remap products to live `prod_…` ids.
5. Set Creem as default only after a successful **Test connection** and a sandbox end-to-end purchase.

## Webhook configuration

| Item | Value |
|------|-------|
| Endpoint | `POST /webhooks/gateways/{code}` with `code=creem` |
| Signature header | `creem-signature` |
| Algorithm | HMAC-SHA256 over **raw** body, hex digest |
| CSRF | Excepted (`webhooks/gateways/*`) |
| Idempotency | `webhook_logs.provider_event_id` unique |

Invalid signatures → `400` and a failed webhook log (no payload retention of attacker bodies).

## Supported events & mapping

| Creem event | Normalized `GatewayEvent` | Engine effect |
|-------------|---------------------------|---------------|
| `checkout.completed` | `payment_succeeded` | Settle payment + activate pending module |
| `subscription.paid` | `payment_succeeded` | Preferred activation / renewal signal |
| `subscription.active` | `subscription_created` | Link `provider_subscription_id` |
| `subscription.trialing` | `subscription_created` | Link subscription |
| `subscription.update` | `subscription_updated` | Link / sync subscription id |
| `subscription.paused` | `subscription_updated` | Sync only |
| `subscription.scheduled_cancel` | `subscription_updated` | Sync only (access until period end) |
| `subscription.canceled` | `subscription_cancelled` | Cancel module + forget entitlements |
| `subscription.expired` | `subscription_cancelled` | Cancel module |
| `subscription.past_due` | `payment_failed` | Mark payment failed |
| `refund.created` | `unsupported` | Logged ignored (dashboard refunds) |

Invoice-ish fields are attached on `GatewayEvent.meta` (`invoice_reference`, currency, tax, period, paid_at) without provider-specific DB columns.

## Differences vs Stripe

| Topic | Stripe | Creem |
|-------|--------|-------|
| SDK | Cashier + Stripe PHP SDK | Laravel HTTP client (`CreemClient`) |
| Customer store | `tenants.stripe_id` | `tenant_gateway_customers.customer_reference` |
| Checkout price | Stripe Price `price_…` | Creem Product `prod_…` |
| Activation webhook | `invoice.payment_succeeded` | `subscription.paid` / `checkout.completed` |
| Dual ingress | `/stripe/webhook` + generic | Generic only |
| Programmatic refunds | Stripe Refunds API | Dashboard + `refund.created` webhook |
| Customer portal | Cashier billing portal | `POST /v1/customers/billing` → `createPortalSession()` |

## Checkout return sync (local / missed webhooks)

Creem redirects to `/marketplace?checkout=success&module={slug}` and appends `checkout_id`. The SPA calls:

`POST /api/tenant/v1/marketplace/modules/{id}/confirm-checkout`

which retrieves the Creem checkout and activates the pending module when status is `completed`. **Complete subscription** also syncs existing checkout attempts before creating a new session — so a paid-but-pending module no longer opens a second Creem checkout.

Webhooks remain the primary production path; return sync is the safety net when the webhook cannot reach local/dev.

## Local development

```bash
# Optional env fallbacks
CREEM_ENABLED=true
CREEM_ENV=sandbox
CREEM_SECRET_KEY=ck_test_…
CREEM_WEBHOOK_SECRET=…

php artisan migrate
php artisan db:seed --class=Database\\Seeders\\Central\\PaymentGatewaySeeder
```

Forward Creem sandbox webhooks with ngrok to `/webhooks/gateways/creem`.

Run tests (no network):

```bash
php artisan test --compact tests/Feature/Central/Billing/CreemGatewayTest.php
php artisan test --compact tests/Feature/Central/Billing/CreemWebhookTest.php
```

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Checkout fails “mapping missing” | Product mapping `prod_…` for the default gateway |
| Mode mismatch | Sandbox mode with live keys (or reverse) |
| Signature failures | Raw body HMAC; header name `creem-signature`; webhook secret matches dashboard |
| Tenant not resolved | Metadata must include `tenant_id` / payment ids, or customer row in `tenant_gateway_customers` |
| Module not activating | Wait for `subscription.paid` (not only `subscription.active`); confirm webhook log `processed` |
| Portal fails | Customer must exist (`syncCustomer` / prior checkout) |

## Related

- [Payment gateway architecture](payment-gateways.md)
- [Developer guide](payment-gateways-developer.md)
- [Webhooks](payment-gateways-webhooks.md)
- [Billing Engine](billing-engine.md)
- [Stripe / Cashier](stripe-cashier.md)
