# Zoom Meeting Provider (Phase 5)

> **Status: Implemented**  
> Binding ADRs: ADR-002 (manifest), ADR-004 (OAuth + Connections Center). Meetings remain provider-agnostic (Phase 4 framework).

Zoom is the first **external** meeting adapter. It plugs into the existing Meeting Provider Framework — no Meetings business logic and no Scheduling Platform changes.

## Components

| Piece | Path |
|-------|------|
| Manifest | `config/integrations/manifests/zoom.integration.php` |
| OAuth | `App\Integrations\OAuth\ZoomOAuthProvider` |
| Health | `App\Integrations\Health\ZoomHealthCheck` |
| Adapter | `App\Meetings\Providers\ZoomMeetingProvider` |
| API client | `App\Meetings\Providers\Zoom\ZoomApiClient` |
| Validator / diagnostics / capabilities | `App\Meetings\Providers\Zoom\*` |

## Configuration

```env
INTEGRATIONS_ZOOM_ENABLED=true
INTEGRATIONS_ZOOM_CLIENT_ID=
INTEGRATIONS_ZOOM_CLIENT_SECRET=
```

Register Zoom in the Zoom Marketplace app with redirect URI:

`{API_HOST}/oauth/callback/zoom`

Default scopes: `meeting:write`, `meeting:read`, `user:read`.

## Runtime flow

1. Tenant connects Zoom via `POST /connections/zoom/oauth/start` (Connections Center / Provider Settings Connect).
2. OAuthManager + PKCE + Connections Center store tokens (encrypted).
3. Tenant selects Zoom as active provider (`PUT /meetings/providers/active`) when connection status is Connected.
4. `MeetingService` continues to call `MeetingManager` only; Zoom handles remote create/update/cancel.
5. ScheduleItems still published only via `SchedulingContract`.

## Capabilities

Exposed as capability flags (UI must not hardcode “Zoom”):

`meetings.online`, `join_url`, `waiting_room`, `passcode`, `recording`, `screen_sharing`, `breakout_rooms`, `polling`, `chat`, `alternative_hosts`, `webinars`.

Physical/hybrid modes are not supported by this adapter (capability check fails).

## Explicitly out of Phase 5

Google Meet, Teams, Jitsi, calendar sync, booking, AI, recording downloads, automation.
