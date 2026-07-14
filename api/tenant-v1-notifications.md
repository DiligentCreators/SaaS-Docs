# Tenant API v1 — Notifications

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`. Authorization: `dashboard.view` (via Gate on each action).

Laravel database notifications (`notifications` table) plus mail channel on CRM notification classes. Real-time push (Reverb / Laravel Echo) is **deferred**; the Tenant SPA polls unread count every **25 seconds**.

## List & unread

### GET `/notifications`

Paginated notifications for the authenticated user.

Transformed item shape:

| Field | Notes |
|-------|--------|
| `id` | UUID |
| `type` | Prefer `data.type` when present, else notification class |
| `data` | Stored payload (title, body, dedupe keys, entity refs, etc.) |
| `read_at` | Nullable timestamp |
| `created_at` | |

### GET `/notifications/unread-count`

`{ "count": number }`

## Mark read

### POST `/notifications/{id}/read`

Marks a single notification read. 404 if not found for the current user.

### POST `/notifications/read-all`

Marks all unread notifications for the current user as read.

## Channels & producers

CRM notifications use `via(): ['mail', 'database']`, including:

- Lead assigned / follow-up created / follow-up due or overdue
- Task assigned / task due today or overdue

### Scheduled due digests

`crm:send-due-notifications` (hourly) walks tenants and sends idempotent due/overdue notifications for pending lead follow-ups and open tasks (deduped per day via `data.dedupe_key`).

## Future

- Laravel Reverb + Echo for live badge/list updates (polling remains until then)
