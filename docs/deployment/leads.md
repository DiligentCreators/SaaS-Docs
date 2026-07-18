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

New Leads permissions for **existing** workspaces must ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])` (same pattern as Communication Templates). Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

Status migration maps legacy `open` → `active` and `won`/`lost` → `closed`. Column rename: `estimated_value` → `lead_value`.

## Queue workers

Lead imports always run on the dedicated `imports` queue:

```bash
php artisan queue:work --queue=imports,emails,default --sleep=1 --tries=3 --max-time=3600
```

Ensure at least one worker listens to `imports`. Uploads use the configured `filesystems.uploads` disk (`public` locally / `s3` in production) under `imports/{tenant_uuid}/`.

## Monitoring

- Platform audit events: `lead_created`, `lead_updated`, `lead_deleted`, `lead_assigned`, `lead_stage_changed`, `lead_note_added`, `lead_follow_up_*`, `lead_import_completed`, `lead_import_failed`, convert-related activity
- Mail + database notifications: assignment, follow-up created, follow-up due/overdue (hourly `crm:send-due-notifications`)
- Tenant mail settings with Central SMTP fallback

## Scheduled jobs

| Command | Cadence | Purpose |
|---------|---------|---------|
| `crm:send-due-notifications` | Hourly | Idempotent due/overdue follow-up (and task) notifications |

Ensure the Laravel scheduler is running in production.

## Deploy checklist

1. Migrate lead tables + Sprint 2 enhance migration + `lead_assignment_histories` + `lead_imports`
2. Deploy frontend (Kanban/table, KPIs, export, import wizard/history, convert stub, notifications)
3. Confirm `module:leads` + expanded permissions (including `leads.import`)
4. Confirm queue worker includes `imports`
5. Smoke: register/login → Leads board → create → DnD stage (save) → export → import template → small CSV import → history download → convert stub
