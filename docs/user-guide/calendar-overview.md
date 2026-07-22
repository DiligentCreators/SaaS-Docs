# Calendar Module

Personal calendar events for tenant workspaces. Week/Day time grids, Month, and Agenda views with org-wide visibility for owners/admins. [Meetings](/user-guide/meetings-overview) (book + assign host + Zoom/Meet) project onto Calendar for the host.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [calendar.md](/user-guide/calendar) |
| Engineers | [calendar.md](/developer-guide/calendar) |
| Production / ops | [calendar.md](/deployment/calendar) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Tenant API | [tenant-v1-calendar.md](/api/tenant-v1-calendar) |

## Capabilities (v1)

- Personal events (`organizer_id` = creator)
- **Week** (default) + **Day** views with vertical hourly time slots (Google Calendar–style)
- Side-by-side layout for overlapping events
- Drag-and-drop reschedule on Week/Day (`calendar.update`)
- Month + Agenda views
- Create / update / cancel / delete
- Workspace timezone-aware display and editing
- `calendar.view_all` for workspace Owner / Admin / Manager oversight
- Upcoming events dashboard widget
- Module licensing (`module:calendar`) + Spatie permissions
- Activity logging (`LogsActivity`)

## Permissions

`calendar.view` · `create` · `update` · `delete` · `view_all`

## Explicitly deferred

- Calendar assignment / assignee / create-on-behalf
- Team calendars / shared ACL
- Invitee visibility of projected meeting events on Calendar grids
- Google / Outlook calendar sync
- Overlaying Tasks or Leads

Meetings, Zoom, and Google Meet are documented under [Meetings](/user-guide/meetings-overview).
