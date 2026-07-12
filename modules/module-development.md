# Module Development Standard

Every business capability on this platform is a **module**. Modules are licensed via the marketplace catalog and authorized via Spatie permissions. They are **not** PHP packages or plugins.

**Reference implementation:** [Leads](leads.md)

## Guides

| Audience | Document |
|----------|----------|
| Engineers | [module-development-developer.md](module-development-developer.md) |
| Production / ops | [module-development-production.md](module-development-production.md) |
| Architecture freeze | [../architecture/platform-freeze.md](../architecture/platform-freeze.md) |

## Principles

1. **Consistency over abstraction** — flat Laravel layout; register through existing catalog, permissions, middleware, nav, and settings.
2. **Licensing ≠ authorization** — `module:{slug}` then `can:{slug}.{action}`.
3. **Mirror Leads** — Tasks, Invoices, Inventory, Purchases, HR, Payroll, Accounting, Assets, Projects must follow the same structure.
4. **No shortcuts** — every module ships backend, frontend, tests, docs, and CHANGELOG.

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
