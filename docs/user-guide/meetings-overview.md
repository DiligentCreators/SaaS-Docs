# Meetings Module

Schedule workspace meetings with hosts, invitees, optional Zoom/Google Meet links, and a single reminder. Meetings project onto Calendar for the host.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [meetings.md](/user-guide/meetings) |
| Engineers | [meetings.md](/developer-guide/meetings) |
| Production / ops | [meetings.md](/deployment/meetings) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Tenant API | [tenant-v1-meetings.md](/api/tenant-v1-meetings) |

## Capabilities

- Create / update / cancel / delete meetings
- Host assignment (`meetings.assign_host`)
- Internal invitees + external email guests
- Provider options: none (manual join URL), Google Meet, Zoom
- Workspace-level Zoom/Google connections shared by entitled staff
- One reminder per meeting (in-app, web push, email)
- Calendar projection via `CalendarEventService::upsertFromSource`
- Module licensing (`module:meetings`) + Spatie permissions
- Required dependency on **Calendar**

## Permissions

`meetings.view` · `create` · `update` · `delete` · `view_all` · `assign_host` · `manage_integrations`

## Related

- [Calendar](/user-guide/calendar-overview) — projection surface for host events
- [Module Dependencies](/architecture/module-dependencies) — Meetings → Calendar (required)
