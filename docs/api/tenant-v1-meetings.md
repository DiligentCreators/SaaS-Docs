# Tenant API v1 — Meetings

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:meetings`, `can:meetings.*`.

## Meetings

### GET `/meetings`

Query: `search`, `status`, `type`, `mode`, `organizer_user_id`, `from`, `to`, `sort`, `order`/`direction`, `page`, `per_page`, `trashed`.

List/show payloads include `reminder_minutes` (`null|15|30|60`) and `reminder_sent_at` (ISO8601 or null).

### POST `/meetings`

**Requires header `Idempotency-Key`.** Stored ≤ 24h.

Body: `title`, `starts_at`, `ends_at`, `timezone`, `status`, `type`, `mode`, `description`, `agenda`, `location`, `organizer_user_id`, `metadata`, `reminder_minutes` (`null|15|30|60`, optional).

When `reminder_minutes` is omitted, the organizer’s default from `GET /meetings/settings` is snapshotted onto the meeting. Preference changes never rewrite existing meetings.

Publishes to Scheduling Platform when status is not `draft`. If `reminder_minutes` is set and not yet sent, passes a single offset to `ReminderEngine`.

### GET|PUT|DELETE `/meetings/{id}`

`PUT` accepts the same fields as create (partial). Updating `reminder_minutes` before `reminder_sent_at` re-syncs the schedule reminder; after send, no second reminder is created.

### POST `/meetings/{id}/status`

Body: `{ "status": "scheduled|in_progress|completed|cancelled|draft" }`.

### GET `/meetings/{id}/timeline`

### GET `/meetings/{id}/join?token=`

Validates join access through the meeting’s provider (via `MeetingManager`).

## User settings (Phase 9)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/meetings/settings` | `meetings.view` |
| PUT | `/meetings/settings` | `meetings.view` |

Body / response: `{ "default_reminder_minutes": null|15|30|60 }`.

Used only as the create-time default for new meetings.

## Providers (Phase 4)

Only **installed** meeting adapters (non-null `adapters.meeting` on Integration Manifest v1) are returned.

- **Zoom** — selectable when Connected (`/connections/zoom/oauth/start`).
- **Google Meet** — selectable when the shared **Google** connection is Connected (`connection_integration=google`; OAuth via `/connections/google/oauth/start`). Provider payloads include `connection_integration`.
- The `google` Workspace integration itself is not a meeting provider (adapter null).

| Method | Path | Permission |
|--------|------|------------|
| GET | `/meetings/providers` | `meetings.view` |
| GET | `/meetings/providers/active` | `meetings.view` |
| GET | `/meetings/providers/{slug}` | `meetings.view` |
| GET | `/meetings/providers/{slug}/capabilities` | `meetings.view` |
| GET | `/meetings/providers/{slug}/diagnostics` | `meetings.view` |
| POST | `/meetings/providers/{slug}/validate` | `meetings.manage` |
| PUT | `/meetings/providers/active` | `meetings.manage` |

`PUT /meetings/providers/active` body: `{ "provider": "builtin" }`. Persists tenant setting `meetings_provider` after validation.

Diagnostics include health, connection summary (Connections Center), capabilities, configuration, last validation, errors, provider version, and manifest version.

## Participants / notes / attachments

- `GET|POST /meetings/{id}/participants`
- `PUT|DELETE /meetings/{id}/participants/{participant}`
- `GET|POST /meetings/{id}/notes`
- `PUT|DELETE /meetings/{id}/notes/{note}`
- `GET|POST /meetings/{id}/attachments` (multipart `file` and/or `external_url`)
- `DELETE /meetings/{id}/attachments/{attachment}`
