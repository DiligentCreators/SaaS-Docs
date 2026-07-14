# Leads — Production Guide

## Licensing

- Catalog slug: `leads`
- Default-included, non-billable for new workspaces
- Deactivate via Central module subscription tools to revoke access without dropping data

## Bootstrap

On workspace provision:

1. Default modules installed (includes Leads)
2. `LeadService::ensureDefaultStages()` / `LeadStageSeeder` seeds New → … → Won / Lost

Existing workspaces without stages get stages lazily on first Leads API call.

## Permissions rollout

After deploying Sprint 2 permissions (`leads.export`, `leads.convert`) and the renamed status vocabulary, re-bootstrap roles for existing workspaces (owner syncs all permissions; default roles use `tenant-default-role-permissions.php`).

Status migration maps legacy `open` → `active` and `won`/`lost` → `closed`. Column rename: `estimated_value` → `lead_value`.

## Monitoring

- Platform audit events: `lead_created`, `lead_updated`, `lead_deleted`, `lead_assigned`, `lead_stage_changed`, `lead_note_added`, `lead_follow_up_*`, convert-related activity
- Mail + database notifications: assignment, follow-up created, follow-up due/overdue (hourly `crm:send-due-notifications`)
- Tenant mail settings with Central SMTP fallback

## Scheduled jobs

| Command | Cadence | Purpose |
|---------|---------|---------|
| `crm:send-due-notifications` | Hourly | Idempotent due/overdue follow-up (and task) notifications |

Ensure the Laravel scheduler is running in production.

## Deploy checklist

1. Migrate lead tables + Sprint 2 enhance migration + `lead_assignment_histories`
2. Deploy frontend (Kanban/table, KPIs, export, convert stub, notifications)
3. Confirm `module:leads` + expanded permissions
4. Smoke: register/login → Leads board → create → DnD stage (save) → export → convert stub
