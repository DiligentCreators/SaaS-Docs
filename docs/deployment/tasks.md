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
- Workspace setting `task_reminder_time` / **Daily Reminder Time** (default `09:00`) in tenant timezone gates when digests and daily CRM summaries send
- Digest send state is durable in `task_digest_deliveries` (queued → sent / failed + retry). Cache flush does not re-email; failed queue jobs become retryable after `retry_after`
- Daily CRM summary send state is durable in `daily_summary_deliveries` (`kind` = `personal`|`team`). Stale `queued` rows older than 45 minutes may be reclaimed (max 5 attempts/day). See [Daily CRM summary](/deployment/daily-crm-summary).
- Tenant mail settings with Central SMTP fallback

## Scheduled jobs

| Command | Cadence | Purpose |
|---------|---------|---------|
| `crm:send-due-notifications` | Every 5 minutes (`withoutOverlapping(10)`, `onOneServer`) | Idempotent due/overdue in-app task alerts + daily task digest emails + daily CRM summaries; lead follow-up due/overdue notifications; meeting reminders |

## Deploy checklist

1. Migrate task tables (`tasks`, `task_notes`, `task_activities`) and `task_digest_deliveries`
2. Migrate CRM summary support: `users.receive_all_users_daily_summary`, `daily_summary_deliveries`
3. Deploy frontend (board/list, KPIs, comments/history, due-date gate, Settings → Daily Reminder Time, Users → daily summary flag)
4. Confirm `module:tasks` + expanded permissions
5. Confirm scheduler + `php artisan queue:work --queue=emails` (digest + CRM summary mail is queued)
6. Shared cache driver required for schedule `onOneServer()` locks
7. Smoke: register/login → Tasks board → create → complete → note → due-date permission check → set reminder time → confirm personal/team CRM summary after gate