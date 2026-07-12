# Payment Gateways — Developer Guide

## Contracts

```php
use App\Billing\Contracts\PaymentGatewayInterface;
use App\Billing\GatewayManager;

$driver = app(GatewayManager::class)->driver('stripe'); // or default
$driver->createCheckout($request);
$driver->parseWebhook($payload, $signature);
$driver->testConnection();
$driver->capabilities();
$driver->supportedCurrencies();
```

Never import `Stripe\*`, `Laravel\Cashier\*`, or `StripeGateway` from `BillingEngine`, services outside `App\Billing\Drivers`, or controllers other than Stripe-specific webhook adapters.

## Encrypted credentials

`payment_gateways.config` uses Eloquent `encrypted:array`. API resources return **redacted** config:

- Non-secret keys (e.g. `publishable_key`) returned as plain values
- Secret keys (`secret_key`, `webhook_secret`, `*_secret`) returned as `{ "configured": true|false }`

Config updates merge; empty secret fields mean “leave unchanged”. Changes are written to `gateway_logs` and Spatie activity log (`payment_gateway.config_updated`) with **changed key names only**.

## Admin API (Central v1)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/payment-gateways` | List |
| GET | `/payment-gateways/{id}` | Detail (redacted config) |
| POST | `…/enable` / `…/disable` | Toggle |
| POST | `…/default` | Platform default |
| PUT | `…/config` | Credentials |
| PUT | `…/mode` | `sandbox` \| `live` |
| POST | `…/test-connection` | Driver connectivity probe |
| GET | `…/webhook-status` | Health + endpoint hint |
| GET | `…/logs` | Gateway operational logs |
| GET | `…/webhook-logs` | Inbound webhook audit |
| GET | `…/capabilities` | Capabilities + currencies |

Permissions: `payment-gateways.list|read|update` (or `billing.manage`).

## Webhooks

- Generic: `POST /webhooks/gateways/{code}` → `GatewayWebhookController`
- Stripe + Cashier mirror: `POST /stripe/webhook` → `StripeWebhookController`

Both normalize via `PaymentGatewayInterface::parseWebhook()` and call `BillingEngine::handleGatewayEvent()`. Drivers should set `GatewayEvent::$tenantId` when they can resolve the workspace, so the engine never queries provider-specific columns. When `tenantId` is missing, `BillingEngine::resolveTenant` also tries `providerSubscriptionId` and `meta.payment_id` (needed for `payment_failed` without a customer map).

CSRF exceptions: `stripe/*`, `webhooks/gateways/*`.

## Schema notes

| Table | Purpose |
|-------|---------|
| `payment_gateways` | Registry + encrypted config + mode + webhook health |
| `payment_methods` | Workspace saved methods / preferred method |
| `payments` / `payment_transactions` | Ledger |
| `payment_attempts` | Checkout/charge attempts |
| `gateway_logs` | Admin/driver operational events |
| `webhook_logs` | Inbound webhook audit |

No gateway-specific tables.

## Tests

```bash
php artisan test --compact tests/Feature/Central/Billing/PaymentGatewayManagementTest.php
php artisan test --compact tests/Feature/Central/Billing/PaymentGatewayIsolationTest.php
php artisan test --compact tests/Feature/Central/Billing/GatewayWebhookRoutingTest.php
```

Architecture tests assert `BillingEngine` and `GatewayManager` do not reference Stripe/Cashier.
