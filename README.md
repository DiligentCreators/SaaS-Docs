# DC SaaS Platform Documentation

Canonical product and architecture documentation for the Diligent Creators SaaS platform.

## Architecture freeze

The platform foundation is **locked** as of **[v1.1.0-platform](releases/v1.1.0-platform.md)** (Production Ready). See [architecture/platform-freeze.md](architecture/platform-freeze.md).

New business capability ships as **modules** following the [Module Development Standard](modules/module-development.md). **Leads** and **Tasks** are the canonical reference implementations; later modules must mirror them.

Product sequencing (CRM → Sales → Billing → … → ERP) is defined in the [Product Roadmap](product-roadmap.md).

## Current foundation scope

**Central Platform + Tenant Authentication + shared UI + Module Development Standard.**

In scope:

- Workspace (tenant) management: profile, archive/unarchive, soft delete, tabbed details page
- Platform users, roles, permissions matrix, invites
- **Tenant authentication** — register, login, forgot/reset password, logout
- **Shared AppLayout shell** for Central and Tenant (sidebar, topbar, breadcrumbs, command palette)
- **Tenant Application** — widget dashboard, in-app notifications (polled), workspace Settings (branding/mail), shared Profile, **Leads** (Kanban/table) and **Tasks** (board/list) CRM modules
- **Tenant branding & configuration** — hierarchy Tenant → Central → system; isolated asset storage; SMTP fallback
- **Tenant RBAC** — workspace-isolated users, roles, permissions; module + permission gating
- **Central auth under `/central/*`** with isolated SPA sessions from tenant auth
- **Module marketplace catalog** (Leads + Tasks today) with dependency resolution
- **Workspace module subscriptions** — install, cancel, deactivate; default-included Leads/Tasks on create
- **Billing Engine** — gateway-agnostic invoicing, payments ledger, consolidated billing, proration
- **Financial ledger** — invoices, invoice items, payments, payment transactions (read APIs)
- **Impersonation** — audited admin sessions into workspaces (token handoff reserved)
- Entitlements API (`{ core, modules }`) for tenant app module loading — licensing only; Spatie handles authorization
- System settings (runtime-applied identity, localization, SMTP, branding, security, tenant-only maintenance), dashboard (workspace + module subscription + revenue metrics)
- Central admin API + admin UI

Removed:

- Plans, plan tiers, plan modules/features/limits
- Features catalog (module → feature entitlement layer)
- Product usage limits (e.g. lead caps)
- Plan-based `tenant_subscriptions`

## Explicit non-goals (still)

- Building future product modules before they are scheduled (Invoices, Inventory, etc. follow the Leads/Tasks blueprint)
- Automatic Stripe product/price creation
- Full invoices/payments write UI (ledger is API + engine; list/detail read in admin)
- Non-Stripe payment gateways beyond Manual (architecture reserved via `PaymentGatewayInterface`)
- Central → Tenant impersonation token exchange (architecture prepared; not shipped)
- Divergent Central vs Tenant shell redesigns (foundation stays shared)
- Laravel Modules packages / plugin auto-discovery

## Documentation map

| Document | Description |
|----------|-------------|
| [product-roadmap.md](product-roadmap.md) | CRM → ERP module phases and delivery order |
| [architecture/platform-freeze.md](architecture/platform-freeze.md) | Locked foundation; when refactoring is allowed |
| [modules/module-development.md](modules/module-development.md) | Module Development Standard + Definition of Done |
| [modules/leads.md](modules/leads.md) | Leads reference module guides |
| [modules/tasks.md](modules/tasks.md) | Tasks module guides |
| [api/tenant-v1-leads.md](api/tenant-v1-leads.md) | Tenant Leads REST API |
| [api/tenant-v1-tasks.md](api/tenant-v1-tasks.md) | Tenant Tasks REST API |
| [api/tenant-v1-notifications.md](api/tenant-v1-notifications.md) | Tenant in-app notifications API |
| [api/tenant-v1-dashboard.md](api/tenant-v1-dashboard.md) | Tenant dashboard + widget registry |
| [architecture/database.md](architecture/database.md) | ERD / table dictionary |
| [architecture/object-storage.md](architecture/object-storage.md) | Wasabi / S3 uploads, migration command, local vs production disks |
| [architecture/frontend-build-artifacts.md](architecture/frontend-build-artifacts.md) | Frontend CI/CD → `build-artifacts` branch + GitHub artifacts |
| [architecture/entitlements.md](architecture/entitlements.md) | Module licensing vs Spatie authorization |
| [architecture/shared-ui.md](architecture/shared-ui.md) | Shared design system & layout reuse |
| [ui/shared-layout.md](ui/shared-layout.md) | Shared layout guides index |
| [ui/shared-layout-developer.md](ui/shared-layout-developer.md) | Shell, nav, and page structure for engineers |
| [ui/tenant-application-user.md](ui/tenant-application-user.md) | Tenant navigation & dashboard overview |
| [authentication/authentication-developer.md](authentication/authentication-developer.md) | Auth architecture, guards, reset flow |
| [authentication/authentication-user.md](authentication/authentication-user.md) | Register, login, forgot/reset guides |
| [authentication/authentication-production.md](authentication/authentication-production.md) | Mail, reset, session, security ops |
| [api/central-v1.md](api/central-v1.md) | Central REST API reference |
| [admin-ui.md](admin-ui.md) | Admin console screen map |
| [billing/billing-engine.md](billing/billing-engine.md) | Billing Engine architecture |
| [billing/payment-gateways.md](billing/payment-gateways.md) | Payment gateway architecture & guides |
| [settings/settings.md](settings/settings.md) | Central Application settings (user / developer / production) |
| [settings/tenant-settings.md](settings/tenant-settings.md) | Tenant workspace branding & configuration hierarchy |
| [authorization/tenant-rbac.md](authorization/tenant-rbac.md) | Tenant users, roles, permissions (RBAC) |
| [billing/stripe-cashier.md](billing/stripe-cashier.md) | Cashier / Stripe driver notes |
| [workflows/tenant-provisioning.md](workflows/tenant-provisioning.md) | Workspace create → default modules |
| [testing/playwright.md](testing/playwright.md) | Playwright E2E suites (Central + Tenant) |
| [development/local-demo-data.md](development/local-demo-data.md) | Local demo CRM seeding (users, leads, tasks) |
| [releases/v1.1.0-platform.md](releases/v1.1.0-platform.md) | Official Platform Foundation release |
| [CHANGELOG.md](CHANGELOG.md) | Delivery notes |

## Related repositories

- Backend: `SaaS-Backend` (Laravel 13 API)
- Frontend: `SaaS-Frontend` (React 19 — Central admin + Tenant Application shell)
