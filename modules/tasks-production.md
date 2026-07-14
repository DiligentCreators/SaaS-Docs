# Tasks — Production Guide

## Licensing

- Catalog slug: `tasks`
- Default-included, non-billable for new workspaces
- Deactivate via Central module subscription tools to revoke access without dropping data

## Bootstrap

On workspace provision:

1. Default modules installed (includes Tasks)
2. Tenant permissions include `tasks.*` via `config/tenant-permissions.php` / default role maps

No stage seeder (unlike Leads)—status/priority are enums on the task row.

## Permissions rollout

After deploying Sprint 2 (`tasks.change_due_date`, `waiting` status), re-bootstrap roles for existing workspaces (owner syncs all permissions; default roles use `tenant-default-role-permissions.php`).

## Monitoring

- Platform audit events: `task_created`, `task_updated`, `task_deleted`, `task_assigned`, `task_completed`, `task_reopened`, `task_note_added`
- Mail + database notifications: assignment, due today / overdue (hourly `crm:send-due-notifications`)
- Tenant mail settings with Central SMTP fallback

## Scheduled jobs

| Command | Cadence | Purpose |
|---------|---------|---------|
| `crm:send-due-notifications` | Hourly | Idempotent due/overdue task (and lead follow-up) notifications |

## Deploy checklist

1. Migrate task tables (`tasks`, `task_notes`, `task_activities`)
2. Deploy frontend (board/list, KPIs, comments/history, due-date gate)
3. Confirm `module:tasks` + expanded permissions
4. Smoke: register/login → Tasks board → create → complete → note → due-date permission check
