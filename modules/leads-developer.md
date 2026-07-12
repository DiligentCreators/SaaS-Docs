# Leads — Developer Guide

Reference implementation. Copy this layout for Tasks and later modules.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Lead.php`, `LeadStage`, `LeadNote`, `LeadFollowUp`, `LeadActivity` |
| Enums | `app/Enums/Tenant/LeadStatusEnum`, `LeadFollowUpStatusEnum`, `LeadActivityTypeEnum` |
| Service | `app/Services/Tenant/LeadService.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/LeadController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Lead/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Lead/*` |
| Policy | `app/Policies/LeadPolicy.php` |
| Events | `app/Events/Lead*.php` |
| Subscriber | `app/Listeners/LeadEventSubscriber.php` (audit + notifications) |
| Notifications | `app/Notifications/Tenant/Lead/*` |
| Seeder | `database/seeders/Tenant/LeadStageSeeder.php` |
| Tests | `tests/Feature/Tenant/Lead/LeadTest.php` |

## Permissions

`config/tenant-permissions.php`:

```
leads.view | create | update | delete | assign
```

Routes use `module:leads` then `can:leads.*` / policies.

## API (tenant)

Base: `/api/tenant/v1`

| Method | Path | Permission |
|--------|------|------------|
| GET | `/lead-stages` | view |
| GET | `/leads` | view |
| POST | `/leads` | create |
| GET | `/leads/{lead}` | view |
| PUT | `/leads/{lead}` | update |
| DELETE | `/leads/{lead}` | delete |
| POST | `/leads/{lead}/assign` | assign |
| POST | `/leads/{lead}/stage` | update |
| POST | `/leads/{lead}/notes` | update |
| POST | `/leads/{lead}/follow-ups` | update |
| POST | `/leads/{lead}/follow-ups/{followUp}/complete` | update |
| GET | `/leads/{lead}/timeline` | view |

Auth login/`me` include `modules: string[]` for SPA gating.

## Frontend

| Piece | Path |
|-------|------|
| Page | `src/pages/leads/leads-page.tsx` |
| Form | `lead-form-dialog.tsx` |
| Detail | `lead-detail-sheet.tsx` |
| Service | `leadService` in `src/api/services.ts` |
| Nav | `permission: leads.view`, `module: 'leads'` |

## Tests

```bash
# Backend
php artisan test --compact tests/Feature/Tenant/Lead/LeadTest.php

# Frontend E2E
npm run test:e2e:leads
```

## Logging

- Spatie `LogsActivity` on `Lead` (log name `leads`)
- Domain `lead_activities` timeline
- `PlatformAuditService` via `LeadEventSubscriber`
