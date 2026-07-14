# Payment Gateway Architecture

Gateway-agnostic payment infrastructure for DC SaaS Central. The **Billing Engine talks only to `PaymentGatewayInterface`**. Stripe and Laravel Cashier live exclusively inside `StripeGateway`.

## Components

| Piece | Role |
|-------|------|
| `PaymentGatewayInterface` | Contract: checkout, refunds, webhooks, test connection, capabilities, currencies |
| `GatewayManager` | Resolves drivers by `payment_gateways.code`; binds encrypted config onto the driver |
| `BillingEngine` | Purchase / consolidate / handle normalized `GatewayEvent` — **no Stripe/Cashier imports** |
| `StripeGateway` | Cashier Checkout + Stripe SDK + webhook normalization |
| `ManualGateway` | Synchronous offline settlement |
| `PaymentGatewayService` | Admin enable/disable/default/config/mode/test/logs |
| `GatewayWebhookController` | `POST /webhooks/gateways/{code}` → driver → Billing Engine |
| `StripeWebhookController` | Cashier-compatible `/stripe/webhook` + Billing Engine dispatch |

## Architecture

```mermaid
flowchart TB
  subgraph AdminUI["Central Billing UI"]
    PG[Payment Gateways]
    INV[Invoices / Payments]
  end

  subgraph API["Central API"]
    PGC[PaymentGatewayController]
    IC[Invoice / Payment Controllers]
  end

  subgraph Engine["Billing Engine"]
    BE[BillingEngine]
    GM[GatewayManager]
    IF[PaymentGatewayInterface]
  end

  subgraph Drivers["Drivers"]
    MG[ManualGateway]
    SG[StripeGateway]
  end

  subgraph Providers["External"]
    Stripe[Stripe API / Cashier]
  end

  PG --> PGC
  INV --> IC
  PGC --> PaymentGatewayService
  IC --> BE
  BE --> GM
  GM --> IF
  IF --> MG
  IF --> SG
  SG --> Stripe
```

## Checkout / activation sequence

```mermaid
sequenceDiagram
  participant WS as Workspace / Admin
  participant BE as BillingEngine
  participant GM as GatewayManager
  participant D as PaymentGatewayInterface
  participant WH as Webhook
  participant LE as Ledger

  WS->>BE: purchaseModule(tenant, module)
  BE->>GM: driver(default)
  GM->>D: createCheckout(request)
  alt manual
    D-->>BE: succeeded
    BE->>LE: invoice + payment succeeded
    BE->>BE: activate subscription
  else external (e.g. Stripe)
    D-->>BE: pending + redirect URL
    WS->>D: complete checkout at provider
    WH->>D: parseWebhook(payload)
    D-->>BE: GatewayEvent(payment_succeeded, tenantId)
    BE->>LE: mark payment succeeded
    BE->>BE: activate pending subscription
  end
```

## ER (gateway-agnostic)

```mermaid
erDiagram
  PAYMENT_GATEWAYS ||--o{ PAYMENT_METHODS : stores
  PAYMENT_GATEWAYS ||--o{ PAYMENTS : processes
  PAYMENT_GATEWAYS ||--o{ PAYMENT_ATTEMPTS : attempts
  PAYMENT_GATEWAYS ||--o{ GATEWAY_LOGS : audits
  PAYMENT_GATEWAYS ||--o{ WEBHOOK_LOGS : receives
  PAYMENT_GATEWAYS ||--o{ PAYMENT_GATEWAY_MODULE_PRICES : maps
  MODULES ||--o{ PAYMENT_GATEWAY_MODULE_PRICES : priced_as
  TENANTS ||--o{ PAYMENT_METHODS : prefers
  TENANTS ||--o{ PAYMENTS : owns
  INVOICES ||--o{ PAYMENTS : settled_by
  PAYMENTS ||--o{ PAYMENT_TRANSACTIONS : trails
  PAYMENTS ||--o{ PAYMENT_ATTEMPTS : retries

  PAYMENT_GATEWAYS {
    string code UK
    string driver
    bool is_active
    bool is_default
    string mode
    text config "encrypted:array"
    json capabilities
    string webhook_status
  }

  PAYMENT_GATEWAY_MODULE_PRICES {
    int payment_gateway_id
    int module_id
    string billing_cycle
    string gateway_product_reference
    string gateway_price_reference
  }

  PAYMENT_METHODS {
    string tenant_id
    bool is_default
    text token "encrypted"
  }
```

> `payment_methods` **is** the workspace preferred-method table (`tenant_id` + `is_default`). No separate `workspace_payment_methods` table.

## Product mapping

Gateways with `checkout` + `subscriptions` capabilities (`requiresProductMapping()`) store provider product/price references in `payment_gateway_module_prices`. Modules never store Stripe (or any provider) IDs.

Admin API: `GET/PUT /payment-gateways/{id}/module-prices`. Central UI: **Billing → Payment Gateways → Product mapping**.

## Adding a new gateway

1. Implement `App\Billing\Drivers\{Name}Gateway extends AbstractGateway`.
2. Register in `config/core-platform.php` → `payment_gateways`.
3. Seed a `payment_gateways` row (`code`, `driver`, capabilities, currencies).
4. If the gateway needs provider price IDs, implement mapping via `payment_gateway_module_prices` (no Module schema changes).
5. Point provider webhooks to `POST /webhooks/gateways/{code}`.
6. **Do not** change `BillingEngine` or Module catalog fields.

## Related docs

- [Developer guide](payment-gateways-developer.md)
- [User guide](payment-gateways-user.md)
- [Production guide](payment-gateways-production.md)
- [Webhook reference](payment-gateways-webhooks.md)
- [Billing Engine](billing-engine.md)
- [Stripe / Cashier notes](stripe-cashier.md)
