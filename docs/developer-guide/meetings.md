# Meetings — Developer Guide

> **Status: Implemented (Phase 3)**  
> Binding ADRs: ADR-001 (Scheduling Platform SoT), ADR-003 (ownership key), ADR-006 (enveloped events).

Marketplace module (`meetings`) that **publishes** timed work through `SchedulingContract`. It never owns scheduling logic.

## Ownership

| Concern | Owner |
|---------|-------|
| Meeting aggregate, participants, notes, attachments | Meetings module |
| Timed work / busy / reminders | Scheduling Platform |
| Calendar views | Calendar module (reads ScheduleItems) |

Schedule ownership: `module=meetings`, `owner_type=meeting`, `owner_id={meeting.id}`.

Draft meetings do not publish ScheduleItems. `scheduled` / `in_progress` / `completed` upsert; `cancelled` cancels via contract.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `Meeting`, `MeetingParticipant`, `MeetingNote`, `MeetingAttachment`, `MeetingActivity` |
| Services | `MeetingService`, `MeetingParticipantService`, `MeetingNoteService`, `MeetingAttachmentService` |
| Provider | `MeetingProviderInterface`, `BuiltInMeetingProvider`, `MeetingProviderRegistry` |
| Events | `app/Meetings/Events/*` (enveloped) |
| Policy | `MeetingPolicy` |
| Tests | `tests/Feature/Tenant/Meeting/MeetingModuleTest.php` |

## Permissions

```
meetings.view | create | update | delete | manage
meetings.manage_participants | manage_notes | manage_attachments
```

Routes: `module:meetings` + `can:meetings.*`.  
`POST /meetings` requires `Idempotency-Key` (Appendix A).

## Explicitly out of Phase 3

Zoom, Google Meet, Teams, Jitsi, calendar sync, booking, public scheduling, recordings upload, AI, automation.
