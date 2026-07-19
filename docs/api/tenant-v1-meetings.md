# Tenant API v1 — Meetings

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:meetings`, `can:meetings.*`.

## Meetings

### GET `/meetings`

Query: `search`, `status`, `type`, `mode`, `organizer_user_id`, `from`, `to`, `sort`, `order`/`direction`, `page`, `per_page`, `trashed`.

### POST `/meetings`

**Requires header `Idempotency-Key`.** Stored ≤ 24h.

Body: `title`, `starts_at`, `ends_at`, `timezone`, `status`, `type`, `mode`, `description`, `agenda`, `location`, `organizer_user_id`, `metadata`.

Publishes to Scheduling Platform when status is not `draft`.

### GET|PUT|DELETE `/meetings/{id}`

### POST `/meetings/{id}/status`

Body: `{ "status": "scheduled|in_progress|completed|cancelled|draft" }`.

### GET `/meetings/{id}/timeline`

### GET `/meetings/{id}/join?token=`

Validates join access through the meeting’s provider (via `MeetingManager`).

## Providers (Phase 4)

Only **installed** meeting adapters (non-null `adapters.meeting` on Integration Manifest v1) are returned. Google without a meeting adapter is not listed. Zoom appears when `INTEGRATIONS_ZOOM_ENABLED=true` and is selectable only with a Connected Zoom connection (OAuth via `/connections/zoom/oauth/start`).

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
