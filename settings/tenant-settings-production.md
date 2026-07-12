# Tenant Settings — Production Guide

## Deploy checklist

1. Run migrations (adds `type` / `group` on `tenant_settings`).
2. Ensure `php artisan storage:link` so tenant branding under `tenants/{id}/branding/…` is publicly reachable.
3. Seed/sync tenant permissions so roles include `settings.list` and `settings.update` (`TenantAuthBootstrapService` / PermissionsSeeder).
4. Confirm `APP_KEY` is stable — SMTP passwords are encrypted with Laravel Crypt.

## Security

| Concern | Control |
|---------|---------|
| Isolation | Settings scoped by `tenant_id`; API requires tenancy + tenant auth |
| Cross-tenant | Branding files live under `tenants/{uuid}/…` |
| Secrets | `mail_password` encrypted at rest; API returns `********` |
| Central leakage | Tenant API never exposes Central-only keys (registration, maintenance, billing) |

## Ops signals

- Unexpected Central branding on a tenant SPA usually means no tenant override + public bootstrap fell back correctly.
- Mail from Central From-address on a tenant that expected custom SMTP → check whether `mail_host` is set for that workspace.
- 403 on `/api/tenant/v1/settings` → missing `settings.list` / `settings.update` on the role.

## Rollback

Clearing a tenant override (empty optional branding/mail fields, or deleting the `tenant_settings` row) restores Central defaults immediately after cache forget (handled by the service).
