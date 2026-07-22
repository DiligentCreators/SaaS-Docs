# Calendar — Developer Guide

> **Status: Implemented (v1)**  
> Meetings depends on Calendar (required) and projects via `upsertFromSource`. No calendar assignment in v1.

## Ownership

| Concept | Owner |
|---------|--------|
| `calendar_events` table / CRUD / Week·Day·Month·Agenda UI | Calendar module |
| Meeting booking, host assignment, Zoom/Meet, reminders | [Meetings](/developer-guide/meetings) module (calls `CalendarEventService`) |

## Model

`App\Models\CalendarEvent` — `BelongsToTenant`, `LogsActivity`, `SoftDeletes`.

Key fields: `organizer_id`, `starts_at`, `ends_at`, `all_day`, `timezone`, `status` (`scheduled`|`cancelled`), `source` (`manual`|`meeting`), nullable `source_type`/`source_id` (Meetings uses morph alias `meeting`).

**Excluded:** `assignee_id`, calendar ACL, participants.

## Visibility

- Without `calendar.view_all`: `organizer_id = actor`
- With `calendar.view_all` or Owner superadmin: all tenant events
- `POST` always sets `organizer_id` to the authenticated user; `organizer_id` / `assignee_id` are **prohibited** on requests

## Service contract (Meetings-ready)

`App\Services\Tenant\CalendarEventService`:

- `createForOrganizer`, `update`, `cancel`, `delete`
- `listInRange`, `upcoming`
- `upsertFromSource` — used by Meetings; unused by Calendar UI in v1

## Frontend

| Piece | Location |
|-------|----------|
| Page | `src/pages/calendar/calendar-page.tsx` |
| Time grid (Week/Day + DnD) | `src/pages/calendar/calendar-time-grid.tsx` (`@dnd-kit/core`) |
| Form / detail | `calendar-event-form-dialog.tsx`, `calendar-event-detail-sheet.tsx` |
| Datetime helpers | `src/lib/datetime.ts` (`appTimezone`, `moveEventToSlot`, …) |
| API | `calendarService` in `src/api/services.ts` |
| E2E | `e2e/tests/calendar/`, `npm run test:e2e:calendar` |

Drag-and-drop on Week/Day calls `PUT /calendar/events/{id}` with new `starts_at` / `ends_at` (15-minute snap). Display and inputs use the workspace timezone from settings.

## Permissions

Configured in `config/tenant-permissions.php` + default role map:

| Role | Grants |
|------|--------|
| admin | all including `view_all` |
| manager | all except `delete`; includes `view_all` |
| staff | `view`, `create`, `update`, `delete` (own only via policy); no `view_all` |

## Registration

Migrate-only:

- `2026_07_20_230514_create_calendar_events_table.php`
- `2026_07_21_040000_register_calendar_module.php`
- `2026_07_21_040001_add_calendar_permissions.php`

Also listed in `CatalogSeeder` for fresh/local/CI.

## Dashboard

`DashboardWidgetService` registers widget id `calendar` (upcoming events), gated by `module:calendar` + `calendar.view`, scoped by `calendar.view_all`.

## Audit & activity

- Spatie `LogsActivity` on `CalendarEvent` records attribute changes.
- `App\Listeners\CalendarEventSubscriber` (registered in `AppServiceProvider`) writes platform audit entries (`activity` log name `platform`) for `calendar_event_created|updated|cancelled|deleted`, mirroring Leads/Tasks/Communication Templates.

## Tests

- Pest: `tests/Feature/Tenant/Calendar/CalendarEventTest.php`
- Playwright: `npm run test:e2e:calendar`

## Explicit non-goals (v1)

Assignment, team calendars, invitee Calendar ACL, Google/Outlook sync, Task/Lead overlays. Meetings/Zoom/Meet live in the Meetings module.
