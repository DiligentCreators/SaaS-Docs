# Leads Module

Reference business module for the DC SaaS platform. Every future module (Tasks, Invoices, Inventory, etc.) must mirror this structure.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [leads-user.md](leads-user.md) |
| Engineers | [leads-developer.md](leads-developer.md) |
| Production / ops | [leads-production.md](leads-production.md) |
| Module Development Standard | [module-development.md](module-development.md) |
| Tenant API | [../api/tenant-v1-leads.md](../api/tenant-v1-leads.md) |

## Capabilities (Sprint 2 CRM UX)

- Pipeline stages (seeded: New → Contacted → Qualified → Proposal → Negotiation → Won / Lost)
- **Independent status** — `active`, `waiting`, `on_hold`, `closed`, `archived` (not derived from stage)
- **Priority** — `low`, `medium`, `high`, `urgent`
- **Lead value** — `lead_value` (renamed from `estimated_value`; API still accepts the old key as an alias on write)
- Assignment with **assignment history** table
- Notes, follow-ups (create / update-reschedule / complete), activity timeline
- **Kanban board (default)** + table view; drag-and-drop opens the detail drawer; save commits the stage change
- KPIs via `GET /leads/stats`; board via `GET /leads/board`
- Export CSV / XLSX of the current filtered set (`leads.export`)
- Convert stub (`leads.convert`) — sets `converted_at`, records a converted activity, sets status `closed`; Contacts/Clients deferred
- Assignee scoping — without `leads.assign`, users only see their own leads
- Module licensing (`module:leads`) + Spatie permissions
- Audit + activity logging; assignment / follow-up notifications (mail + database)

## Permissions

`leads.view` · `create` · `update` · `delete` · `assign` · `export` · `convert`

**Not included:** import.

## Explicitly deferred

- Full conversion to Contacts / Companies
- Import
- Automations / webhooks
- Real-time board sync (Reverb / Echo)
