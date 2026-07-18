# Module Licensing

Every module is designed to support **independent licensing**.

This page documents the **architectural convention** for how modules should be designed over the long term. It is not a claim that every planned module is already sold, priced, or enforced separately in production. For the current entitlements model and middleware behavior, see [Entitlements](/developer-guide/entitlements).

> **Important**
>
> This is documentation of the licensing *convention*. It does **not** change billing code, marketplace implementation, pricing, or catalog rows.

## Licensing postures

A module may be:

| Posture | Meaning |
|---------|---------|
| **Included by default** | Installed automatically for workspaces (typically `is_default_included`) |
| **Free** | Available without charge, but not necessarily auto-included for every workspace |
| **Billable** | Offered as a paid marketplace module |

These postures can change over product releases without redesigning the module’s internal architecture.

## Long-term rules

Documented product and engineering expectations:

1. **Some modules may always remain free** — for example core CRM capabilities the platform chooses to keep included or non-billable.
2. **Some modules may become billable in future releases** — schema and catalog fields already anticipate `is_billable`, pricing, and subscription `source` without requiring a redesign.
3. **Future modules must be designed to support independent licensing** — do not hard-code assumptions that Module A is always free, always included, or always bundled with Module B.
4. **This is an architectural convention** — teams should design modules as independently licensable even when the first release ships them as default-included or free.

## Design implications for engineers

When building a module:

- Gate routes and UI with `module:{slug}` **and** Spatie permissions — never fold licensing into role permissions.
- Keep the module installable on its own (aside from declared [dependencies](./module-dependencies)).
- Avoid embedding “always available” assumptions for sibling modules.
- Prefer catalog + subscription + middleware patterns already used by Leads and Tasks.
- Treat Marketplace activation and workspace subscriptions as the licensing surface; do not invent a parallel plan/feature/limit system (forbidden under [platform freeze](/getting-started/platform-freeze)).

## Relationship to dependencies

Module dependencies and module licensing are related but distinct:

| Concern | Question |
|---------|----------|
| Dependency | Does this module need another module’s capability to work? |
| Licensing | Is this module included, free, or billable for a workspace? |

A required dependency may itself be free or billable. Optional integrations must degrade gracefully when the optional module is not licensed/installed.

## Related

- [Module Architecture](./module-architecture)
- [Module Dependencies](./module-dependencies)
- [Entitlements](/developer-guide/entitlements)
- [Billing Engine](/developer-guide/billing-engine)
- [Platform Freeze](/getting-started/platform-freeze)
