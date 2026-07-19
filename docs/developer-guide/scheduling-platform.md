# Scheduling Platform (Phase 1)

> **Status: Implemented (Phase 1)**  
> Binding ADRs: ADR-001 (always-on scheduling), ADR-003 (ScheduleItem ownership), ADR-006 (event envelope).  
> This is a **platform service**, not the Calendar or Meetings marketplace modules.

## Ownership

| Layer | Role |
|-------|------|
| Scheduling Platform | Source of truth for timed work (`schedule_items`) |
| Calendar module (Phase 2) | UI / views over ScheduleItems ([Calendar developer guide](/developer-guide/calendar)) |
| Meetings module (later) | Domain meetings that upsert ScheduleItems |

Calendar is **not** required for Scheduling Platform APIs.

## Core concepts

- **ScheduleOwner** — `module` + `owner_type` + `owner_id` (+ optional `resource_*`)
- **ScheduleItemType** — `event`, `deadline`, `follow_up`, `busy_block`, `holiday`, `other`
- **Upsert** — idempotent on ownership key; bumps `version` for LWW
- **Working / business hours** — `working_hours` with `user_id` null = tenant business hours
- **Holidays** — org non-working days (used by AvailabilityService)
- **ReminderEngine** — sync offsets, claim due reminders, dispatch `ScheduleReminderDue`

## Services

| Service | Responsibility |
|---------|----------------|
| `ScheduleItemService` | Upsert / cancel / range query (Eloquent persistence) |
| `AvailabilityService` | Busy intervals, working-hours check, holiday check |
| `WorkingHoursService` | List / replace business or user hours |
| `ReminderEngine` | Reminder sync + `scheduling:process-due-reminders` |
| `SchedulingService` | Implements `SchedulingContract` |

No repository layer — persistence stays on Eloquent models inside services (SaleOS platform freeze).

## Contract for other modules

```text
App\Contracts\Scheduling\SchedulingContract
  upsert(ScheduleItemWriteDTO): ScheduleItem
  cancel(ScheduleOwner, ?actorId): ?ScheduleItem
  getBusyIntervals(userIds, from, to): BusyInterval[]
```

## APIs

See [Tenant Scheduling API](/api/tenant-v1-scheduling).

Permissions: `scheduling.view`, `scheduling.manage` (not module-gated).

## Explicitly out of Phase 1

Calendar UI (delivered in Phase 2), Meetings module, providers (Zoom/Meet), calendar sync, booking pages.
