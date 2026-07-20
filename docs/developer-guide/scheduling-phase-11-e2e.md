# Scheduling Platform Phase 11 — E2E Test Plan

> **Status: Feature freeze**  
> Architecture v1.0 and ADR-001–006 unchanged. No new product features.

Phase 11 validates the Scheduling Platform (Phases 0–10) with Playwright UI coverage plus Pest API/provider regression. Phase 12 (Manual QA & UAT) is separate.

## Layering

| Layer | Tool | Owns |
|-------|------|------|
| UI / journeys | Playwright (`npm run test:e2e:scheduling`) | Calendar views, Meetings CRUD, admin ops, providers chrome, reminder preference, tenant isolation smoke, nav permissions |
| API / providers / sync / OAuth / webhooks / queues | Pest | Full provider lifecycle, Google/Outlook sync+webhooks, Zoom/Meet OAuth mocks, Connections Center, Scheduling Platform domain, ops APIs, notification delivery |

Playwright does **not** drive live Google/Microsoft/Zoom OAuth or inbound webhooks (no UI). Those remain Pest-owned under feature freeze.

## Playwright suites

| Spec | Coverage |
|------|----------|
| `e2e/tests/calendar/calendar.workflow.spec.ts` | Personal calendar, Month/Week/Day/Agenda, create/edit/cancel event, search, color |
| `e2e/tests/meetings/meetings.workflow.spec.ts` | Create (internal/online/physical/hybrid), edit, guests, notes, attachments, status transitions, timeline, delete |
| `e2e/tests/scheduling/scheduling-ops.spec.ts` | Profile reminder default, schedule projection on Calendar, Meetings/Calendar dashboards, provider status, reminders, reports, meeting/calendar providers UI, bulk cancel |
| `e2e/tests/scheduling/scheduling-permissions.spec.ts` | Owner nav + route access for module and admin surfaces |
| `e2e/tests/scheduling/scheduling-isolation.spec.ts` | Tenant B cannot see Tenant A meeting title |

Scripts: `test:e2e:calendar`, `test:e2e:meetings`, `test:e2e:scheduling` (project `tenant`).

## Test matrix (checklist → evidence)

| Area | Playwright | Pest |
|------|------------|------|
| Auth login/logout/permissions | Existing auth + scheduling-permissions | TenantAuth, policies |
| Tenant isolation | scheduling-isolation | Meetings/Calendar/Connections/Ops tests |
| Calendar CRUD + views + filters | calendar.workflow | CalendarModuleTest |
| Team calendars | — (API only; no create-team UI) | CalendarModuleTest |
| Meetings CRUD/modes/participants/notes/attachments/timeline/status | meetings.workflow | MeetingModuleTest |
| Scheduling Platform ScheduleItem / events | Projection via Calendar after meeting create | SchedulingPlatformTest |
| Built-in meeting provider | Providers UI + Selected | MeetingProviderFrameworkTest |
| Zoom / Google Meet connect/validate/health/CRUD/join URL | Providers UI smoke (Zoom when manifest enabled) | ZoomMeetingProviderTest, GoogleMeetMeetingProviderTest |
| Google / Outlook Calendar sync, webhooks, conflicts, manual sync | Calendar providers Sync chrome + ops Manual retry | GoogleCalendarSyncTest, OutlookCalendarSyncTest |
| Notifications + ReminderEngine | Profile default + meeting reminder field | MeetingNotificationTest |
| Administration dashboards/reports/bulk cancel | scheduling-ops | SchedulingOpsTest |
| Queues / retries / OAuth refresh | — | Sync + reminder jobs in Pest |
| Phases 0–10 regression | scheduling suite | Feature/Tenant/{Integration,Scheduling,Calendar,Meeting,Ops} |

## Local prerequisites

1. Backend migrations through Phase 10 applied (includes Calendar/Meetings catalog registration).
2. `registration_enabled` on for tenant workspace registration.
3. Frontend `.env.e2e` pointing at API + Vite.

### Bug fixes discovered in Phase 11

| Fix | Why |
|-----|-----|
| MySQL index length on `schedule_items` composite index | Pending Phase 1 migration failed on utf8mb4; shortened indexed string columns |
| Catalog/provisioning tests expect 5 default modules | Stale assertions still expected only Leads/Tasks/Templates |
| Meetings row `aria-label="Row actions"` | Parity with Leads for Playwright row menus |
| Calendar month cell nested `<button>` | Invalid HTML / hydration; day cell is now `role="button"` div |

## Commands

```bash
# Frontend
cd SaaS-Frontend
npm run test:e2e:scheduling

# Backend regression (Phases 0–10 scheduling surface)
cd SaaS-Backend
php artisan test --compact tests/Feature/Tenant/Ops/SchedulingOpsTest.php \
  tests/Feature/Tenant/Meeting tests/Feature/Tenant/Calendar \
  tests/Feature/Tenant/Scheduling tests/Feature/Tenant/Integration
```

## Out of Phase 11

- Phase 12 Manual QA / UAT
- GitHub push / PRs / merges
- Live OAuth against production IdPs
- New features or UI enhancements beyond bug/a11y fixes required for green tests
