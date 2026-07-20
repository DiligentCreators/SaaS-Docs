# Meetings

Schedule and run workspace meetings. When a meeting is **scheduled**, it appears on Calendar views through the Scheduling Platform (not by writing Calendar tables).

## What you can do

- Create, edit, and list meetings
- Set type (internal, client, sales, …) and mode (online, physical, hybrid)
- Choose a **reminder** per meeting (None, 15 minutes, 30 minutes, or 1 hour before start)
- Move through statuses: Draft → Scheduled → In progress → Completed / Cancelled
- Manage participants (internal users and external guests), RSVP, attendance
- Add shared/private notes, outcomes, and action items
- Attach documents or recording links
- Review the meeting timeline
- Open **Meeting providers** to see the active provider, capabilities, and diagnostics

## Reminders & notifications

Each meeting stores its own reminder. Exactly **one** reminder is sent before start (no snooze, no recurring, no per-participant reminders).

### Default reminder (Profile)

Open **Profile → Meetings → Default Reminder** and choose:

- None
- 15 Minutes
- 30 Minutes
- 1 Hour

This preference applies only when you create **new** meetings. Changing it never updates existing meetings.

### Per-meeting reminder

On create/edit, the Reminder field prefills from your default. The organizer can override it for that meeting.

### Who gets notified

Organizer and participants (internal users; external guests by email when an address exists) receive:

- Meeting created / updated / cancelled
- Participant added / removed
- Reminder before meeting
- Meeting started / completed (when status changes)

Administrators are **not** notified unless they are participants — they use dashboards and activity instead. See [Scheduling Administration](/user-guide/scheduling-administration).

## Meeting providers

Workspace admins with `meetings.manage` can open **Meeting providers** (Administration → Meeting providers, or Meetings → Providers) to:

- See the current provider
- Review capabilities, health, configuration errors, and last validation
- Connect OAuth providers (e.g. Zoom) when a connection is required
- Select an active provider only when it is available (connected)

**Built-in** supports online, physical, and hybrid meetings with an internal join URL/token.

**Zoom** (when enabled and connected) supports online meetings with Zoom join URLs.

**Google Meet** (when enabled) uses your existing **Google Workspace** connection — you do not connect Google twice. After Google is connected, select Google Meet as the active provider.

Capability badges (waiting room, captions, recording, …) describe what the active provider supports — the product does not hardcode feature checks to a brand name.

## Requirements

Workspace must have the **Meetings** module installed. Permissions: `meetings.view` (and create/update/manage_* for edits). Provider settings require `meetings.manage`.
