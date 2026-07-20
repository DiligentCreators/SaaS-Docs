# Scheduling Administration

Tenant operational visibility for **Meetings** and **Calendar**. This is monitoring and management — not booking, CRM, automation, or new providers.

## Who can access

| Permission | Purpose |
|------------|---------|
| `meetings.monitor` | Meetings dashboard, list, inspect, reminders, notifications, audit |
| `meetings.admin` | Bulk cancel meetings; retry failed meeting notification emails |
| `meetings.reports` | Meetings operational reports |
| `calendar.monitor` | Calendar dashboard, sync status, manual sync retry |
| `calendar.reports` | Calendar operational reports |
| `provider.monitor` | Combined meeting + calendar provider health |

Default **Admin** role receives all of the above. **Manager** receives monitor/reports/provider (not `meetings.admin`).

## Screens (Administration)

| Screen | Route |
|--------|-------|
| Meetings dashboard | `/admin/meetings` |
| Calendar dashboard | `/admin/calendar` |
| Provider status | `/admin/providers` |
| Reminders & notifications | `/admin/reminders` |
| Scheduling reports | `/admin/reports` |

## Meetings dashboard

- Summary counts: upcoming, today, active, completed, cancelled, missed
- Filterable list (search, bucket, pagination)
- Inspect: organizer, participants, provider, reminder, schedule status, calendar sync mapping, notification emails, meeting audit timeline
- Bulk cancel (admin only) — no bulk reschedule

**Missed** means still `scheduled` after end time (or start time when no end) — not a new meeting status.

## Calendar dashboard

- Sync enabled / last success / last failure
- Pending & failed sync jobs (queue visibility)
- Conflict count and resolution strategy (`manual`)
- Manual retry (reuses existing Synchronization Framework)

## Provider status

Meeting providers: Built-in, Zoom, Google Meet  
Calendar providers: Google Calendar, Outlook Calendar  

Shows health, validation, connection, capabilities, configuration issues, and active selection.

## Reminders & notifications

- Schedule reminders: pending / sent / cancelled (via ReminderEngine)
- Meeting email notifications: status, channel, delivery time, failure reason
- Retry failed meeting emails (admin) via existing email resend

## Reports

Lightweight charts (no BI platform): meetings by day, organizer, provider; completion and cancellation rates for today / this week / this month.
