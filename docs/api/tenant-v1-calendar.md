# Tenant API v1 — Calendar

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:calendar`, plus `can:calendar.*` / policies.

Visibility: without `calendar.view_all`, only events where `organizer_id` is the current user. No calendar assignment — `organizer_id` and `assignee_id` are prohibited on write payloads.

## Upcoming

### GET `/calendar/upcoming`

Query: `limit` (1–25, default 8). Scheduled events with `starts_at >= now()`, visibility-scoped.

## Events

### GET `/calendar/events`

Query: `search`, `status`, `from`, `to`, `trashed`, `sort` (default `starts_at`), `direction` (default `asc`), `page`, `per_page`, `paginate` (`0`/`false` returns a non-paginated range collection when `from`+`to` are set).

### POST `/calendar/events`

Body: `title` (required), `description`, `starts_at`, `ends_at` (`after_or_equal:starts_at`), `all_day`, `timezone`, `color`.

Sets `organizer_id` to the authenticated user. Status `scheduled`, source `manual`.

### GET `/calendar/events/{id}`

### PUT `/calendar/events/{id}`

Same writable fields as create (partial). Organizer/source/status fields prohibited.

Used by the SPA form and by Week/Day **drag-and-drop** reschedule (`starts_at` + `ends_at` only).

### POST `/calendar/events/{id}/cancel`

Sets `status=cancelled` and `cancelled_at`.

### DELETE `/calendar/events/{id}`

Soft delete.

## Permissions

`calendar.view` · `create` · `update` · `delete` · `view_all`
