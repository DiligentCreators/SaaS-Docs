# Tenant API v1 — Notifications

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`. Authorization: `dashboard.view` (via Gate on each action).

Laravel database notifications (`notifications` table). Architecture: [Notification Architecture Contract](/developer-guide/notification-architecture-contract).

Realtime: Laravel Reverb private channel `tenant.{tenantId}.user.{userId}` (event `NotificationCreated`). SPA uses Echo as primary and polls every 90 seconds only while Echo is disconnected.

## List & unread

### GET `/notifications`

Paginated notifications for the authenticated user.

Transformed item shape:

| Field | Notes |
|-------|--------|
| `id` | Stable notification UUID (Laravel `notifications.id`) |
| `type` | Prefer `data.type` when present, else notification class |
| `data` | Versioned envelope (`schema_version: 1`) — title, body, category, delivery, source, **route descriptor** (never SPA URLs), dedupe_key, entity refs. |
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

| Type | Channels (v1) |
|------|----------------|
| `lead.assigned` / `lead.reassigned` | `database`, `broadcast` |
| `lead.assigned.digest` | `database`, `broadcast` (bulk/import via NotificationBatch) |
| Follow-up created / due / overdue | `mail`, `database` |
| Task assigned / status / due | `mail`, `database` |

### Aggregation

Bulk assign and import equal-distribution wrap `NotificationBatch`: per-lead assigns still audit, but notify is suppressed until flush — **one digest (or single if count===1) per assignee**. Idempotent via `data.dedupe_key`.

### Scheduled due digests

`crm:send-due-notifications` (hourly) walks tenants and sends idempotent due/overdue notifications (daily `dedupe_key`).

### Retention

`notifications:prune --days=90` (weekly schedule) deletes **read** notifications older than N days. Unread are never pruned.

### Broadcast auth

`POST /broadcasting/auth` — middleware `tenancy`, `auth:tenant-api`, `tenant.user`. Channel class: `App\Broadcasting\TenantUserChannel`.

## Future (hooks only)

- Per-user preferences (in-app / browser / email)
- `delivery: scheduled` digests
- SMS / webhooks / mobile push as additional Laravel channels
