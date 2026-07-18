# Module Development — Production Guide

## Licensing

- Active license = `workspace_module_subscriptions` in `trial` / `active` (and not ended).
- `EnsureModule` (`module:{slug}`) returns 403/402-style denial when the workspace lacks the module.
- Default-included modules (`is_default_included`) install on workspace provision; platform admins may deactivate.
- Entitlements cache: `workspace:{id}:entitlements` (1 hour); invalidated on install/cancel/deactivate.

## Workspace bootstrap (explicit provisioning)

On workspace create (`TenantProvisioningService`):

1. Billing profile
2. Default modules installed
3. Authorization defaults via `TenantAuthorizationProvisioningService` (roles + permission maps)
4. Module-specific seed data (e.g. default lead stages)
5. Owner user created (`TenantAuthBootstrapService::createOwner`) — **no** RBAC side effects on login afterward

Authentication, dashboard, and role/user listing never repair permissions.

## Shipping a new default-included module

Use **data migrations**, not production seeders:

1. Schema migration(s)
2. Catalog data migration → `App\Support\Catalog\DefaultModuleRegistrar`
3. Permission data migration → `App\Support\Permissions\TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`
4. Deploy with:

```bash
php artisan migrate --force
php artisan optimize
```

Keep `CatalogSeeder` updated for **local/CI fresh databases only**. Do **not** run `db:seed` / `CatalogSeeder` in production to register modules.

Never `syncPermissions()` against existing customized roles during deploy. Grants must be additive and idempotent.

### What DefaultModuleRegistrar guarantees

- `firstOrCreate` by module slug — never overwrites commercial flags, prices, or renamed fields
- Installs subscriptions only when a workspace has **never** had a row for that module (checks soft-deleted)
- Does not reactivate cancelled / suspended / soft-deleted subscriptions

### What TenantPermissionSynchronizer guarantees

- Creates missing permission vocabulary from `config/tenant-permissions.php`
- Grants **only the listed** new permission names to default roles that should have them
- Leaves customized role edits intact

## Monitoring

- Platform audit log (`activity` log name `platform`) for install, assign, destructive actions
- Spatie activity on domain models for attribute changes
- Nightwatch / Telescope for exceptions on module routes
- Stripe / gateway logs remain under Billing — modules must not bypass them

## Deploy checklist

1. Run migrations (`php artisan migrate --force`) — include **data migrations** for catalog rows and additive permission grants
2. Do **not** rely on `CatalogSeeder` / `db:seed` in production for new default modules
3. Confirm `tenant-permissions` + `tenant-default-role-permissions` config are deployed with the release (migrations read them)
4. Entitlement cache is cleared per workspace by the module registrar when a subscription is newly installed
5. If the module contributes dashboard widgets or notifications, confirm scheduler (`crm:send-due-notifications`) and SPA polling/widget ids
6. Smoke: login → module nav visible → list API 200 with `module:` + `can:`

## Rollback

- Soft-delete / deactivate module subscription to revoke licensing without dropping data
- Keep domain tables; do not drop migrations in production without a data plan
- Permission grant migrations are intentionally irreversible (do not revoke production role grants in `down()`)

## Related

- [Communication Templates deployment](/deployment/communication-templates)
- [Platform production runbook](/deployment/platform-production-runbook)
- [Tenant provisioning](/developer-guide/tenant-provisioning)
