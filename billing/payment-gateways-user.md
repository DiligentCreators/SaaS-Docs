# Payment Gateways — User Guide

Central admins manage payment providers under the top-level **Billing** menu (not Settings).

## Where to go

| Menu item | Purpose |
|-----------|---------|
| Billing Dashboard | Snapshot of invoices, payments, and default gateway |
| Invoices / Payments | Platform ledgers |
| Payment Gateways | Enable, configure, test, and monitor providers |
| Transactions / Refunds / Payment Methods / Coupons / Taxes / Billing Logs | Reserved Billing screens (expanding) |

Settings → Billing still holds invoice prefix / trial toggles — **not** gateway credentials.

## Managing a gateway

1. Open **Billing → Payment Gateways**.
2. Use row actions:
   - **View details** — capabilities, currencies, webhook status, recent logs
   - **Configure** — enter publishable/secret/webhook keys (Stripe)
   - **Product mapping** — map catalog modules to provider product/price references (Stripe and other drivers that need them). Module create/edit does **not** collect provider IDs.
   - **Test connection** — verifies credentials against the provider
   - **Set as default** — used for new checkouts / consolidated billing
   - **Enable / Disable** — disabled gateways cannot process (cannot disable the current default)
3. Switch **Sandbox / Live** from the details dialog.

Secrets are write-only in the UI. After save, the screen only shows whether a secret is configured.

## Defaults

The platform default gateway drives `BillingEngine` checkout selection. Changing default updates the `default_payment_gateway` system setting and the gateway’s `is_default` flag.
