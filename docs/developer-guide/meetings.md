# Meetings — Developer Guide

> **Status: Implemented**  
> Required dependency: Calendar. Meetings owns booking, host, attendees, providers, and reminders; Calendar owns the projected event.

## Ownership

| Concept | Owner |
|---------|--------|
| `meetings`, attendees, reminders, provider connections | Meetings module |
| Zoom / Google Meet OAuth + remote meeting sync | Meetings module |
| Calendar projection (`source=meeting`) | `CalendarEventService::upsertFromSource` |

## Domain

- `App\Models\Meeting` — `BelongsToTenant`, `LogsActivity`, `SoftDeletes`
- `MeetingAttendee` — internal `user_id` and/or external `email`/`name`
- `MeetingProviderConnection` — encrypted tokens, one connection per provider per tenant
- `MeetingReminder` — single durable reminder row per meeting

Enums: `MeetingStatusEnum`, `MeetingProviderEnum`, `MeetingAttendeeRoleEnum`, `MeetingProviderConnectionStatusEnum`, `MeetingReminderStatusEnum`, `MeetingProviderSyncStatusEnum`.

Morph alias: `meeting` → `App\Models\Meeting` (registered in `AppServiceProvider`).

## Service contract

`App\Services\Tenant\MeetingService` is the sole writer:

- CRUD, cancel, assign host, attendee sync
- Provider sync via `MeetingProviderRegistry` (`none` / Zoom / Google Meet; fake drivers in testing)
- Calendar projection / cancel / delete
- Reminder schedule / reschedule / cancel

## Providers

- Interface: `App\Contracts\Meetings\MeetingProviderInterface` (authorize, exchange, **refreshAccessToken**, create/update/delete)
- Registry: `App\Services\Meetings\MeetingProviderRegistry`
- **Per-tenant BYOK:** each workspace stores its own OAuth `client_id` / `client_secret` / optional `webhook_secret` (encrypted) on `MeetingProviderConnection`
- OAuth account connect: `MeetingIntegrationController` (`meetings.manage_integrations`) with one-time cache nonce in `state`
- Platform-hosted callback: `GET /api/oauth/meetings/{provider}/callback` (tenant + nonce from encrypted `state`; re-checks `manage_integrations`)
- Access tokens refresh automatically near expiry (Zoom + Google)
- **Google Meet** creates a Meet **space** join link (not a Google Calendar conference); update is a no-op; delete removes the space when possible
- **Webhooks:** `MeetingWebhookController` is a **stub** (custom HMAC ack only — not Zoom/Google-native event ingestion). Do not rely on it for production reconciliation yet.
- Retry: `RetryProviderSyncJob` (tenant id + Laravel `$tries`/`$backoff`; does **not** re-dispatch forever from `syncProvider`)

Config: `config/meetings.php` (fake flag + Google/Zoom OAuth scopes + callback path only — **no platform client secrets**). Fake drivers are forced off in `production`. Prefer fail-closed on create when provider ≠ `none` and account is not connected. Remote provider delete on cancel/delete is best-effort (local status always wins; failures land on sanitized `provider_sync_*`). Manual retry: `POST /meetings/{id}/retry-sync`.

## Notifications

| Type | Channels |
|------|----------|
| `meeting.invite` / `meeting.updated` / `meeting.cancelled` | mail + database + broadcast + web push (users); mail-only for external guests |
| `meeting.reminder` | same; dispatched by `crm:send-due-notifications` |

Subscriber: `MeetingEventSubscriber` (audit + notifications; skips actor for invite/update/cancel).

## Scheduler

`crm:send-due-notifications` (every 5 minutes, `withoutOverlapping`, `onOneServer`) claims due `MeetingReminder` rows atomically (`pending` → `sending` → `sent`) with `NotificationIdempotency` for users and cache dedupe for external guest mail.

## Frontend

| Piece | Location |
|-------|----------|
| Page | `src/pages/meetings/meetings-page.tsx` |
| Form / detail / integrations | `meeting-form-dialog.tsx`, `meeting-detail-sheet.tsx`, `meeting-integrations-panel.tsx` |
| API | `meetingService` in `src/api/services.ts` |
| Notifications | `src/notifications/modules/meetings.ts` |
| E2E | `e2e/tests/meetings/`, `npm run test:e2e:meetings` |

Provider options in the form are disabled until Integrations reports `connected`. Calendar projections link back to Meetings and are read-only on the Calendar sheet.

## Permissions

| Role | Grants |
|------|--------|
| admin | all including `view_all`, `assign_host`, `manage_integrations` |
| manager | view/create/update/`view_all`/`assign_host` (no delete / manage_integrations) |
| staff | view/create/update/delete (scoped); no `view_all` / `manage_integrations` |

## Registration (migrate-only)

- `2026_07_22_000000_create_meetings_tables.php`
- `2026_07_22_000001_register_meetings_module.php`
- `2026_07_22_000002_add_meetings_permissions.php`
- `2026_07_22_000003_add_meetings_calendar_dependency.php`

Also listed in `CatalogSeeder` for fresh/local/CI.

## Tests

- Pest: `tests/Feature/Tenant/Meeting/*`
- Playwright: `npm run test:e2e:meetings`

## Explicit non-goals (current)

- Per-user personal Zoom/Google accounts
- Multiple reminders per meeting
- Changing Calendar ACLs so invitees see projected events (Meetings list remains invitee source of truth)
