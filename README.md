# DC SaaS Platform Documentation

Canonical product and architecture documentation for the Diligent Creators SaaS platform.

## Phase 1 scope

**Central Platform (Platform / Core) only.**

In scope:

- Tenant management: company/workspace profile, contact and address details, logo, notes, localization, status lifecycle, soft delete, **archive/unarchive**, and a dedicated tenant details page
- Platform users: central authentication, admin RBAC, **invites**, phone/avatar fields, last-login tracking, and per-user activity timeline
- Roles: CRUD, **delete**, **clone**, and a platform-wide **permissions matrix**
- Plans, Modules, Features, Plan Modules, **Plan Features** (per-plan feature overrides), Limit Definitions, Plan Limits
- Billing foundation: Laravel Cashier on the `Tenant` billable model, **manual Stripe product/price ID mapping** on Plans, Stripe webhook sync, tenant subscription lifecycle (cancel/resume/suspend) with an event trail
- System settings, expanded into sectioned groups (General, Localization, Mail, Branding, Security, Maintenance, Billing, Feature Flags)
- Real dashboard: tenant/user/subscription stats, MRR/ARR, growth trend, recent activity
- Central admin API + admin UI

In progress / not yet enforced:

- Usage counters exist (`tenant_usage_counters`) but are not yet metered against live product usage
- Stripe Checkout session creation exists as a service method but is not yet wired to a public endpoint

## Explicit non-goals

Do **not** implement in Phase 1:

- Tenant business/CRM modules (Leads, Contacts, Tasks, Pipelines, Calendar product features) and tenant-side product APIs/dashboards
- Tenant team members (separate from central platform users)
- **Automatic Stripe product/price creation** — Stripe IDs are mapped manually on Plans; the platform never calls Stripe to create products or prices
- Payment providers other than Stripe (Paddle, LemonSqueezy, etc.)
- Invoices, PDF receipts, and usage-metering enforcement

## Documentation map

| Document | Description |
|----------|-------------|
| [architecture/database.md](architecture/database.md) | ERD, table dictionary, unlimited semantics |
| [architecture/entitlements.md](architecture/entitlements.md) | Modules vs features vs limits; plan feature overrides; default plan & trial rules |
| [api/central-v1.md](api/central-v1.md) | Central REST API reference |
| [admin-ui.md](admin-ui.md) | Admin console screen map |
| [testing/playwright.md](testing/playwright.md) | Central Playwright E2E guide (suite lives in Frontend) |
| [billing/stripe-cashier.md](billing/stripe-cashier.md) | Cashier setup, manual Stripe ID mapping, webhook sync |
| [workflows/tenant-provisioning.md](workflows/tenant-provisioning.md) | Tenant create → plan/trial/subscription flow |
| [CHANGELOG.md](CHANGELOG.md) | Phase delivery notes |

## Related repositories

- Backend: `SaaS-Backend` (Laravel 13 API)
- Frontend: `SaaS-Frontend` (React 19 central admin)

Install and local setup remain in each repo's README. Product truth lives here.
