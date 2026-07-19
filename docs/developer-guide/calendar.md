# Calendar — Developer Guide

> **Status: Implemented (Phase 2 + Phase 7 sync)**  
> Binding ADRs: ADR-001 (Calendar is presentation only), ADR-003 (no module FKs on calendar entities; ScheduleItems are SoT), ADR-005 (shared Google connection for calendar sync).

Marketplace module (`calendar`) that **consumes** the [Scheduling Platform](/developer-guide/scheduling-platform). It never becomes the source of truth for timed work.

External calendar sync (Google Calendar) is a **projection** layer — see [Google Calendar Sync](/developer-guide/google-calendar-sync).

## Ownership

| Concern | Owner |
|---------|-------|
| Persist timed work | Scheduling Platform (`schedule_items`) |
| Personal / team calendars, members | Calendar module |
| Categories, colors, overlays, user settings | Calendar module |
| Month / week / day / agenda UI | Calendar SPA |

User-authored events: `CalendarService` upserts via `SchedulingContract` with `module=calendar`, `owner_type=calendar_event`, then creates a `calendar_event_overlays` row (UI metadata only).

## Backend layout

| Piece | Path |
|-------|------|
| Models | `Calendar`, `CalendarMember`, `CalendarCategory`, `CalendarEventOverlay`, `CalendarUserSetting` |
| Enums | `CalendarTypeEnum`, `CalendarMemberRoleEnum`, `CalendarViewEnum` |
| Service | `app/Services/Tenant/CalendarService.php` |
| Controllers | `CalendarController`, `CalendarCategoryController`, `CalendarEventController`, `CalendarSettingsController`, `CalendarProviderController` |
| Sync | `app/Calendar/*` — provider framework + Google Calendar synchronization |
| Policy | `app/Policies/CalendarPolicy.php` |
| Tests | `tests/Feature/Tenant/Calendar/CalendarModuleTest.php`, `GoogleCalendarSyncTest.php` |

No repository layer. Persistence stays on Eloquent inside the service (platform freeze).

## Permissions

```
calendar.view | create | update | delete | manage
```

Routes: `module:calendar` then `can:calendar.*`.

## Catalog

Free default-included module (`is_billable=false`) registered via data migration + `CatalogSeeder`.

## Explicitly out of Phase 2

Meetings, meeting providers, Zoom/Meet, calendar sync, booking pages, public scheduling, automation, AI.
