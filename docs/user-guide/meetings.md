# Meetings

Schedule and run workspace meetings. When a meeting is **scheduled**, it appears on Calendar views through the Scheduling Platform (not by writing Calendar tables).

## What you can do

- Create, edit, and list meetings
- Set type (internal, client, sales, …) and mode (online, physical, hybrid)
- Move through statuses: Draft → Scheduled → In progress → Completed / Cancelled
- Manage participants (internal users and external guests), RSVP, attendance
- Add shared/private notes, outcomes, and action items
- Attach documents or recording links
- Review the meeting timeline
- Open **Meeting providers** to see the active provider, capabilities, and diagnostics

## Meeting providers

Workspace admins with `meetings.manage` can open **Meeting providers** (Administration → Meeting providers, or Meetings → Providers) to:

- See the current provider
- Review capabilities, health, configuration errors, and last validation
- Connect OAuth providers (e.g. Zoom) when a connection is required
- Select an active provider only when it is available (connected)

**Built-in** supports online, physical, and hybrid meetings with an internal join URL/token.

**Zoom** (when enabled and connected) supports online meetings with Zoom join URLs. Capability badges (waiting room, passcode, recording, …) describe what the active provider supports — the product does not hardcode feature checks to a brand name.

## Requirements

Workspace must have the **Meetings** module installed. Permissions: `meetings.view` (and create/update/manage_* for edits). Provider settings require `meetings.manage`.
