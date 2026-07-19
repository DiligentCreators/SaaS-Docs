# Google Meet Provider (Phase 6)

> **Status: Implemented**  
> Binding ADRs: ADR-002 (manifest), ADR-004 (OAuth), ADR-005 (shared Google multi-capability connection).

Google Meet is a **satellite meeting adapter** on the shared Google Workspace connection. It does not create a second Google OAuth row.

## Components

| Piece | Path |
|-------|------|
| Manifest | `config/integrations/manifests/google-meet.integration.php` |
| Credential host | `google.integration.php` (`connection_integration=google`) |
| OAuth | Existing `GoogleOAuthProvider` (scopes include `calendar.events`) |
| Adapter | `App\Meetings\Providers\GoogleMeetMeetingProvider` |
| API client | Creates Calendar events with `conferenceData.createRequest` type `hangoutsMeet` |
| Health | `GoogleMeetHealthCheck` / `GoogleMeetDiagnostics` |

## ADR-005 shared connection

- Connections Center lists **Google Workspace** only (primary).
- Provider Settings lists **Google Meet** as a meeting provider.
- Connect / reconnect always targets `integration_slug=google`.
- Starting OAuth via `google-meet` still upserts the **google** connection.

## Configuration

```env
INTEGRATIONS_GOOGLE_ENABLED=true
INTEGRATIONS_GOOGLE_MEET_ENABLED=true
INTEGRATIONS_GOOGLE_CLIENT_ID=
INTEGRATIONS_GOOGLE_CLIENT_SECRET=
```

OAuth redirect remains `{API_HOST}/oauth/callback/google`.

Required scope for Meet: `https://www.googleapis.com/auth/calendar.events`  
(Reconnect Google if an older connection only has `calendar.readonly`.)

## Runtime

1. Connect Google Workspace (Connections Center or Provider Settings → Connect).
2. Select Google Meet as active meeting provider when the google connection is Connected.
3. Online meetings create a primary-calendar event with a Meet join URL.
4. Scheduling Platform still owns ScheduleItems via `SchedulingContract`.

## Capabilities

`meetings.online`, `join_url`, `recording`, `waiting_room`, `screen_sharing`, `chat`, `captions`, `co_host`, `participant_controls`.

## Explicitly out of Phase 6

Outlook, Teams, Jitsi, booking, AI, recording downloads.

Google Calendar synchronization shipped in [Phase 7](/developer-guide/google-calendar-sync) on the same Google connection.
