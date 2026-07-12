# Tasks Module

Second product module on the frozen platform. Mirrors the [Leads](leads.md) reference architecture—only functional differences (status/priority/complete vs stages/follow-ups).

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [tasks-user.md](tasks-user.md) |
| Engineers | [tasks-developer.md](tasks-developer.md) |
| Production / ops | [tasks-production.md](tasks-production.md) |
| Module Development Standard | [module-development.md](module-development.md) |
| Reference blueprint | [leads.md](leads.md) |

## Capabilities (v1)

- Title, description, status, priority, due date
- Assignment (`created_by` / `assigned_to`)
- Complete / reopen workflow (`completed_at`)
- Notes
- Activity timeline
- Search, filters (status / priority), pagination
- Module licensing (`module:tasks`) + Spatie permissions
- Audit + activity logging
- Assignment notification

**Not in v1:** subtasks, recurring tasks, dependencies, calendar views, import/export.
