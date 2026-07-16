# Central Application Settings — Production Guide

## Checklist

1. Run migrations (includes `2026_07_12_160000_refactor_central_system_settings`).
2. Seed or re-seed settings: `SystemSettingsSeeder` (or full Central seeder).
3. Configure object storage: local `FILESYSTEM_DISK=public` + `php artisan storage:link`, or production `FILESYSTEM_DISK=s3`. Optional split: `FILESYSTEM_BRANDING_DISK=public` for logo/favicon only (see [object-storage.md](/developer-guide/object-storage)).
4. Configure **Mail** in Central UI (or via API) with production SMTP; send a test email.
5. Set Application Name, Company Name, timezone, locale, currency, date/time formats.
6. Upload logo + favicon; set button color and support email.
7. Confirm password policy (min length / special character) matches security policy.
8. Leave **Tenant maintenance** off unless intentionally draining the Tenant Application.
9. Confirm **Registration enabled** matches go-live policy (closed → dedicated SPA page + API `403`).

## Security

| Concern | Practice |
|---------|----------|
| SMTP password | Encrypted at rest; never returned in clear text from admin API |
| Branding uploads | Image validation (no SVG); stored via `FileUploadService` under `branding/logos` / `branding/favicons` on the branding disk (`FILESYSTEM_BRANDING_DISK`) |
| Session lifetime | Applied to `config('session.lifetime')` at boot / after update |
| Maintenance | Only Tenant routes use `tenant.available` — never attach to Central |

## Ops signals

| Signal | Where |
|--------|-------|
| Wrong product title in UI | `app_name` not saved / public bootstrap not loaded |
| Emails from wrong address | Mail From settings vs env fallbacks — settings win after `applyRuntimeConfig` |
| Tenant 503 while Central works | Expected when `maintenance_mode` is on |
| Registration still open | Check `registration_enabled` and SPA `/register` route |

## Do not

- Put payment gateway secrets in Settings (use Billing → Payment Gateways).
- Run `php artisan down` for “tenant maintenance” — that would take Central down too.
- Commit real SMTP passwords or production branding assets into the repo.
