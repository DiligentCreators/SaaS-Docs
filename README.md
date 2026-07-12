# DC SaaS Platform Documentation

Canonical product and architecture documentation for the Diligent Creators SaaS platform.

## Current foundation scope

**Central Platform (Platform / Core) only — Phases 1–6 complete.**

In scope:

- Workspace (tenant) management: profile, archive/unarchive, soft delete, tabbed details page
- Platform users, roles, permissions matrix, invites
- **Module marketplace catalog** (Leads + Tasks today) with Features and dependency resolution
- **Workspace module subscriptions** — install, cancel, deactivate; default-included Leads/Tasks on create
- **Billing Engine** — gateway-agnostic invoicing, payments ledger, consolidated billing, proration
- **Financial ledger** — invoices, invoice items, payments, payment transactions (read APIs)
- **Impersonation** — audited admin sessions into workspaces
- Entitlements API for tenant app module loading
- System settings, dashboard (workspace + module subscription + revenue metrics)
- Central admin API + admin UI

Removed:

- Plans, plan tiers, plan modules/features/limits
- Product usage limits (e.g. lead caps)
- Plan-based `tenant_subscriptions`

## Explicit non-goals (still)

- Implementing tenant CRM/ERP business UIs (Leads/Tasks product screens)
- Seeding or building future modules (Invoices, Inventory, etc.)
- Automatic Stripe product/price creation
- Full invoices/payments write UI (ledger is API + engine; list/detail read in admin)
- Non-Stripe payment gateways beyond Manual (architecture reserved via `PaymentGatewayInterface`)

## Documentation map

| Document | Description |
|----------|-------------|
| [architecture/database.md](architecture/database.md) | ERD / table dictionary |
| [architecture/entitlements.md](architecture/entitlements.md) | Core Platform vs modules vs features |
| [api/central-v1.md](api/central-v1.md) | Central REST API reference |
| [admin-ui.md](admin-ui.md) | Admin console screen map |
| [billing/billing-engine.md](billing/billing-engine.md) | Billing Engine architecture |
| [billing/stripe-cashier.md](billing/stripe-cashier.md) | Cashier / Stripe driver notes |
| [workflows/tenant-provisioning.md](workflows/tenant-provisioning.md) | Workspace create → default modules |
| [testing/playwright.md](testing/playwright.md) | Central Playwright E2E suites |
| [CHANGELOG.md](CHANGELOG.md) | Delivery notes |

## Related repositories

- Backend: `SaaS-Backend` (Laravel 13 API)
- Frontend: `SaaS-Frontend` (React 19 central admin)
