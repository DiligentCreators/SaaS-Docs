# Architecture

SaleOS is a **modular SaaS platform**. New business capability ships as independently owned modules on top of the frozen platform foundation.

This section documents the **long-term modular architecture convention** and binding **Architecture Decision Records**. It describes architectural intent and coding guidelines — not every detail of the current billing or marketplace implementation.

## Documents

| Document | Description |
|----------|-------------|
| [Module Architecture](./module-architecture) | Self-contained modules, owned resources, and inter-module boundaries |
| [Module Dependencies](./module-dependencies) | Required vs optional dependencies; free vs billable dependency relationships |
| [Module Licensing](./module-licensing) | Independent licensing convention (included, free, or billable) |
| [Architecture Decision Records](./adr/) | Binding ADRs (including ADR-007 Tenant-Owned Integration Credentials) |
| [Tenant-Owned Integration Credentials](/developer-guide/tenant-owned-integration-credentials) | Two-store credentials architecture (Phases C–E shipped; Phase F deferred) |
| [Platform Freeze](/getting-started/platform-freeze) | Locked platform foundation — do not redesign core subsystems |
| [Module Development Standard](/developer-guide/module-development) | Engineering Definition of Done (mirror Leads) |
| [Product Roadmap](/getting-started/product-roadmap) | Planned modules and delivery phases |

## Development convention (summary)

All future modules must:

- Be **self-contained** and own their resources
- **Declare dependencies** when required (see [Module Dependencies](./module-dependencies))
- **Avoid coupling** with unrelated modules
- Remain compatible with future **marketplace / module licensing**
- Follow existing **coding standards** and project structure
- Follow the [Module Development Standard](/developer-guide/module-development)

See [Module Architecture — Development Convention](./module-architecture#development-convention) for the full guideline.
