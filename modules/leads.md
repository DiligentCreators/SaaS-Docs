# Leads Module

Reference business module for the DC SaaS platform. Every future module (Tasks, Invoices, Inventory, etc.) must mirror this structure.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [leads-user.md](leads-user.md) |
| Engineers | [leads-developer.md](leads-developer.md) |
| Production / ops | [leads-production.md](leads-production.md) |
| Module Development Standard | [module-development.md](module-development.md) |

## Capabilities (v1)

- Pipeline stages (seeded per workspace)
- Status workflow (`open` / `won` / `lost` synced from stage flags)
- Assignment
- Notes
- Follow-ups
- Activity timeline
- Search, filters, pagination
- Module licensing (`module:leads`) + Spatie permissions
- Audit + activity logging
- Assignment / follow-up notifications

**Not in v1:** import/export, lead conversion, automations.
