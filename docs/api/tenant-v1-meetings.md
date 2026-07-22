# Tenant API v1 — Meetings

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:meetings`, plus `can:meetings.*` / policies.

Visibility: without `meetings.view_all`, only meetings where the actor is creator, host, or internal invitee.

## Meetings

### GET `/meetings`

Query: `search`, `status`, `from`, `to`, `host_id`, `visibility` (`created_by`|`host`|`attendee`), `page`, `per_page`.

### POST `/meetings`

Body:

| Field | Rules |
|-------|--------|
| `title` | required, string |
| `description` | nullable |
| `starts_at` / `ends_at` | required; `ends_at` after `starts_at` |
| `timezone` | required timezone |
| `provider` | `none` \| `google_meet` \| `zoom` (default `none`) |
| `join_url` | nullable URL (manual link when `provider=none`) |
| `host_id` | optional; requires `meetings.assign_host` if not self |
| `reminder_offset_minutes` | nullable 0–10080 |
| `attendees[]` | max 50; `{ user_id? }` and/or `{ email, name? }` |

Creates Calendar projection (`source=meeting`). Provider ≠ `none` requires a connected workspace account.

### GET `/meetings/{id}`

### PUT `/meetings/{id}`

Partial update of the same writable fields.

### POST `/meetings/{id}/cancel`

Sets `status=cancelled`, cancels reminder + Calendar projection, attempts remote provider cancel (best-effort).

### POST `/meetings/{id}/retry-sync`

Requires `meetings.update`. Retries provider create/update sync without unbounded re-queueing.

### DELETE `/meetings/{id}`

Soft delete; removes Calendar projection.

### POST `/meetings/{id}/assign-host`

Body: `{ "host_id": number }` — requires `meetings.assign_host`.

## Integrations

Requires `meetings.manage_integrations`.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/meetings/integrations` | List providers, credential status, callback URL (no secrets) |
| PUT | `/meetings/integrations/{provider}/credentials` | Save workspace OAuth client ID/secret (+ optional webhook secret) |
| GET | `/meetings/integrations/{provider}/authorize` | Start OAuth using **tenant** credentials (one-time nonce in `state`) |
| DELETE | `/meetings/integrations/{provider}` | Disconnect account (keeps client credentials) |

Platform OAuth callback (no bearer token; tenant + one-time nonce from `state`):

`GET /api/oauth/meetings/{provider}/callback`

## Webhooks

### POST `/meetings/webhooks/{provider}`

Unauthenticated, `throttle:webhooks`. **Stub:** custom `X-Meeting-Signature` HMAC ack only — not Zoom/Google-native event ingestion. Do not wire marketplace webhooks to this path in production yet.

## Permissions

`meetings.view` · `create` · `update` · `delete` · `view_all` · `assign_host` · `manage_integrations`

## Notification types

`meeting.invite` · `meeting.updated` · `meeting.cancelled` · `meeting.reminder`
