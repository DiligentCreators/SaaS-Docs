# Tasks — Developer Guide

Mirror of the [Leads developer guide](leads-developer.md). Prefer copying Leads patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Task.php`, `TaskNote`, `TaskActivity` |
| Enums | `app/Enums/Tenant/TaskStatusEnum`, `TaskPriorityEnum`, `TaskActivityTypeEnum` |
| Service | `app/Services/Tenant/TaskService.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/TaskController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Task/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Task/*` |
| Policy | `app/Policies/TaskPolicy.php` |
| Events | `app/Events/Task*.php` |
| Subscriber | `app/Listeners/TaskEventSubscriber.php` (audit + notifications) |
| Notifications | `app/Notifications/Tenant/Task/*` |
| Tests | `tests/Feature/Tenant/Task/TaskTest.php` |

## Permissions

`config/tenant-permissions.php`:

```
tasks.view | create | update | delete | assign | complete
```

Routes use `module:tasks` then `can:tasks.*` / policies.

## API (tenant)

Base: `/api/tenant/v1`

| Method | Path | Permission |
|--------|------|------------|
| GET | `/tasks` | view |
| POST | `/tasks` | create |
| GET | `/tasks/{task}` | view |
| PUT | `/tasks/{task}` | update |
| DELETE | `/tasks/{task}` | delete |
| POST | `/tasks/{task}/assign` | assign |
| POST | `/tasks/{task}/complete` | complete |
| POST | `/tasks/{task}/reopen` | complete |
| POST | `/tasks/{task}/notes` | update |
| GET | `/tasks/{task}/timeline` | view |

Auth login/`me` include `modules: string[]` for SPA gating.

## Frontend

| Piece | Path |
|-------|------|
| Page | `src/pages/tasks/tasks-page.tsx` |
| Form | `task-form-dialog.tsx` |
| Detail | `task-detail-sheet.tsx` |
| Service | `taskService` in `src/api/services.ts` |
| Nav | `permission: tasks.view`, `module: 'tasks'` |

## Tests

```bash
# Backend
php artisan test --compact tests/Feature/Tenant/Task/TaskTest.php

# Frontend E2E
npm run test:e2e:tasks
```

## Logging

- Spatie `LogsActivity` on `Task` (log name `tasks`)
- Domain `task_activities` timeline
- `PlatformAuditService` via `TaskEventSubscriber`

## Intentional differences from Leads

| Leads | Tasks |
|-------|--------|
| Stages / status from stage flags | Status + priority enums |
| Follow-ups | None in v1 |
| `leads.assign` | `tasks.assign` + `tasks.complete` |
