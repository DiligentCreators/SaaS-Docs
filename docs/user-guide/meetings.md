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

## Built-in online meetings

Online and hybrid meetings get a built-in join URL/token. External providers (Zoom, Meet, Teams) are not available until their adapters are installed.

Workspace admins with `meetings.manage` can open **Meeting providers** (Administration → Meeting providers, or Meetings → Providers) to:

- See the current provider
- Review capabilities and health diagnostics
- Run validation
- Select the active provider (only installed providers appear)

## Requirements

Workspace must have the **Meetings** module installed. Permissions: `meetings.view` (and create/update/manage_* for edits). Provider settings require `meetings.manage`.
