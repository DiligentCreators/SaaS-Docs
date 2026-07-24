# Leads Module

Reference business module for the SaleOS platform. Every future module (Tasks, Invoices, Inventory, etc.) must mirror this structure.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [leads-user.md](/user-guide/leads) |
| Engineers | [leads-developer.md](/developer-guide/leads) |
| Production / ops | [leads-production.md](/deployment/leads) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Tenant API | [../api/tenant-v1-leads.md](/api/tenant-v1-leads) |

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
- Import CSV / XLSX via multi-step wizard (`leads.import`) — column mapping, duplicate modes, preview, queued processing, history + reports
- **Inbound integrations** (`leads.manage_integrations`) — Custom webhooks (Zapier-ready) + Meta Lead Ads OAuth / Page subscribe
- Convert stub (`leads.convert`) — sets `converted_at`, records a converted activity, sets status `closed`; Contacts/Clients deferred
- Assignee scoping — without `leads.assign`, users only see their own leads
- Module licensing (`module:leads`) + Spatie permissions
- Audit + activity logging; assignment / follow-up notifications (mail + database)

## Permissions

`leads.view` · `create` · `update` · `delete` · `assign` · `export` · `import` · `convert` · `manage_integrations`

## Explicitly deferred

- Full conversion to Contacts / Companies
- Import retry execution (UI control present; processing deferred)
- Workflow automations
- Real-time board sync (Reverb / Echo)
