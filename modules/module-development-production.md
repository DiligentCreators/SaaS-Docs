# Module Development — Production Guide

## Licensing

- Active license = `workspace_module_subscriptions` in `trial` / `active` (and not ended).
- `EnsureModule` (`module:{slug}`) returns 403/402-style denial when the workspace lacks the module.
- Default-included modules (`is_default_included`) install on workspace provision; platform admins may deactivate.
- Entitlements cache: `workspace:{id}:entitlements` (1 hour); invalidated on install/cancel/deactivate.

## Bootstrap

On workspace create:

1. Billing profile
2. Default modules installed
3. Tenant permissions + roles bootstrapped
4. Module-specific seed data (e.g. default lead stages)

Re-run permission sync carefully when expanding `config/tenant-permissions.php` for existing workspaces (owner gets all; other roles follow default maps or admin assignment).

## Monitoring

- Platform audit log (`activity` log name `platform`) for install, assign, destructive actions
- Spatie activity on domain models for attribute changes
- Nightwatch / Telescope for exceptions on module routes
- Stripe / gateway logs remain under Billing — modules must not bypass them

## Deploy checklist

1. Run migrations
2. Seed/update catalog if needed (`CatalogSeeder`)
3. Confirm `tenant-permissions` vocabulary deployed before relying on new abilities
4. Clear entitlements cache if subscriptions changed out-of-band
5. Smoke: login → module nav visible → list API 200 with `module:` + `can:`

## Rollback

- Soft-delete / deactivate module subscription to revoke licensing without dropping data
- Keep domain tables; do not drop migrations in production without a data plan
