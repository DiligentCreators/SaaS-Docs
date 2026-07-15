# Leads — Developer Guide

Reference implementation. Copy this layout for Tasks and later modules.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Lead.php`, `LeadStage`, `LeadNote`, `LeadFollowUp`, `LeadActivity`, `LeadAssignmentHistory` |
| Enums | `app/Enums/Tenant/LeadStatusEnum`, `LeadPriorityEnum`, `LeadFollowUpStatusEnum`, `LeadActivityTypeEnum` |
| Service | `app/Services/Tenant/LeadService.php` (+ `ScopesToAssignee`) |
| Export | `app/Exports/LeadsExport.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/LeadController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Lead/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Lead/*` |
| Policy | `app/Policies/LeadPolicy.php` |
| Events | `app/Events/Lead*.php` |
| Subscriber | `app/Listeners/LeadEventSubscriber.php` (audit + notifications) |
| Notifications | `app/Notifications/Tenant/Lead/*` (`mail` + `database`) |
| Seeder | `database/seeders/Tenant/LeadStageSeeder.php` |
| Tests | `tests/Feature/Tenant/Lead/LeadTest.php`, `LeadValidationTest.php` |

## Domain notes

- `lead_value` replaced `estimated_value` (migration rename). Store/update requests still accept `estimated_value` as a write alias.
- Status is independent of stage flags (`is_won` / `is_lost`). Stage change does not sync status.
- Convert stub: `converted_at`, `conversion_meta` (includes `stub: true`), status `closed`, activity type converted. Contacts deferred.
- Assignee scoping via `ScopesToAssignee` with `leads.assign` (superadmin always org-wide).

## Permissions

`config/tenant-permissions.php`:

```
leads.view | create | update | delete | assign | export | convert
```

No `leads.import`. Routes use `module:leads` then `can:leads.*` / policies.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-leads.md](/api/tenant-v1-leads).

| Method | Path | Permission |
|--------|------|------------|
| GET | `/lead-stages` | view |
| GET | `/leads` | view |
| GET | `/leads/stats` | view |
| GET | `/leads/board` | view |
| GET | `/leads/export` | export |
| POST | `/leads` | create |
| GET | `/leads/{lead}` | view |
| PUT | `/leads/{lead}` | update |
| DELETE | `/leads/{lead}` | delete |
| POST | `/leads/{lead}/assign` | assign |
| POST | `/leads/{lead}/convert` | convert |
| POST | `/leads/{lead}/stage` | update |
| POST | `/leads/{lead}/notes` | update |
| POST | `/leads/{lead}/follow-ups` | update |
| PUT | `/leads/{lead}/follow-ups/{followUp}` | update |
| POST | `/leads/{lead}/follow-ups/{followUp}/complete` | update |
| GET | `/leads/{lead}/timeline` | view |
| GET | `/leads/{lead}/assignment-history` | view |

Auth login/`me` include `modules: string[]` for SPA gating.

## Frontend

| Piece | Path |
|-------|------|
| Page | `src/pages/leads/leads-page.tsx` (board default + table) |
| Form | `lead-form-dialog.tsx` |
| Detail | `lead-detail-sheet.tsx` (DnD stage pending until Save) |
| Shared board | `src/components/crm/kanban-board.tsx` |
| Service | `leadService` in `src/api/services.ts` |
| Nav | `permission: leads.view`, `module: 'leads'` |

## Tests

```bash
# Backend
php artisan test --compact tests/Feature/Tenant/Lead

# Frontend E2E
npm run test:e2e:leads
```

## Logging

- Spatie `LogsActivity` on `Lead` (log name `leads`)
- Domain `lead_activities` timeline
- `lead_assignment_histories` for assignee changes
- `PlatformAuditService` via `LeadEventSubscriber`
