# Changelog

## Central QA stabilization (Playwright)

Stabilized the Central Application with a full Playwright pass before further Tenant Application work.

**Fixed**

- Logout now revokes only the current Sanctum token (was deleting all tokens and breaking parallel E2E sessions)
- Dashboard growth/revenue series API keys aligned to frontend contract (`count`, `amount`) — removed chart `NaN` display
- Settings E2E opens the Billing tab before toggling trial flags
- Auth greeting assertion matches time-based welcome copy
- Roles cleanup searches before deleting the original role after clone

**Added (Playwright)**

- Module suites: marketplace, billing, impersonation, permissions, profile
- Per-module npm scripts (`test:e2e:marketplace`, `test:e2e:billing`, …)
- Smoke coverage for Marketplace route

**Docs**

- Updated `testing/playwright.md` and Frontend `docs/testing/PLAYWRIGHT.md`

---

## Modular foundation complete (Phases 1–6)

Delivered marketplace APIs, Billing Engine, impersonation, and the financial ledger on top of the module-licensing foundation.

**Added**

- Marketplace: `GET /marketplace/modules`, `GET /marketplace/modules/{module}` (published catalog, dependency hints, `?tenant_id=` install state)
- Module subscriptions: `GET /module-subscriptions`, show, `POST …/cancel`, `POST …/deactivate`; `POST /tenants/{tenant}/modules` (install)
- Billing Engine (`BillingEngine`, `GatewayManager`, `ManualGateway`, `StripeGateway`, `ProrationCalculator`)
- Consolidated billing: `php artisan billing:run-consolidated` (scheduled daily); one invoice per workspace billing cycle for all billable active modules
- Financial ledger tables + read APIs: `invoices`, `invoice_items`, `payments`, `payment_transactions`, `payment_gateways`, `payment_methods`, `billing_addresses`, `taxes`, `coupons`, `refunds`, `credit_notes`
- Impersonation: `impersonation_sessions` table; `POST /tenants/{tenant}/impersonate`, `POST /impersonation/{id}/end`
- Permissions: `module-subscriptions.*`, `invoices.*`, `payments.*`, `impersonation.*`

**Admin UI**

- Marketplace browse screen
- Tenant details tabs: Overview | Modules | Billing; impersonate action with reason prompt
- Module catalog form retains marketplace pricing fields

**Unchanged from prior entry**

- Plans removed; Leads + Tasks remain default-included, non-billable
- `workspace_module_subscriptions` is licensing SoT; Cashier/Stripe is a gateway driver only

---

## Module licensing foundation (Plans removed)

Replaced plan-based licensing with workspace module subscriptions.

**Removed**

- Plans, plan modules/features/limits, limit definitions, usage counters
- Plan-based `tenant_subscriptions` / `subscription_events`
- Central API/UI for plans, limits, and tenant-subscriptions
- `default_plan_id` system setting

**Added**

- Module catalog fields: `uuid`, pricing, `trial_days`, `version`, `status`, `is_default_included`, `is_billable`, Stripe price IDs
- `module_categories`, `module_dependencies`
- `workspace_module_subscriptions` + history
- Workspace billing profile: `billing_anchor_day`, `billing_cycle`, `proration_mode`, `next_billing_at`
- `EntitlementService` + `GET /tenants/{tenant}/entitlements`
- `config/core-platform.php` for always-on platform capabilities
- Catalog seed: **Leads** and **Tasks** only (included, non-billable)
- New workspaces auto-install Leads + Tasks (`source=included`, not cancellable by owners)

---

## Prior: Central SaaS Platform completion

See git history for the earlier plan-based Central Platform delivery notes (tenants, users, roles, Cashier scaffolding, dashboard). That licensing model has been superseded.
