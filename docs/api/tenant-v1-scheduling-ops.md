# Tenant API v1 — Scheduling Ops (Phase 10)

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, plus module gates where noted.

See also: [Meetings](/api/tenant-v1-meetings), [Calendar](/api/tenant-v1-calendar), [Developer: Scheduling Ops](/developer-guide/scheduling-ops).

## Meetings ops (`module:meetings`)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/meetings/ops/dashboard` | `meetings.monitor` |
| GET | `/meetings/ops` | `meetings.monitor` |
| GET | `/meetings/ops/{id}` | `meetings.monitor` |
| POST | `/meetings/ops/bulk-cancel` | `meetings.admin` |
| GET | `/meetings/ops/reports?period=today\|week\|month` | `meetings.reports` |
| GET | `/meetings/ops/reminders` | `meetings.monitor` |
| GET | `/meetings/ops/notifications` | `meetings.monitor` |
| POST | `/meetings/ops/notifications/{email_log}/retry` | `meetings.admin` |
| GET | `/ops/scheduling-audit` | `meetings.monitor` |

### List query

`bucket=upcoming|today|active|completed|cancelled|missed`, `search`, `status`, `type`, `mode`, `provider`, `organizer_user_id`, `from`, `to`, `sort`, `order`, `page`, `per_page`.

### Bulk cancel body

```json
{ "meeting_ids": ["uuid", "uuid"] }
```

## Calendar ops (`module:calendar`)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/calendar/ops/dashboard` | `calendar.monitor` |
| GET | `/calendar/ops/sync` | `calendar.monitor` |
| POST | `/calendar/ops/sync/retry` | `calendar.monitor` |
| GET | `/calendar/ops/reports?period=today\|week\|month` | `calendar.reports` |

## Provider ops

| Method | Path | Permission |
|--------|------|------------|
| GET | `/ops/providers/status` | `provider.monitor` |

Returns meeting + calendar provider rollups (health, validation, connection, capabilities, active flag).
