# Meetings — Developer Guide

> **Status: Implemented (Phase 3–6)**  
> Binding ADRs: ADR-001 (Scheduling Platform SoT), ADR-002 (Integration Manifest), ADR-003 (ownership key), ADR-004 (Connections Center credentials), ADR-005 (shared Google connection), ADR-006 (enveloped events).

Marketplace module (`meetings`) that **publishes** timed work through `SchedulingContract`. It never owns scheduling logic.

## Ownership

| Concern | Owner |
|---------|-------|
| Meeting aggregate, participants, notes, attachments | Meetings module |
| Timed work / busy / reminders | Scheduling Platform |
| Calendar views | Calendar module (reads ScheduleItems) |
| Online session adapters | Meeting provider framework (via Integration Manifest) |
| Credentials | Connections Center only |

Schedule ownership: `module=meetings`, `owner_type=meeting`, `owner_id={meeting.id}`.

Draft meetings do not publish ScheduleItems. `scheduled` / `in_progress` / `completed` upsert; `cancelled` cancels via contract.

## Provider framework (Phase 4)

The Meetings module is **provider-agnostic**. Domain code depends on `MeetingManager`, not concrete adapters.

| Piece | Role |
|-------|------|
| `MeetingProviderInterface` | Create/update/cancel session, join URL, validate config, health, capabilities, metadata |
| `MeetingProviderRegistry` | Discovers `adapters.meeting` from Integration Manifest v1 |
| `MeetingProviderResolver` | Active provider from tenant settings + Connections Center + fallback |
| `MeetingManager` | Orchestration, diagnostics, selection, capability checks |
| `BuiltInMeetingProvider` | Built-in adapter (online / physical / hybrid + join token) |
| `ZoomMeetingProvider` | Zoom adapter — see [Zoom Meeting Provider](/developer-guide/zoom-meeting-provider) |
| `GoogleMeetMeetingProvider` | Google Meet on shared Google connection (ADR-005) — see [Google Meet Provider](/developer-guide/google-meet-provider) |
| Manifests | `builtin`, `zoom`, `google-meet` (`connection_integration=google`) |

Resolution order: preferred slug → tenant setting `meetings_provider` → `config('meetings.default_provider')` → fallback `builtin`.

Providers without a non-null `adapters.meeting` class are **not** listed (e.g. Google declares meeting capabilities for future work but has `meeting => null`).

Capabilities (examples): `meetings.online`, `meetings.physical`, `meetings.hybrid`, `meetings.recording`, `meetings.waiting_room`, … — drive UI and mode checks.

Tenant settings:

- `meetings_provider` (string)
- `meetings_provider_last_validation` (json)

## Backend layout

| Piece | Path |
|-------|------|
| Models | `Meeting`, `MeetingParticipant`, `MeetingNote`, `MeetingAttachment`, `MeetingActivity` |
| Services | `MeetingService`, `MeetingParticipantService`, `MeetingNoteService`, `MeetingAttachmentService` |
| Provider framework | `MeetingManager`, `MeetingProviderRegistry`, `MeetingProviderResolver`, `BuiltInMeetingProvider` |
| Events | `app/Meetings/Events/*` (enveloped) |
| Policy | `MeetingPolicy` |
| Tests | `MeetingModuleTest`, `MeetingProviderFrameworkTest` |

## Permissions

```
meetings.view | create | update | delete | manage
meetings.manage_participants | manage_notes | manage_attachments
```

Provider APIs: `meetings.view` to read; `meetings.manage` to validate/select.

Routes: `module:meetings` + `can:meetings.*`.  
`POST /meetings` requires `Idempotency-Key` (Appendix A).

## Explicitly out of Phase 6

Google Calendar synchronization, Teams, Jitsi, booking, public scheduling, recording downloads, AI, automation.
