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

New Tasks permissions for **existing** workspaces must ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

## Monitoring

- Platform audit events: `task_created`, `task_updated`, `task_deleted`, `task_assigned`, `task_completed`, `task_reopened`, `task_note_added`
- Notifications: assignment (mail + database); due today / overdue **in-app per task**; one daily **mail digest** per assignee (`crm:send-due-notifications`)
- Workspace setting `task_reminder_time` (default `09:00`) in tenant timezone gates when digests send
- Digest send state is durable in `task_digest_deliveries` (queued → sent / failed + retry). Cache flush does not re-email; failed queue jobs become retryable after `retry_after`
- Tenant mail settings with Central SMTP fallback

## Scheduled jobs

| Command | Cadence | Purpose |
|---------|---------|---------|
| `crm:send-due-notifications` | Every 5 minutes (`withoutOverlapping(10)`, `onOneServer`) | Idempotent due/overdue in-app task alerts + daily task digest emails; lead follow-up due/overdue notifications |

## Deploy checklist

1. Migrate task tables (`tasks`, `task_notes`, `task_activities`) and `task_digest_deliveries`
2. Deploy frontend (board/list, KPIs, comments/history, due-date gate, Settings → Daily task reminder time)
3. Confirm `module:tasks` + expanded permissions
4. Confirm scheduler + `php artisan queue:work --queue=emails` (digest mail is queued)
5. Shared cache driver required for schedule `onOneServer()` locks
6. Smoke: register/login → Tasks board → create → complete → note → due-date permission check → set reminder time