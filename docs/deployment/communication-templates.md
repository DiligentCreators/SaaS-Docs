# Communication Templates — Deployment

## Production deploy (migrate-only)

```bash
php artisan migrate --force
php artisan optimize
```

This ships:

1. Schema for `communication_templates`
2. Catalog row + workspace entitlements for `communication-templates` (data migration)
3. Additive permission grants for default roles (data migration)

Do **not** run `db:seed`, `CatalogSeeder`, or any permission seeder in production for this module.

## What the data migrations do (and do not do)

### `register_communication_templates_module`

Uses `App\Support\Catalog\DefaultModuleRegistrar`:

- Inserts the CRM category if missing
- Inserts the `communication-templates` module **only if the slug is missing**
- Never overwrites commercial flags, prices, or renamed catalog fields
- Installs an included subscription **only** for workspaces that have never had a subscription row for that module (including soft-deleted rows)
- Does **not** reactivate cancelled, suspended, or soft-deleted subscriptions
- Clears entitlement cache only for workspaces that received a new install

### `add_communication_template_permissions`

Uses `App\Support\Permissions\TenantPermissionSynchronizer`:

- Creates missing `communication-templates.*` permission vocabulary rows
- Grants only those permissions to default roles that should have them
- Never runs `syncPermissions()` on existing roles
- Never removes customized role permissions
- Idempotent: re-running creates zero duplicates

## New workspaces

`TenantProvisioningService` (before owner creation):

1. `ModuleSubscriptionService::installDefaultModules()` — every published `is_default_included` module
2. `TenantAuthorizationProvisioningService::provisionDefaults()` — workspace roles + default permission maps

Login / dashboard / role listing never provision or repair RBAC.

## Future modules

Copy this pattern for each new default-included module:

1. Schema migration(s) for domain tables
2. Data migration using `DefaultModuleRegistrar`
3. Data migration using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`
4. Keep `CatalogSeeder` in sync for **fresh local/CI databases only**

## Verification

```bash
php artisan test --compact tests/Feature/ProductionModuleDeploymentTest.php
php artisan test --compact tests/Feature/Tenant/CommunicationTemplates
```

Frontend (optional):

```bash
cd SaaS-Frontend
npm run test:e2e:communication-templates
```

Smoke after deploy:

1. Existing workspace sees **Templates** in nav (module installed + permissions granted)
2. Lead detail shows WhatsApp when phone is present
3. Marketplace/commercial flags for other modules remain unchanged
4. A customized staff role that had permissions removed does **not** regain revoked permissions (only the listed new grants are added)

## Related

- [Platform production runbook](/deployment/platform-production-runbook)
- [Module development — production](/deployment/module-development)
- [Developer guide](/developer-guide/communication-templates)
