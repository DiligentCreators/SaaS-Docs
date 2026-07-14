# Tenant Settings — Developer Guide

## Core types

| Piece | Role |
|-------|------|
| `App\Support\TenantSettingDefinitions` | Catalog of overridable keys + sensitive keys |
| `App\Services\Tenant\TenantSettingService` | Hierarchy resolver, cache, branding uploads, runtime mail/config, public bootstrap |
| `App\Services\Storage\FileUploadService` | Disk-agnostic store/replace/delete/url (shared with Central) |
| `TenantSettingController` | Authenticated list/update, test-mail, branding upload |
| `PublicSettingsController` (tenant) | `GET /api/tenant/v1/public/settings` — resolved payload, no secrets |
| `InitializeTenancy` | After tenancy init, calls `TenantSettingService::applyRuntimeConfig()` |

## Hierarchy

`TenantSettingService::resolve($key)` returns `{ value, source }` where `source` is one of:

- `tenant` — row in `tenant_settings`
- `workspace` — Tenant model column (`workspace_name`, `company_name`, `timezone`, …)
- `central` — `SystemSettingService`
- `system` — hard-coded / config fallback

Business code must call the service (`applicationName()`, `logoUrl()`, `supportEmail()`, `buttonColor()`, `hasTenantSmtp()`, …) instead of branching on raw settings.

## SMTP

`hasTenantSmtp()` is true when tenant `mail_host` is set. `applyRuntimeConfig()` then overlays Laravel mail config from the tenant; otherwise it re-applies Central mail via `SystemSettingService`.

Passwords are encrypted with `Crypt` and masked as `********` in the admin API.

## Admin API

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/tenant/v1/settings` | Resolved values + `source` / `is_overridden` |
| PUT | `/api/tenant/v1/settings` | `{ "settings": { "key": value } }` |
| POST | `/api/tenant/v1/settings/test-mail` | `{ "email": "…" }` |
| POST | `/api/tenant/v1/settings/branding/{logo\|favicon}` | Multipart `file` → `FileUploadService` under `tenants/{uuid}/branding/…` |

Permissions (`config/tenant-permissions.php`): `settings.list`, `settings.update`.

Object storage: [object-storage.md](../architecture/object-storage.md).

Requires tenancy (`X-Tenant-Domain` / domain) + `auth:tenant-api`.

## Public API

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/tenant/v1/public/settings` | Resolved branding + Central-inherited maintenance/password/session |

## Frontend

| Piece | Role |
|-------|------|
| `TenantSettingsPage` | `/settings` — General / Branding / Mail |
| `tenantSettingService` | Tenant API client |
| `useSettingsStore` | Tenant public bootstrap when a workspace domain is known; otherwise Central |

## Schema

`tenant_settings`: `tenant_id`, `key`, `value`, `type`, `group`, unique `(tenant_id, key)`.

Profile sync: saving `company_name`, `timezone`, `locale`, `currency`, `logo_path` also updates the `tenants` row. `workspace_name` is stored on the tenant (not as a KV override of Central).

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Settings/
```

Playwright: `npm run test:e2e:tenant-settings` in `SaaS-Frontend`.
