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

Validates built-in join token.

## Participants / notes / attachments

- `GET|POST /meetings/{id}/participants`
- `PUT|DELETE /meetings/{id}/participants/{participant}`
- `GET|POST /meetings/{id}/notes`
- `PUT|DELETE /meetings/{id}/notes/{note}`
- `GET|POST /meetings/{id}/attachments` (multipart `file` and/or `external_url`)
- `DELETE /meetings/{id}/attachments/{attachment}`
