# DC SaaS Platform Documentation

Canonical product and architecture documentation for the Diligent Creators SaaS platform.

## Phase 1 scope

**Central Platform (Platform / Core) only.**

In scope:

- Tenant management (company, status, localization, trial placeholders)
- Platform users (central authentication and admin RBAC)
- Plans, Modules, Features, Plan Modules, Limit Definitions, Plan Limits
- System settings (default plan, registration, trial, maintenance)
- Tenant subscription placeholders (no payments)
- Central admin API + admin UI

## Explicit non-goals

Do **not** implement in Phase 1:

- CRM modules (Leads, Contacts, Tasks, Pipelines, Calendar product features)
- Tenant product APIs / tenant dashboards
- Tenant team members
- Billing integrations (Stripe, Paddle, LemonSqueezy)
- Invoices, payments, usage metering enforcement

## Documentation map

| Document | Description |
|----------|-------------|
| [architecture/database.md](architecture/database.md) | ERD, table dictionary, unlimited semantics |
| [architecture/entitlements.md](architecture/entitlements.md) | Modules vs features vs limits; default plan & trial rules |
| [api/central-v1.md](api/central-v1.md) | Central REST API reference |
| [admin-ui.md](admin-ui.md) | Admin console screen map |
| [CHANGELOG.md](CHANGELOG.md) | Phase delivery notes |

## Related repositories

- Backend: `SaaS-Backend` (Laravel 13 API)
- Frontend: `SaaS-Frontend` (React 19 central admin)

Install and local setup remain in each repo’s README. Product truth lives here.
