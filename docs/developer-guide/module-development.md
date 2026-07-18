# Module Development Standard

Every business capability on this platform is a **module**. Modules are licensed via the marketplace catalog and authorized via Spatie permissions. They are **not** PHP packages or plugins.

**Reference implementation:** [Leads](/user-guide/leads-overview)

## Guides

| Audience | Document |
|----------|----------|
| Engineers | [module-development-developer.md](/developer-guide/module-development-guide) |
| Production / ops | [module-development-production.md](/deployment/module-development) |
| Architecture freeze | [../architecture/platform-freeze.md](/getting-started/platform-freeze) |
| Module architecture | [module-architecture.md](/architecture/module-architecture) |
| Module dependencies | [module-dependencies.md](/architecture/module-dependencies) |
| Module licensing | [module-licensing.md](/architecture/module-licensing) |
| Notification contracts | [notification-architecture-contract.md](/developer-guide/notification-architecture-contract) |

## Principles

1. **Consistency over abstraction** — flat Laravel layout; register through existing catalog, permissions, middleware, nav, and settings.
2. **Licensing ≠ authorization** — `module:{slug}` then `can:{slug}.{action}`.
3. **Mirror Leads** — Tasks, Communication Templates, Invoices, Inventory, Purchases, HR, Payroll, Accounting, Assets, Projects must follow the same licensing + permission + UI structure (Communication Templates is additionally a cross-cutting consumer pattern).
4. **No shortcuts** — every module ships backend, frontend, tests, docs, and CHANGELOG.
5. **Migrate-only production** — new default modules and permissions ship as data migrations; never production `db:seed` for catalog/RBAC.
6. **Self-contained modules** — each module owns its migrations, models, services, routes, UI, permissions, settings, docs, and tests; communicate through contracts/services only. See [Module Architecture](/architecture/module-architecture).
7. **Declare dependencies** — required vs optional; free vs billable. See [Module Dependencies](/architecture/module-dependencies).
8. **Independent licensing** — design every module so it can be included, free, or billable. See [Module Licensing](/architecture/module-licensing).

## Cross-cutting patterns (Sprint 2+)

- **Dashboard widgets** — register via `DashboardWidgetService` on `GET /dashboard`; gate by module entitlement, permission, and assignee scope. Do not add a Calendar widget until the Calendar module exists.
- **Notifications** — Follow the frozen [Notification Architecture Contract](/developer-guide/notification-architecture-contract): versioned payload, route descriptors, NotificationBatch aggregation, Reverb/Echo realtime, modular SPA registry. Due/overdue work uses `crm:send-due-notifications`. Retention: `notifications:prune`.
- **Assignee scoping** — reuse `ScopesToAssignee` so users without `{slug}.assign` only see their own records.

## Definition of Done

A module is complete only when:

- [ ] Backend implementation complete (models, migrations, services, controllers, requests, resources, policies, events, notifications)
- [ ] Frontend complete (pages, forms, tables, filters, dialogs/drawers, loading/empty/error states)
- [ ] Permissions enforced (Spatie + UI gates)
- [ ] Module licensing enforced (`module:` middleware + SPA nav)
- [ ] Tenant isolation verified
- [ ] Audit logging (`PlatformAuditService`) implemented
- [ ] Activity logging (Spatie `LogsActivity` + domain timeline where applicable)
- [ ] Notifications implemented where applicable
- [ ] Pest tests pass (CRUD, authz, validation, tenant isolation, module gate)
- [ ] Playwright suite passes (`test:e2e:{slug}`)
- [ ] Manual browser QA passes
- [ ] Developer / User / Production guides updated
- [ ] API + database docs updated
- [ ] CHANGELOG updated
- [ ] No console errors; no failed network requests; build passes
- [ ] No platform refactor required before the next module
