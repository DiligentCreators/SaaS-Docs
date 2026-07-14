# Central Application Settings — Developer Guide

## Core types

| Piece | Role |
|-------|------|
| `App\Support\SystemSettingDefinitions` | Catalog of keys, groups, types; obsolete key list; sensitive keys |
| `App\Services\Central\SystemSettingService` | Cache, typed get/set, runtime config, public bootstrap, branding uploads, password defaults |
| `App\Services\Storage\FileUploadService` | Disk-agnostic store/replace/delete/url for branding and future uploads |
| `SystemSettingController` | Admin list/update, test-mail, branding upload |
| `PublicSettingsController` | `GET /public/settings`, gated workspace registration |
| `EnsureTenantApplicationAvailable` | Tenant API `503` when `maintenance_mode` |
| `App\Rules\PasswordRule` | Centralized password policy from settings |
| `App\Mail\SystemSettingsTestMail` | Test message using company/support branding |

## Boot

`AppServiceProvider::boot()` calls:

```php
$settings->applyRuntimeConfig();
$settings->configurePasswordDefaults();
```

`applyRuntimeConfig()` overlays `app.name`, timezone, locale, session lifetime, Cashier currency, mail default/From/SMTP.

`Password::defaults()` and `PasswordRule` both read live settings (min length + special character).

## Admin API

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/central/v1/system-settings` | Masked secrets |
| PUT | `/api/central/v1/system-settings` | `{ "settings": { "key": value } }` |
| POST | `/api/central/v1/system-settings/test-mail` | `{ "email": "…" }` |
| POST | `/api/central/v1/system-settings/branding/{logo\|favicon}` | Multipart `file` → `FileUploadService` |

Permissions: `system-settings.list`, `system-settings.update`.

Empty / `********` `mail_password` on update leaves the existing encrypted value unchanged.

Branding assets use the configured uploads disk (`FILESYSTEM_DISK=public` locally / `s3` in production). See [object-storage.md](../architecture/object-storage.md).

## Public API

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/central/v1/public/settings` | Bootstrap payload — no secrets |
| POST | `/api/central/v1/public/register-workspace` | `403` when registration disabled |

## Frontend

| Piece | Role |
|-------|------|
| `useSettingsStore` | Bootstraps public settings; sets `document.title`, favicon, CSS `--primary` |
| `formatAppDate` / `formatAppDateTime` | `@/lib/datetime` — PHP-style formats → dayjs |
| `/register` | Registration-closed page when disabled |
| Tenant mode | Full-screen maintenance page when `maintenance_mode` |

## Notifications / mail

Tenant + Central password-reset and invite notifications use:

- `companyName()` for salutation
- `supportEmail()` when set
- Runtime mail From from settings

## Schema / seed

- Migration `2026_07_12_160000_refactor_central_system_settings` migrates `primary_color` → `button_color` and drops obsolete keys.
- `SystemSettingsSeeder` seeds the catalog and deletes obsolete keys.

## Tests

```bash
php artisan test --compact tests/Feature/Central/Settings/SystemSettingsTest.php
```

Playwright: `npm run test:e2e:settings` in `SaaS-Frontend`.

Tenant workspace overrides: see [tenant-settings-developer.md](tenant-settings-developer.md).
