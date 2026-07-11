# Phase 1 changelog

## Central SaaS Platform completion

Rounded out the Central Platform from catalog/placeholder scaffolding to a fully operable admin platform with a real billing foundation.

**Tenants**

- Expanded `tenants` with `workspace_name`, `phone`, `logo_path`, `address`, `notes`
- Added `archived_at` with archive/unarchive endpoints and actions, independent of soft delete
- Added a tenant details page (`/tenants/:id`) with profile, active subscription, usage, and subscription event timeline

**Users**

- Added user invite flow (`POST /users/invite`): creates the account, assigns roles, sends an invite email, tracks `invite_token`/`invite_sent_at`
- Added `phone`, `avatar_path`, `last_login_at` columns and a per-user activity timeline (`GET /users/{user}/activity`, backed by `spatie/laravel-activitylog`)

**Roles**

- Added role delete (`DELETE /roles/{role}`) and clone (`POST /roles/{role}/clone`)
- Added a platform-wide permissions matrix endpoint and screen (`GET /roles/permissions-matrix`, `/roles/matrix`) — read-only view grouped by permission prefix; per-role editing stays in the role form

**Plans & billing**

- Added `is_popular`, `stripe_product_id`, `stripe_monthly_price_id`, `stripe_yearly_price_id` to `plans` — manual Stripe mapping, no auto-created Stripe products
- Added the `plan_feature` pivot so plans can override individual features rather than only inheriting a module's full feature set, with `GET/PUT /plans/{plan}/features`
- Installed Laravel Cashier on the `Tenant` model (`Billable` trait, customer keyed by `tenant_id`), added Cashier `subscriptions`/`subscription_items` tables, and a `StripeWebhookController` (`POST /stripe/webhook`) that syncs Stripe subscription events into `tenant_subscriptions` via `BillingService`
- Added `tenant-subscriptions` cancel/resume/suspend actions with a `subscription_events` audit trail

**Dashboard**

- Replaced placeholder dashboard data with a real payload: tenant/user/subscription counts, MRR/ARR, 12-month growth and revenue series, recent tenants, recent subscriptions, and recent activity

**System settings**

- Reorganized `system_settings` into sectioned groups surfaced by the admin UI: General, Localization, Mail, Branding, Security, Maintenance, Billing, Feature Flags

**Testing**

- Frontend: added Playwright specs for roles (create, permission assignment, clone, matrix navigation) and subscriptions (full lifecycle: create, edit, view, suspend, resume, cancel, delete), plus tenant details/archive/unarchive coverage in the tenants spec
- Backend: added Pest coverage for tenant archive/unarchive, dashboard stats (including MRR and archived-tenant counts), plan feature sync, and role clone

---

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
