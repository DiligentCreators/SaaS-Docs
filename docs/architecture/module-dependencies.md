# Module Dependencies

Modules may depend on other modules.

This document defines how dependency relationships are described for product design and future implementation. It is **documentation only** — SaleOS does not yet implement automatic dependency resolution from this convention. Do not treat this page as a shipped runtime feature.

## Categories

Dependencies should be categorized as:

| Category | Meaning |
|----------|---------|
| **Required** | The dependent module cannot function correctly without the dependency installed and available |
| **Optional** | The dependent module works alone; the dependency unlocks extra integrations or features |

## Commercial nature of a dependency

Independently of required vs optional, a dependency relationship may be:

| Nature | Meaning |
|--------|---------|
| **Free** | The dependency module is free (or included) for the workspace |
| **Billable** | The dependency module is (or may become) a paid marketplace module |

A required dependency can be free or billable. An optional dependency can be free or billable. Licensing of each module remains independent — see [Module Licensing](./module-licensing).

## Examples

These examples illustrate the intended design language. They are not a commitment that every example is already implemented.

### Meetings → Calendar (required)

```text
Meetings
  └── depends on Calendar   (required)
```

Meeting scheduling assumes calendar concepts (availability, time ranges, calendar views). Meetings should declare Calendar as a **required** dependency.

### Payroll → HR (required)

```text
Payroll
  └── depends on HR         (required)
```

Payroll needs employee and employment records from HR. Payroll should not re-implement HR domain logic.

### Accounting → Inventory (optional)

```text
Accounting
  └── may depend on Inventory   (optional)
```

Accounting can operate without Inventory. When Inventory is installed, Accounting may optionally integrate stock valuations or COGS-related flows through contracts/services.

### AI → domain modules (optional)

```text
AI
  ├── may optionally integrate with Leads
  ├── may optionally integrate with Tasks
  ├── may optionally integrate with CRM (Contacts, Companies, …)
  └── … other domain modules as needed
```

AI Integration is planned as a cross-cutting capability. Integrations with Leads, Tasks, CRM, and similar modules should be **optional** — AI must not require every domain module to be installed.

## Design rules

When designing a new module:

1. List **required** dependencies explicitly in the module’s documentation.
2. List **optional** integrations separately so install and licensing expectations stay clear.
3. Keep business logic inside the owning module; call dependents through contracts/services only ([Module Architecture](./module-architecture)).
4. Do not assume a dependency is always present unless it is marked **required** and the platform later enforces that rule.
5. Do not implement dependency resolution in application code based on this document alone — that remains future work.

## Related

- [Module Architecture](./module-architecture)
- [Module Licensing](./module-licensing)
- [Product Roadmap](/getting-started/product-roadmap) (Calendar, Meetings, AI)
- [Entitlements](/developer-guide/entitlements)
