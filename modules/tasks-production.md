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

After deploying `tasks.assign` / `tasks.complete`, re-bootstrap roles for existing workspaces (owner syncs all permissions; default roles use `tenant-default-role-permissions.php`).

## Monitoring

- Platform audit events: `task_created`, `task_updated`, `task_deleted`, `task_assigned`, `task_completed`, `task_reopened`, `task_note_added`
- Mail: assignment notifications use tenant mail settings with Central SMTP fallback

## Deploy checklist

1. Migrate task tables (`tasks`, `task_notes`, `task_activities`)
2. Deploy frontend with Tasks route (not placeholder)
3. Confirm `module:tasks` + permissions
4. Smoke: register/login → Tasks list → create task → complete → note → delete
