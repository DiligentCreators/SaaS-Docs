# Payment Gateway Webhooks

## Ingress points

| URL | Controller | Notes |
|-----|------------|-------|
| `POST /webhooks/gateways/{code}` | `GatewayWebhookController` | Gateway-agnostic extension point |
| `POST /stripe/webhook` | `StripeWebhookController` | Extends Cashier; also dispatches Billing Engine |

## Flow

```mermaid
sequenceDiagram
  participant P as Provider
  participant WH as Webhook Controller
  participant D as Driver parseWebhook
  participant LOG as webhook_logs
  participant BE as BillingEngine

  P->>WH: POST payload + signature headers
  WH->>LOG: status=received
  WH->>D: parseWebhook(payload, signature)
  D-->>WH: GatewayEvent
  WH->>BE: handleGatewayEvent(event)
  WH->>LOG: status=processed|ignored|failed
```

## Normalized events

`GatewayEvent` types:

- `payment_succeeded` / `payment_failed`
- `subscription_created` / `subscription_updated` / `subscription_cancelled`
- `unsupported` (logged as ignored)

Drivers should populate `tenantId` when resolvable so `BillingEngine` stays provider-agnostic. If not, include `meta.payment_id` (and/or `providerSubscriptionId`) so the engine can still resolve the workspace for `payment_failed` without a customer map.

## Stripe events handled for billing activation

- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.*` (cancel → deactivate licensing)

Cashier still handles its own mirror tables on `/stripe/webhook`.

## Creem events handled for billing activation

Signature header: `creem-signature` (HMAC-SHA256 of raw body).

- `subscription.paid` / `checkout.completed` → activate pending modules
- `subscription.active` / `subscription.update` → link provider subscription id
- `subscription.canceled` / `subscription.expired` → cancel module licensing
- `subscription.past_due` → `payment_failed`
- `refund.created` → ignored (`unsupported`) after signature verification

See [Creem gateway](creem.md) for the full event matrix.

## Local development

```bash
stripe listen --forward-to https://your-app.test/stripe/webhook
# or
stripe listen --forward-to https://your-app.test/webhooks/gateways/stripe

# Creem: forward sandbox webhooks (ngrok / Herd) to:
# https://your-app.test/webhooks/gateways/creem
```

Use the CLI webhook signing secret for local verification (`whsec_…` for Stripe; Creem dashboard webhook secret for Creem).
