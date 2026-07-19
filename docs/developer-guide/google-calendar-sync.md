# Google Calendar Sync (Phase 7)

> **Status: Implemented**  
> Binding ADRs: ADR-001 (Scheduling SoT), ADR-002 (manifest), ADR-004 (OAuth), ADR-005 (shared Google multi-capability connection), ADR-006 (domain events).

Google Calendar is a **satellite calendar adapter** on the shared Google Workspace connection. It does not create a second Google OAuth row. External calendars receive synchronized **projections**; the Scheduling Platform remains the source of truth.

## Components

| Piece | Path |
|-------|------|
| Manifest | `config/integrations/manifests/google-calendar.integration.php` |
| Credential host | `google.integration.php` (`connection_integration=google`) |
| Framework | `CalendarManager`, `CalendarProviderRegistry`, `CalendarProviderResolver` |
| Adapter | `App\Calendar\Providers\GoogleCalendarProvider` |
| Sync | `SynchronizationService`, `CalendarProjectionService`, `SyncStateService`, `ConflictResolver` |
| Webhook | `POST /webhooks/calendar/google` (channel token validation) |
| Health | `GoogleCalendarHealthCheck` / `GoogleCalendarDiagnostics` |

## Ownership

- **ScheduleItem** is authoritative.
- Outbound: local changes (`origin=local`) queue projection pushes.
- Inbound: remote events upsert via `SchedulingContract` with `origin=external_sync` (prevents sync loops).
- Conflicts default to **keep_local**.

## Configuration

```env
INTEGRATIONS_GOOGLE_ENABLED=true
INTEGRATIONS_GOOGLE_CALENDAR_ENABLED=true
INTEGRATIONS_GOOGLE_CLIENT_ID=
INTEGRATIONS_GOOGLE_CLIENT_SECRET=
CALENDAR_SYNC_QUEUE=calendar-sync
```

Required scope (shared with Meet): `https://www.googleapis.com/auth/calendar.events`

## Tenant API

| Method | Path |
|--------|------|
| GET | `/api/tenant/v1/calendar/providers` |
| PUT | `/api/tenant/v1/calendar/providers/active` |
| GET | `/api/tenant/v1/calendar/providers/{provider}/diagnostics` |
| GET | `/api/tenant/v1/calendar/sync` |
| POST | `/api/tenant/v1/calendar/sync` |
| GET | `/api/tenant/v1/calendar/sync/conflicts` |
| POST | `/api/tenant/v1/calendar/sync/conflicts/{id}/resolve` |

## Explicitly out of Phase 7

Microsoft Outlook, CalDAV, ICS, booking pages, public scheduling, automation, workflow, AI, recurring-event UI.
