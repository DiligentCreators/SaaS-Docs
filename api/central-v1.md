# Central API v1

Base path: `/api/central/v1`

Auth: Sanctum bearer token, guard `central-api`.

Authorization: Spatie permissions + policies.

## Auth & profile

| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/login` | Throttled |
| POST | `/auth/forgot-password` | |
| POST | `/auth/reset-password` | |
| GET | `/me` | Current user + roles/permissions |
| POST | `/me` | Update profile |
| POST | `/me/change-password` | |
| POST | `/me/logout` | Revokes tokens |
| GET | `/dashboard` | Platform stats |

## Platform

| Resource | Paths |
|----------|-------|
| Tenants | CRUD + `/{id}/restore` + `/{id}/force` |
| Users | CRUD + suspend/unsuspend/restore/force/change-password |
| Roles | CRUD |

Tenant create body: `company_name`, `slug?`, `email`, `domain?`, `owner_id?`, `status?`, `timezone?`, `currency?`, `country?`, `locale?`.

On create, the API assigns the default plan and trial window (see [tenant provisioning](../workflows/tenant-provisioning.md)).

## Catalog

| Resource | Paths |
|----------|-------|
| Modules | CRUD + restore/force |
| Features | CRUD + restore/force (`?module_id=`) |
| Limit definitions | CRUD |
| Plans | CRUD + restore/force |
| Plan modules | `GET/PUT /plans/{plan}/modules` body `{ "module_ids": [] }` |
| Plan limits | `GET/PUT /plans/{plan}/limits` body `{ "limits": [{ "limit_definition_id", "value": null }] }` |

`value: null` on a plan limit means **unlimited**.

## Tenancy placeholder

| Resource | Paths |
|----------|-------|
| Tenant subscriptions | CRUD + restore/force at `/tenant-subscriptions` |

No payment provider calls.

## System

| Method | Path | Notes |
|--------|------|-------|
| GET | `/system-settings` | All settings |
| PUT | `/system-settings` | `{ "settings": { "key": value \| { value, type, group } } }` |

Keys: `default_plan_id`, `registration_enabled`, `trial_enabled`, `maintenance_mode`, `company_name`, `timezone`, `currency`.

## Removed in Phase 1 rewrite

- `/plans/{plan}/features` typed pivot
- `/subscriptions` (replaced by `/tenant-subscriptions`)
- `/setting-definitions`

Postman: `SaaS-Backend/.docs/postman/Central.postman_collection.json` (refresh after API changes).
