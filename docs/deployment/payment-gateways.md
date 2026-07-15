# Payment Gateways — Production Guide

## Checklist

1. Seed gateways: `PaymentGatewaySeeder` (manual + stripe).
2. In Central UI, configure Stripe **live** credentials (or set encrypted config via API).
3. Set Stripe as default only after a successful **Test connection**.
4. Register webhooks in the Stripe Dashboard:
   - Prefer `https://{APP_URL}/stripe/webhook` for Cashier subscription mirror + Billing Engine
   - Or `https://{APP_URL}/webhooks/gateways/stripe` for Billing Engine only
5. Store the webhook signing secret in gateway config (`webhook_secret`) and/or `STRIPE_WEBHOOK_SECRET` for Cashier middleware.
6. Confirm CSRF exclusions remain for `stripe/*` and `webhooks/gateways/*`.
7. Monitor **webhook status** and `webhook_logs` after go-live.

## Environment fallbacks

`StripeGateway` prefers encrypted `payment_gateways.config.secret_key`. If absent, it falls back to Cashier env (`STRIPE_SECRET`). Production should treat DB-encrypted credentials as source of truth so credentials can rotate without redeploying env.

## Security

- Never log secret values — only changed key names.
- Never return secrets from API resources.
- Prefer sandbox mode until connection tests pass.
- Rotate webhook secrets after any suspected leak; update both Stripe Dashboard and gateway config.

## Ops signals

| Signal | Source |
|--------|--------|
| `payment_gateways.webhook_status` | `ok` / `failing` / `unknown` |
| `webhook_last_received_at` | Last successful ingress |
| `gateway_logs` | Config/mode/test events |
| `webhook_logs` | Per-event processing result + timing |
