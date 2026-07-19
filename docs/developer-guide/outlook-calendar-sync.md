# Outlook Calendar Sync (Phase 8)

> **Status: Implemented**  
> Binding ADRs: ADR-001 (Scheduling SoT), ADR-002 (manifest), ADR-004 (OAuth), ADR-005 (shared Microsoft multi-capability connection), ADR-006 (domain events).

Outlook Calendar is a **satellite calendar adapter** on the shared Microsoft 365 connection. It does not create a second Microsoft OAuth row. External calendars receive synchronized **projections**; the Scheduling Platform remains the source of truth.

Reuses the Phase 7 Calendar Provider Framework (`CalendarManager`, Registry, Resolver, `SynchronizationService`) without framework redesign.

## Components

| Piece | Path |
|-------|------|
| Primary connection | `config/integrations/manifests/microsoft.integration.php` |
| Satellite manifest | `config/integrations/manifests/outlook-calendar.integration.php` |
| OAuth | `App\Integrations\OAuth\MicrosoftOAuthProvider` |
| Adapter | `App\Calendar\Providers\OutlookCalendarProvider` |
| API client | Microsoft Graph (`/me/events`, delta, subscriptions) |
| Health | `OutlookCalendarHealthCheck` / `OutlookCalendarDiagnostics` |
| Webhook | `POST /webhooks/calendar/outlook` (`clientState` + validationToken) |

## ADR-005 shared connection

- Connections Center lists **Microsoft 365** only (primary).
- Calendar Provider Settings lists **Outlook Calendar**.
- Connect / reconnect always targets `integration_slug=microsoft`.
- Starting OAuth via `outlook-calendar` upserts the **microsoft** connection.
- Same connection is reserved for future Teams, OneDrive, and Outlook Mail capabilities.

## Configuration

```env
INTEGRATIONS_MICROSOFT_ENABLED=true
INTEGRATIONS_OUTLOOK_CALENDAR_ENABLED=true
INTEGRATIONS_MICROSOFT_CLIENT_ID=
INTEGRATIONS_MICROSOFT_CLIENT_SECRET=
INTEGRATIONS_MICROSOFT_TENANT=common
```

OAuth redirect: `{API_HOST}/oauth/callback/microsoft`

Required scope: `Calendars.ReadWrite` (plus `openid`, `email`, `profile`, `offline_access`, `User.Read`).

## Sync behavior

- Outbound / inbound via existing `SynchronizationService`
- Incremental sync uses Graph `@odata.deltaLink` as `sync_token`
- Conflicts default to **keep_local**
- Inbound owner: `module=calendar`, `owner_type=outlook_calendar_event`, `origin=external_sync`
- Subscription renewal when channel expires; lifecycle notifications queue a pull

## Explicitly out of Phase 8

CalDAV, ICS, booking pages, public scheduling, automation, workflow engine, AI, recurring-event UI.
