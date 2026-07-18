# Module Architecture

SaleOS follows a **modular architecture**. Every business capability must be developed as an **independent module**.

This document is the required convention for all future development. It establishes ownership boundaries and communication rules so the platform can grow into a full ERP without redesigning the frozen foundation.

> **Scope**
>
> This is an architectural convention and development guideline. It does not change existing source code, billing logic, marketplace implementation, or database schema by itself. Implement new modules against this standard when they are built.

## What is a module?

A module is a self-contained business domain (for example Leads, Tasks, Calendar, or Meetings) that:

- Is registered in the marketplace catalog
- Is licensed at the workspace level (`module:{slug}`)
- Is authorized with Spatie permissions (`can:{slug}.{action}`)
- Ships backend, frontend, tests, and documentation together

Modules are **not** PHP packages, Laravel Modules plugins, or auto-discovered plugins. Code lives in the existing flat application layout. See the [Module Development Standard](/developer-guide/module-development).

## Ownership — what each module owns

Each module should own its own:

| Concern | Examples |
|---------|----------|
| Database migrations | Tables, columns, and indexes for that domain |
| Models | Eloquent models with tenant scoping |
| Services | Domain services and business workflows |
| API routes | Tenant (and, when needed, central) API endpoints |
| Frontend pages / components | List pages, forms, drawers, module-specific UI |
| Permissions | Spatie permission vocabulary for the module |
| Settings | Module-specific settings keys when applicable |
| Documentation | User, developer, API, deployment, and CHANGELOG updates |
| Tests | Pest feature tests and Playwright `test:e2e:{slug}` |
| Seeders | Local/demo seeders when applicable (production catalog/RBAC uses data migrations) |

If a capability does not fit cleanly inside one module’s ownership, treat that as a design smell: either expand the correct module’s boundary or introduce a dedicated module.

## Boundaries and communication

Modules must **not** contain another module’s business logic.

| Allowed | Not allowed |
|---------|-------------|
| Call another module through a **contract** or **service** API | Copy or embed another module’s domain rules |
| Depend on shared platform services (auth, tenancy, audit, settings) | Reach into another module’s private models/controllers for business decisions |
| Emit domain events that other modules may listen to | Hard-code unrelated module UI or permission checks inside your module |
| Declare an explicit dependency (see [Module Dependencies](./module-dependencies)) | Assume another module is always installed without declaring it |

Cross-module integration should go through well-defined services, contracts, events, or documented APIs — never through informal coupling.

## Relationship to the platform foundation

The platform foundation is **frozen** (authentication, tenancy, RBAC, billing/marketplace shell, settings, audit). Modules extend that foundation; they do not replace it.

- Licensing gate: `module:{slug}`
- Authorization gate: Spatie `can:{permission}`
- Reference implementation: **Leads** (and **Tasks** for a second completed example)

See [Platform Architecture Freeze](/getting-started/platform-freeze).

## Development convention

All future modules must follow the same architecture and conventions.

Every new module should:

1. Be **self-contained**
2. **Own its resources** (migrations, models, services, routes, UI, permissions, settings, docs, tests, seeders when applicable)
3. **Declare dependencies** when required ([Module Dependencies](./module-dependencies))
4. **Avoid coupling** with unrelated modules
5. Be compatible with future **marketplace / module licensing** ([Module Licensing](./module-licensing))
6. Follow existing **coding standards** and project structure ([Module Development Guide](/developer-guide/module-development-guide))

This is a **development guideline** for engineers. Completeness is measured by the [Definition of Done](/developer-guide/module-development#definition-of-done).

## Related

- [Module Dependencies](./module-dependencies)
- [Module Licensing](./module-licensing)
- [Module Development Standard](/developer-guide/module-development)
- [Entitlements](/developer-guide/entitlements)
- [Product Roadmap](/getting-started/product-roadmap)
