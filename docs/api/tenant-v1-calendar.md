# Tenant API v1 — Calendar

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:calendar`, plus `can:calendar.*`.

Timed work is **not** stored in calendar tables. Creates/updates call the Scheduling Platform; projections read `schedule_items` plus optional overlays.

## Calendars

### GET `/calendars`

Lists personal calendar (auto-provisioned) and accessible team calendars.

### POST `/calendars`

Body: `name`, `type` (`personal`|`team`), `color`, `timezone`, `settings`.

### GET `/calendars/{id}` · PUT `/calendars/{id}` · DELETE `/calendars/{id}`

Personal calendars cannot be deleted.

### POST `/calendars/{id}/members` · PUT `.../members/{member}` · DELETE `.../members/{member}`

Requires `calendar.manage`. Body: `user_id`, `role` (`owner`|`editor`|`viewer`).

## Categories

### GET|POST `/calendar-categories`

### PUT|DELETE `/calendar-categories/{id}`

Body: `name`, `color`, `sort_order`.

## Settings

### GET|PUT `/calendar/settings`

Body: `default_view` (`month`|`week`|`day`|`agenda`), `default_reminder_minutes`, `week_starts_on` (0–6), `show_weekends`, `timezone`, `filters`.

## Projections & events

### GET `/calendar/projections`

Query: `from`, `to` (required), `calendar_ids[]`, `category_ids[]`, `modules[]`, `search`.

Returns ScheduleItem projections with overlay color/category metadata. `editable` is true only for `module=calendar` + `owner_type=calendar_event`.

### POST `/calendar/events`

Creates a ScheduleItem via `SchedulingContract` and an overlay. Body: `calendar_id`, `title`, `starts_at`, `ends_at`, `all_day`, `timezone`, `description`, `location`, `color`, `category_id`, `reminder_offsets_minutes`.

### PUT|DELETE `/calendar/events/{overlay}`

Update / cancel calendar-authored events only. Cancel calls Scheduling Platform `cancel` and soft-deletes the overlay.
