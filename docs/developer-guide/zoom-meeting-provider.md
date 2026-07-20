# Zoom Meeting Provider (Phase 5)

> **Status: Implemented**  
> Binding ADRs: ADR-002 (manifest v1.1), ADR-004 (OAuth + Connections Center), [ADR-007](/architecture/adr/adr-007-tenant-owned-integration-credentials) (tenant-owned Provider Credentials). Meetings remain provider-agnostic (Phase 4 framework).

Zoom is the first **external** meeting adapter. It plugs into the existing Meeting Provider Framework — no Meetings business logic and no Scheduling Platform changes. Zoom is a **primary** integration: it owns both Provider Credentials and the Connections Center row.

## Components

| Piece | Path |
|-------|------|
| Manifest | `config/integrations/manifests/zoom.integration.php` |
| OAuth | `App\Integrations\OAuth\ZoomOAuthProvider` |
| Health | `App\Integrations\Health\ZoomHealthCheck` |
| Adapter | `App\Meetings\Providers\ZoomMeetingProvider` |
| API client | `App\Meetings\Providers\Zoom\ZoomApiClient` |
| Validator / diagnostics / capabilities | `App\Meetings\Providers\Zoom\*` |

## Credentials (ADR-007)

| Store | Contents |
|-------|----------|
| Provider Credentials (`integration_provider_credentials`) | Tenant Zoom OAuth app `client_id` / `client_secret` |
| Connections Center (`integration_connections`) | Runtime user tokens |

```env
INTEGRATIONS_ZOOM_ENABLED=true
# Do not set INTEGRATIONS_ZOOM_CLIENT_ID/SECRET — deprecated and unbound
```

Configure under **Administration → Provider Credentials** (`zoom`). Register the tenant’s Zoom Marketplace app with redirect URI:

`{API_HOST}/oauth/callback/zoom`

Default scopes: `meeting:write`, `meeting:read`, `user:read`.

See [Tenant-Owned Integration Credentials](/developer-guide/tenant-owned-integration-credentials).

## Runtime flow

1. Tenant configures and validates Zoom **Provider Credentials**, then connects via `POST /connections/zoom/oauth/start` (Connections Center / Provider Settings Connect).
2. OAuthManager + PKCE use tenant app credentials (ADR-004 amendment); Connections Center stores tokens (encrypted).
3. Tenant selects Zoom as active provider (`PUT /meetings/providers/active`) when connection status is Connected.
4. `MeetingService` continues to call `MeetingManager` only; Zoom handles remote create/update/cancel.
5. ScheduleItems still published only via `SchedulingContract`.

## Capabilities

Exposed as capability flags (UI must not hardcode “Zoom”):

`meetings.online`, `join_url`, `waiting_room`, `passcode`, `recording`, `screen_sharing`, `breakout_rooms`, `polling`, `chat`, `alternative_hosts`, `webinars`.

Physical/hybrid modes are not supported by this adapter (capability check fails).

## Explicitly out of Phase 5

Google Meet, Teams, Jitsi, calendar sync, booking, AI, recording downloads, automation.
