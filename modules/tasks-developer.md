# Tasks — Developer Guide

Mirror of the [Leads developer guide](leads-developer.md). Prefer copying Leads patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Task.php`, `TaskNote`, `TaskActivity` |
| Enums | `app/Enums/Tenant/TaskStatusEnum` (includes `waiting`; `Open` label `To Do`), `TaskPriorityEnum`, `TaskActivityTypeEnum` |
| Service | `app/Services/Tenant/TaskService.php` (+ `ScopesToAssignee`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/TaskController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Task/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Task/*` |
| Policy | `app/Policies/TaskPolicy.php` (`changeDueDate` → `tasks.change_due_date`) |
| Events | `app/Events/Task*.php` |
| Subscriber | `app/Listeners/TaskEventSubscriber.php` (audit + notifications) |
| Notifications | `app/Notifications/Tenant/Task/*` (`mail` + `database`) |
| Tests | `tests/Feature/Tenant/Task/TaskTest.php` |

## Domain notes

- Assignee scoping via `ScopesToAssignee` with `tasks.assign`.
- Updating `due_at` after create requires `tasks.change_due_date` (enforced in `TaskService` / policy). Initial `due_at` on create is allowed without that permission.
- Board columns are one per `TaskStatusEnum` case.

## Permissions

`config/tenant-permissions.php`:

```
tasks.view | create | update | delete | assign | complete | change_due_date
```

Routes use `module:tasks` then `can:tasks.*` / policies.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-tasks.md](../api/tenant-v1-tasks.md).

| Method | Path | Permission |
|--------|------|------------|
| GET | `/tasks` | view |
| GET | `/tasks/stats` | view |
| GET | `/tasks/board` | view |
| POST | `/tasks` | create |
| GET | `/tasks/{task}` | view |
| PUT | `/tasks/{task}` | update (+ `change_due_date` when changing `due_at`) |
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
| Page | `src/pages/tasks/tasks-page.tsx` (board default + list) |
| Form | `task-form-dialog.tsx` |
| Detail | `task-detail-sheet.tsx` (Comments + History; DnD status pending until Save) |
| Shared board | `src/components/crm/kanban-board.tsx` |
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
| Stages + independent status | Status + priority enums (no stages) |
| Follow-ups | None |
| Assignment history table | Timeline only |
| `export` / `convert` | `complete` / `change_due_date` |
| Board by stage | Board by status |
