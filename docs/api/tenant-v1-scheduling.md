# Tenant API v1 — Scheduling Platform

Base path: `/api/tenant/v1`  
Auth: `auth:tenant-api` + tenant context  
Permissions: `scheduling.view` / `scheduling.manage`  
**Not** gated by `module:calendar`.

## Schedule items

| Method | Path | Permission |
|--------|------|------------|
| GET | `/schedule-items` | `scheduling.view` |
| GET | `/schedule-items/{id}` | `scheduling.view` |

### List query

| Param | Required | Notes |
|-------|----------|-------|
| `from` | yes | ISO datetime |
| `to` | yes | Must be after `from` |
| `module` | no | Filter by publisher module |
| `status` | no | `scheduled` \| `cancelled` \| `completed` |
| `limit` | no | Cursor page size (1–100, default 50) |
| `cursor` | no | Cursor pagination token |

Response uses cursor pagination meta: `next_cursor`, `prev_cursor`, `has_more`.

Writers for module-owned items use `SchedulingContract` from application code (not these GETs).

## Availability

| Method | Path | Permission |
|--------|------|------------|
| GET | `/availability` | `scheduling.view` |

Query: `user_ids[]`, `from`, `to` → `{ busy: BusyInterval[] }`.

## Working / business hours

| Method | Path | Permission |
|--------|------|------------|
| GET | `/working-hours` | `scheduling.view` |
| PUT | `/working-hours` | `scheduling.manage` |

PUT body replaces all slots for tenant business hours (`user_id` omitted/null) or a user (`user_id` set):

```json
{
  "user_id": null,
  "slots": [
    { "day_of_week": 1, "start_time": "09:00:00", "end_time": "17:00:00", "timezone": "UTC" }
  ]
}
```

`day_of_week`: 0 = Sunday … 6 = Saturday.

## Correlation

Supports `X-Correlation-ID` (Phase 0 middleware).
