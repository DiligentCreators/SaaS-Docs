# Meetings — Developer Guide

> **Status: Implemented (Phase 3–9)**  
> Binding ADRs: ADR-001 (Scheduling Platform SoT), ADR-002 (Integration Manifest v1.1), ADR-003 (ownership key), ADR-004 (OAuth + Connections Center), ADR-005 (shared Google connection), ADR-006 (enveloped events), [ADR-007](/architecture/adr/adr-007-tenant-owned-integration-credentials) (Provider Credentials).

Marketplace module (`meetings`) that **publishes** timed work through `SchedulingContract`. It never owns scheduling logic.

## Ownership

| Concern | Owner |
|---------|-------|
| Meeting aggregate, participants, notes, attachments | Meetings module |
| Timed work / busy / reminders | Scheduling Platform (`ReminderEngine`) |
| Calendar views | Calendar module (reads ScheduleItems) |
| Online session adapters | Meeting provider framework (via Integration Manifest) |
| Application credentials (OAuth apps) | Provider Credentials (`integration_provider_credentials`) — ADR-007 |
| Runtime tokens | Connections Center (`integration_connections`) only |
| In-app / email notification delivery | Notification Framework |

Schedule ownership: `module=meetings`, `owner_type=meeting`, `owner_id={meeting.id}`.

Draft meetings do not publish ScheduleItems. `scheduled` / `in_progress` / `completed` upsert; `cancelled` cancels via contract.

## Reminders (Phase 9)

Exactly **one** reminder per meeting. No snooze, recurring, custom offsets outside `{15,30,60}`, or per-participant reminders.

| Field | Storage | Role |
|-------|---------|------|
| User default | `meeting_user_settings.default_reminder_minutes` (nullable) | Prefill for **new** meetings only |
| Meeting reminder | `meetings.reminder_minutes` (`null\|15\|30\|60`) | Source of truth for ReminderEngine |
| Delivery gate | `meetings.reminder_sent_at` | Ensures one delivery |

Flow:

1. Create meeting → snapshot organizer default (or explicit `reminder_minutes`) onto the meeting
2. `MeetingService::syncSchedule` passes `reminderOffsetsMinutes: [reminder_minutes]` (or `[]` if null / already sent)
3. `ReminderEngine` stores one `schedule_reminders` row at `starts_at - offset`
4. `scheduling:process-due-reminders` → `ScheduleReminderDue` → `ScheduleReminderDueListener` → `MeetingReminderNotification` → set `reminder_sent_at`

Changing the user preference **never** rewrites existing meetings. ReminderEngine always reads `meeting.reminder_minutes`.

## Notifications (Phase 9)

`MeetingEventSubscriber` + Notification Framework (`database` + `mail`; web push when enabled). Category: `meetings`.

| Event | Notification type |
|-------|-------------------|
| MeetingCreated | `meeting.created` |
| MeetingUpdated | `meeting.updated` |
| MeetingCancelled | `meeting.cancelled` |
| MeetingStarted | `meeting.started` |
| MeetingCompleted | `meeting.completed` |
| MeetingParticipantAdded | `meeting.participant_added` |
| MeetingParticipantRemoved | `meeting.participant_removed` |
| ScheduleReminderDue (meetings) | `meeting.reminder` |

Recipients: organizer + internal participants + external participants with a valid email (`AnonymousNotifiable` mail-only). Admins are not notified unless they are participants.

User settings API: `GET|PUT /meetings/settings` (`default_reminder_minutes`).

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
| Models | `Meeting`, `MeetingParticipant`, `MeetingNote`, `MeetingAttachment`, `MeetingActivity`, `MeetingUserSetting` |
| Services | `MeetingService`, `MeetingParticipantService`, `MeetingNoteService`, `MeetingAttachmentService`, `MeetingUserSettingService` |
| Provider framework | `MeetingManager`, `MeetingProviderRegistry`, `MeetingProviderResolver`, `BuiltInMeetingProvider` |
| Events | `app/Meetings/Events/*` (enveloped) |
| Notifications | `app/Notifications/Tenant/Meeting/*` |
| Listeners | `MeetingEventSubscriber`, `ScheduleReminderDueListener` |
| Policy | `MeetingPolicy` |
| Tests | `MeetingModuleTest`, `MeetingProviderFrameworkTest`, `MeetingNotificationTest` |

## Permissions

```
meetings.view | create | update | delete | manage
meetings.manage_participants | manage_notes | manage_attachments
```

Provider APIs: `meetings.view` to read; `meetings.manage` to validate/select.

Routes: `module:meetings` + `can:meetings.*`.  
`POST /meetings` requires `Idempotency-Key` (Appendix A).

## Explicitly out of Phase 9

Multiple / recurring / custom reminders, snooze, reminder templates/history, per-participant reminders, booking, public scheduling, SMS/WhatsApp, automation, AI, workflow engine.

## Administrative ops (Phase 10)

See [Scheduling Ops](/developer-guide/scheduling-ops) for tenant admin dashboards, bulk cancel, provider/sync/reminder monitoring, and reports.
