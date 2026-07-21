# Tasks Module

Second product module on the frozen platform. Mirrors the [Leads](/user-guide/leads-overview) reference architecture—functional differences only (status/priority/complete vs stages/follow-ups).

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [tasks-user.md](/user-guide/tasks) |
| Engineers | [tasks-developer.md](/developer-guide/tasks) |
| Production / ops | [tasks-production.md](/deployment/tasks) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [leads.md](/user-guide/leads-overview) |
| Tenant API | [../api/tenant-v1-tasks.md](/api/tenant-v1-tasks) |

## Capabilities (Sprint 2 CRM UX)

- Title, description, status, priority, due date
- Status includes **`waiting`**; UI label for `open` is **To Do**
- Assignment (`created_by` / `assigned_to`) with assignee scoping via `tasks.assign`
- **`tasks.change_due_date`** — required to change `due_at` after create (initial due date allowed on create)
- Complete / reopen (`tasks.complete`)
- Comments (notes) + History (timeline) tabs
- **Board (default)** + List view; drag-and-drop opens the drawer; save commits status
- KPIs via `GET /tasks/stats`; board via `GET /tasks/board`
- Module licensing (`module:tasks`) + Spatie permissions
- Audit + activity logging; assignment and due/overdue notifications (mail + database)

## Permissions

`tasks.view` · `create` · `update` · `delete` · `assign` · `complete` · `change_due_date`

## Explicitly deferred

- Subtasks, recurring tasks, dependencies
- Calendar views (see [Calendar](/user-guide/calendar-overview))
- Import / export
- Real-time board sync (Reverb / Echo)
