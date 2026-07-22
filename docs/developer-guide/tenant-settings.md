# Tenant Settings — Developer Guide

## Core types

| Piece | Role |
|-------|------|
| `App\Support\TenantSettingDefinitions` | Catalog of overridable keys + sensitive keys (includes `task_reminder_time`, `meetings_default_provider`, `session_lifetime_minutes`) |
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

Business code must call the service (`applicationName()`, `logoUrl()`, `supportEmail()`, `buttonColor()`, `usesCustomMailProvider()`, …) instead of branching on raw settings.

`task_reminder_time` is a string `H:i` value (default `09:00`) under the `general` group (UI label: **Daily Reminder Time**). `crm:send-due-notifications` reads it after `applyRuntimeConfig()` so the comparison uses the workspace timezone. The same gate drives task due digests and daily CRM summaries.

`meetings_default_provider` is `none` \| `google_meet` \| `zoom` (default `none`) under the `general` group. It preselects the Meetings schedule form; OAuth connections remain on Meetings → Integrations.

`session_lifetime_minutes` is an integer under the `security` group (`0`–`43200`). `0` means never expire: public bootstrap exposes it, SPA idle logout is skipped, and `TenantAuthBootstrapService::issueAccessToken()` creates a Sanctum token with `expires_at = null`. When unset, resolution falls back to Central `session_lifetime_minutes`.

## Mail provider

`mail_mode` is `system` (inherit Central via `EmailManager`) or `custom` (tenant provider: SMTP / Postmark / Mailgun / …).

`usesCustomMailProvider()` is true when `mail_mode=custom`, or (legacy) when `mail_host` is filled and `mail_mode` is unset. Backfill with `php artisan email:migrate-tenant-mail-modes`.

Queued mail re-applies config via `ApplyEmailRuntimeConfig` on the `emails` queue.

Secrets are encrypted with `Crypt` and masked as `********` in the admin API.

## Admin API

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/tenant/v1/settings` | Resolved values + `source` / `is_overridden` |
| PUT | `/api/tenant/v1/settings` | `{ "settings": { "key": value } }` |
| POST | `/api/tenant/v1/settings/test-mail` | `{ "email": "…", "settings"?: {…} }` — structured result |
| POST | `/api/tenant/v1/settings/branding/{logo\|favicon}` | Multipart `file` → `FileUploadService` under `tenants/{uuid}/branding/…` |
| GET | `/api/tenant/v1/email-logs` | Workspace-scoped delivery logs |
| GET | `/api/tenant/v1/email-logs/{uuid}` | Show one log |

Permissions (`config/tenant-permissions.php`): `settings.list`, `settings.update`, `email-logs.list`, `email-logs.view`.

Object storage: [object-storage.md](/developer-guide/object-storage).

Requires tenancy (`X-Tenant-Domain` / domain) + `auth:tenant-api`.

## Public API

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/tenant/v1/public/settings` | Resolved branding + Central-inherited maintenance/password/session |

## Frontend

| Piece | Role |
|-------|------|
| `TenantSettingsPage` | `/settings` — General / Security / Branding / Mail |
| `tenantSettingService` | Tenant API client |
| `useSettingsStore` | Bootstraps from `GET …/public/settings` on app mount and again after auth settles (session restore, soft login, logout). Tenant path sends Bearer token and, when known, `X-Tenant-Domain` from the auth workspace so `InitializeTenancy` can resolve without a host-bound domain. Guest loads may fall back to Central once. In-app brand text stays empty until `loaded`; tab title falls back to `SaleOS`. Central fallback never overwrites branding that is already loaded (avoids stomping after save/login). Covered by `src/store/settings-store.test.ts`. |

## Schema

`tenant_settings`: `tenant_id`, `key`, `value`, `type`, `group`, unique `(tenant_id, key)`.

Profile sync: saving `company_name`, `timezone`, `locale`, `currency`, `logo_path` also updates the `tenants` row. `workspace_name` is stored on the tenant (not as a KV override of Central).

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Settings/
```

Playwright: `npm run test:e2e:tenant-settings` in `SaaS-Frontend`.
