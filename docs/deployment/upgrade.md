# Upgrade Guide

How to ship application releases to existing production installations without reseeding.

## Standard upgrade

```bash
php artisan down --retry=60   # optional
git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize
php artisan queue:restart
php artisan reverb:restart   # if Reverb is running
php artisan up
```

That is the complete path for catalog modules and tenant permission vocabulary changes that follow the platform pattern.

## What migrate does for modules & RBAC

| Change type | Mechanism | Safe for existing data? |
|-------------|-----------|-------------------------|
| New default-included module | Data migration + `DefaultModuleRegistrar` | Yes — insert-only catalog; install only if workspace never had a subscription row |
| New permissions | Data migration + `TenantPermissionSynchronizer` | Yes — additive grants only; never resets customized roles |
| Schema | Normal Laravel migrations | Follow usual migration discipline |

## Do not run in production upgrades

- `php artisan db:seed`
- `CatalogSeeder` / Central catalog seeders to “pick up” new modules
- Role/permission seeders to “sync” RBAC
- Manual SQL that reactivates cancelled module subscriptions
- Any process that expects login to repair missing permissions

## New workspaces after upgrade

`TenantProvisioningService` continues to:

1. Install every published `is_default_included` module
2. Provision default roles/permissions via `TenantAuthorizationProvisioningService`
3. Create the owner via `TenantAuthBootstrapService` (no RBAC mutation on later logins)

## Multi-Provider Email Delivery

After pulling a release that includes multi-provider email:

```bash
composer install --no-dev --optimize-autoloader   # pulls symfony/postmark-mailer + mailgun-mailer
php artisan migrate --force                       # email_logs tables + email-logs.* permission grants
php artisan email:migrate-tenant-mail-modes       # optional; --dry-run first. Backfills mail_mode from legacy mail_host
php artisan queue:restart                         # required — workers cache mailer config
```

Notes:

- Legacy tenants with a filled `mail_host` still behave as custom SMTP until the migrate command runs (recommended).
- Configure Central **Settings → Mail** (SMTP / Postmark / Mailgun). Env `MAIL_*` remains bootstrap fallback only.
- After changing mail credentials in Settings, always run `php artisan queue:restart`.
- Smoke: Central + Tenant **Send test**, then open **Email logs**.

See [Multi-Provider Email](/developer-guide/multi-provider-email).

## Verification

```bash
php artisan test --compact tests/Feature/ProductionModuleDeploymentTest.php
```

Smoke:

1. Existing workspace receives the new module in nav **only if** it never had that subscription (or already had it active)
2. Customized role permission sets are unchanged except for explicitly migrated additive grants
3. New registration still gets all default-included modules + full owner permissions

## Related

- [Release Process](/deployment/release-process)
- [v1.1.0 release](/changelog/v1.1.0)
- [Platform production runbook](/deployment/platform-production-runbook)
- [Module development — production](/deployment/module-development)
- [Communication Templates deployment](/deployment/communication-templates)
- [Multi-Provider Email](/developer-guide/multi-provider-email)
- [Email Webhooks](/developer-guide/email-webhooks)
- [Tenant provisioning](/developer-guide/tenant-provisioning)
