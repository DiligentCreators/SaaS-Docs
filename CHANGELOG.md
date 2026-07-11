# Phase 1 changelog

## Central Platform greenfield rewrite

Replaced the flat typed-features + `plan_features.value` catalog with:

- `modules` → `features` (module-scoped boolean capabilities)
- `plan_module` composition
- `limit_definitions` + `plan_limits` (`NULL` = unlimited)
- `tenant_subscriptions` placeholder (no billing)
- `system_settings` (default plan, trial/registration/maintenance)
- Expanded `tenants` columns (slug, status, localization, owner, trial_ends_at)

Tenant create now provisions the default plan and trial days from the Plan record (not `.env`).

Admin UI catalog navigation and forms updated to match.

Docs home: this repository (`SaaS-Docs`).
