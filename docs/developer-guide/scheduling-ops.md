# Scheduling Ops — Developer Guide

> **Status: Implemented (Phase 10)**  
> Binding ADRs unchanged for Scheduling Ops scope. Scheduling Platform remains SoT; Calendar remains presentation; Meetings remain provider-agnostic. **Runtime tokens** live in Connections Center; **application credentials** are tenant-owned Provider Credentials ([ADR-007](/architecture/adr/adr-007-tenant-owned-integration-credentials)).

Administrative visibility and operations for tenant administrators. Not a feature expansion.

## Services

| Service | Role |
|---------|------|
| `MeetingOpsService` | Dashboard buckets, inspect, bulk cancel, reports, reminders, notifications |
| `CalendarOpsService` | Sync dashboard, queue visibility, manual retry, reports |
| `ProviderOpsService` | Composes MeetingManager + CalendarManager diagnostics |
| `SchedulingAuditQueryService` | Reads `activity_log` (`platform`) for scheduling events |

## APIs

Prefix: `/api/tenant/v1`

| Method | Path | Permission |
|--------|------|------------|
| GET | `/meetings/ops/dashboard` | `meetings.monitor` |
| GET | `/meetings/ops` | `meetings.monitor` |
| GET | `/meetings/ops/{meeting}` | `meetings.monitor` |
| POST | `/meetings/ops/bulk-cancel` | `meetings.admin` |
| GET | `/meetings/ops/reports` | `meetings.reports` |
| GET | `/meetings/ops/reminders` | `meetings.monitor` |
| GET | `/meetings/ops/notifications` | `meetings.monitor` |
| POST | `/meetings/ops/notifications/{email_log}/retry` | `meetings.admin` |
| GET | `/ops/scheduling-audit` | `meetings.monitor` |
| GET | `/calendar/ops/dashboard` | `calendar.monitor` |
| GET | `/calendar/ops/sync` | `calendar.monitor` |
| POST | `/calendar/ops/sync/retry` | `calendar.monitor` |
| GET | `/calendar/ops/reports` | `calendar.reports` |
| GET | `/ops/providers/status` | `provider.monitor` |

Query params on list endpoints: `search`, `bucket`/`status`, `sort`, `order`, `page`, `per_page`, `from`, `to`, `provider`, `organizer_user_id`.

## Permissions

```
meetings.admin | meetings.monitor | meetings.reports
calendar.monitor | calendar.reports
provider.monitor
```

Additive migration via `TenantPermissionSynchronizer` (never revokes).

## Missed meetings

Derived filter only: `status=scheduled` and end (or start) is in the past. No new `MeetingStatusEnum` case.

## Reminder “failed”

`schedule_reminders` statuses remain `pending|sent|cancelled`. Delivery failures surface through meeting-related `tenant_email_logs` (`status=failed`) and retry uses `EmailResendService`.

## Audit events (PlatformAuditService)

Includes: `meeting_created|updated|cancelled|completed|started`, `meetings_bulk_cancelled`, `meeting_reminder_sent`, `meeting_provider_selected`, `calendar_provider_selected`, `calendar_sync_completed|failed|retried`.

## Explicitly out of Phase 10

Booking, public scheduling, CRM/Lead/Contact integrations, recurring meetings, CalDAV/ICS, Teams, automation, AI, bulk reschedule, new providers, Phase 11 E2E.
