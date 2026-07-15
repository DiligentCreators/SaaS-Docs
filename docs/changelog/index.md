# Changelog

## Dedicated emails queue (2026-07-15)

All `ShouldQueue` notifications dispatch to the named `emails` queue via `QueuesOnEmails`.

- Worker: `php artisan queue:work --queue=emails --sleep=1 --tries=3 --max-time=3600`
- Optional standby: `--queue=default` for future non-mail jobs
- Docs: production runbook, module-development-developer, backend README Queue Setup

---

## SPA runtime config (multi-client / Forge) (2026-07-15)

Frontend API origin is runtime via Forge-generated `/config.js` (`window.env`), not baked into CI.

- Deploy script sources site `.env` and writes `VITE_API_URL` / `VITE_APP_NAME` / `VITE_API_MODE`
- Same `build-artifacts` artifact for every client; each Forge site owns its `.env`
- No committed `config.js` / `config.example.js` in the SPA repo
- Docs: `architecture/frontend-build-artifacts.md`, production runbook

---

## Frontend production CI/CD (build-artifacts) (2026-07-15)

Automated SPA production builds on merge to `main` without committing `dist/` to source.

- GitHub Actions workflow `frontend-build.yml`: lint, typecheck, Vite production build, validation, secret scan
- Uploads GitHub Actions artifact `frontend-build` (30-day retention)
- Publishes deployment-ready assets to the `build-artifacts` branch with `build-info.json` provenance
- Docs: `architecture/frontend-build-artifacts.md`; production runbook SPA section updated

---

## Object storage migration (Wasabi / S3) (2026-07-15)

All user uploads go through Laravel Storage via `FileUploadService`. Production uses `FILESYSTEM_DISK=s3` (Wasabi or any S3-compatible provider); local uses `FILESYSTEM_DISK=public`.

- `league/flysystem-aws-s3-v3` + full `AWS_*` env (`ENDPOINT` / `URL` for Wasabi)
- Central/tenant branding and admin tenant logos use `FileUploadService` (unique filenames, relative keys, disk-agnostic URLs)
- Tenancy filesystem bootstrapper no longer remaps the shared `public`/uploads disk (prefix isolation via `tenants/{uuid}/…`)
- Artisan `storage:migrate-to-s3` copies existing local objects idempotently
- Docs: `architecture/object-storage.md`; settings production guides updated

---

## Go-live hardening (2026-07-15)

Production readiness audit for Central + Tenant with Leads & Tasks. Billing and security fixes only — no architecture redesign.

**Critical / High**

- Module cancel now calls Stripe/Creem `cancelSubscription` before local entitlement revoke (prevents silent continued charging)
- Failed webhook logs are reclaimed on provider retry (no permanent swallow after a transient 500)
- Recurring `invoice.payment_succeeded` creates a renewal invoice/payment when the provider transaction id is new
- Cashier `/stripe/webhook` handles `invoice.payment_failed`
- Email verification asserts the user belongs to the current tenant
- Boot refuses `APP_DEBUG=true` in production; HTTPS scheme forced in production; `SecureHeaders` + `TrustProxies`
- Lead CSV export escapes formula injection (`=+-@`)
- Checkout merges admin `gateway_metadata` into Stripe/Creem session metadata
- SPA: Leads/Tasks assignee fetches gated on `users.list` (no spurious 403 toast for staff); assignee fields PermissionGated in create/edit dialogs

**Ops / docs**

- CRM due-notification command applies tenant SMTP runtime config
- Production runbook: cache isolation wording, Creem webhook secret, frontend SPA deploy notes
- Tests: cancel-at-gateway, failed-webhook retry, renewal ledger; marketplace Stripe mocks allow `completedCheckoutEvent`

---

## Creem payment gateway (2026-07-14)

Add Creem as a second provider behind the existing `PaymentGatewayInterface` / `GatewayManager` stack. Stripe behavior is unchanged.

- `CreemGateway` + HTTP `CreemClient`, webhook HMAC verification, provider-neutral `tenant_gateway_customers`
- Config: `config/creem.php` (`CREEM_*` env fallbacks); seed + admin enable/disable/default/config
- Webhooks: `POST /webhooks/gateways/creem` (`creem-signature`) → Billing Engine module activation
- Product mapping uses Creem `prod_…` ids; Central UI credential fields + Creem-specific mapping copy
- Return-URL / “Complete subscription” sync via `confirm-checkout` so paid checkouts activate without a second session when webhooks are delayed
- Docs: `billing/creem.md`; tests: `CreemGatewayTest`, `CreemWebhookTest`, `CreemCheckoutConfirmTest`

---

## Provider-agnostic billing (2026-07-14)

Decouple Modules from Stripe. Stripe is one payment driver; catalog pricing stays on Modules.

- Added `payment_gateway_module_prices` (gateway × module × billing cycle → product/price references)
- Migrated existing `modules.stripe_*` IDs into the mapping table, then dropped those columns
- Added `modules.currency` and `workspace_module_subscriptions.payment_gateway_id`
- `BillingEngine` / `StripeGateway` resolve checkout prices from mappings; consolidated billing skips recurring-gateway subscriptions
- Central API + UI: Module form is catalog-only; **Payment Gateways → Product Mapping** manages provider refs
- Docs: `billing/*`, `architecture/database.md`, `api/central-v1.md`, `admin-ui.md`

---

## RC1 — Production Readiness (2026-07-14)

Release Candidate hardening for paying-customer launch. No new business modules. Official notes: [releases/rc1-production-readiness.md](/deployment/rc1-production-readiness). Recommended tag: `v1.2.0-rc.1`.

**Critical / High**

- Revoke Sanctum tokens on user suspend; reject suspended sessions via `not.suspended`
- Webhook unique idempotency + safe payload summaries; Cashier + gateway ingress share claim store
- Registration defaults off; tenant password-reset URLs include `workspace`
- Impersonation limited to workspace owner role
- SPA query-cache cleared on session switches; email-verify URL allowlist; verified gate treats missing timestamp as unverified
- Board APIs cap per-column payload size; drawer query-param history for leads/tasks

**Ops / a11y**

- Health check probes Redis when used; skip-to-content; billing ErrorState; remember-me default off

---

## Production Hardening Pass (2026-07-13)

Security, ops, and SPA hardening for launch readiness. Platform freeze unchanged (no Features/Plans/Limits reintroduced).

**Critical / High security**

- Block assignment of protected `superadmin` (workspace owner) roles via tenant user APIs
- Central role permission sync filtered to `central-api` guard only
- Gateway webhooks verify signatures before persisting payloads; store safe summaries only
- Branding uploads reject SVG (stored XSS)
- Narrowed `User` / `CentralUser` `$fillable` privileged fields
- CORS origins pinned via `FRONTEND_URL` / `CORS_ALLOWED_ORIGINS` (no `*`)
- Payment API redacts raw `gateway_response` / `webhook_payload`
- Webhook + API rate limiting; schedule `withoutOverlapping`
- SPA: safe post-login redirects, route `RequireAccess` gates, ErrorBoundary, query cache clear on logout

**Ops**

- Notifications implement `ShouldQueue`
- Health `/up` verifies database connectivity
- Production runbook: [architecture/platform-production-runbook.md](/deployment/platform-production-runbook)
- `.env.example` production guidance

---

## Sprint 2 — CRM UX (2026-07-13)

Leads/Tasks UX + notifications + tenant dashboard widgets. Platform freeze unchanged.

**Leads**

- `lead_value` (renamed from `estimated_value`); independent status `active|waiting|on_hold|closed|archived`; priority; assignment history
- Kanban (default) + table; DnD opens drawer, save commits stage; KPIs / board / stats APIs
- Follow-up update/reschedule; export CSV/XLSX (filtered); convert stub (`converted_at`, activity, status closed — Contacts deferred)
- Permissions: `view|create|update|delete|assign|export|convert` (no import); assignee scoping without `leads.assign`

**Tasks**

- `waiting` status; UI labels `open` as To Do; board (default) + list; KPIs / board / stats APIs
- Comments + History tabs; `tasks.change_due_date` required to change `due_at` after create
- Assignee scoping via `tasks.assign`

**Notifications & dashboard**

- Database + mail channels; APIs list / unread-count / mark read / mark all; SPA polls every 25s (Reverb/Echo deferred)
- Hourly `crm:send-due-notifications` for due/overdue follow-ups and tasks
- `GET /dashboard` widget registry gated by module + permission + assignee scope; no calendar widget until Calendar module

**Docs**

- Updated Leads/Tasks guides, database, module-development patterns, tenant UI
- API: [tenant-v1-leads.md](/api/tenant-v1-leads), [tenant-v1-tasks.md](/api/tenant-v1-tasks), [tenant-v1-notifications.md](/api/tenant-v1-notifications), [tenant-v1-dashboard.md](/api/tenant-v1-dashboard)

---

## v1.1.0-platform — Production Ready (2026-07-13)

Platform foundation declared **Production Ready** and **frozen**. No new business modules in this release — hardening only.

Official release document: [releases/v1.1.0-platform.md](/changelog/v1.1.0-platform)  
Git tag: `v1.1.0-platform`

**Verification**

- Pest: **230/230** pass
- Playwright: **69/69** pass (`--workers=1`, all projects: setup, auth, tenant, chromium)
- Manual Cursor browser happy path: Central + Tenant

**Authentication & SPA**

- Auth matrix expanded: Pest + Playwright coverage for lockout messages (includes minutes remaining), remember-me, email verification, registration validation, tenant login, and wrong-workspace rejection
- `VerifyEmailGate` **Sign out** navigates to the context login page after logout

**Billing & gateways**

- `BillingEngine::resolveTenant` falls back to `payment_id` in event metadata when customer/subscription maps are absent
- Gateway webhook failure/cancel Pest coverage

**Validation & settings**

- Central user and module validation Pest; Lead validation; module deactivate gate after uninstall
- System settings runtime asserts: Sanctum expiration, locale, Cashier currency, date/time formats

**E2E stability**

- Focused auth/tenant/central specs; page-object delete/clone assertions; local Playwright `workers: 1`

---

## Product roadmap documented (2026-07-12)

- Added [product-roadmap.md](/getting-started/product-roadmap): CRM → Sales → Billing → Purchasing → Inventory → Finance → HR → future expansion
- Linked from README and platform-freeze docs
- Phase 1 CRM: Leads + Tasks complete; Contacts / Companies / Calendar / Activities next

---

## Tasks module (2026-07-12)

**Architecture**

- Second product module; mirrors Leads (flat Laravel, `module:tasks` + Spatie RBAC)
- Functional differences only: status/priority/complete vs stages/follow-ups

**Backend**

- Tables: `tasks`, `task_notes`, `task_activities`
- `TaskService`, events/subscriber (audit + assignment mail), tenant API routes
- Permissions: `tasks.view|create|update|delete|assign|complete`
- Pest: `tests/Feature/Tenant/Task/TaskTest.php`

**Frontend**

- Tasks list / form dialog / detail drawer; nav gated by module + permission
- Playwright: `npm run test:e2e:tasks` (`--project=tenant`)

**Docs**

- [modules/tasks.md](/user-guide/tasks-overview) (+ user / developer / production)
- [api/tenant-v1-tasks.md](/api/tenant-v1-tasks)

---

## Leads reference module (2026-07-12)

**Architecture**

- First product module on the frozen foundation; blueprint for Tasks and later modules
- Flat Laravel layout (no Modules package); `module:leads` + Spatie RBAC
- Pipeline-ready domain: stages, status workflow, assignment, notes, follow-ups, timeline

**Backend**

- Tables: `lead_stages`, `leads`, `lead_notes`, `lead_follow_ups`, `lead_activities`
- `LeadService`, events/subscriber (audit + mail notifications), tenant API routes
- Permissions: `leads.view|create|update|delete|assign`
- Auth payload includes `modules[]` for SPA entitlement gating
- Pest: `tests/Feature/Tenant/Lead/LeadTest.php`

**Frontend**

- Leads list / form dialog / detail drawer; nav gated by module + permission
- Playwright: `npm run test:e2e:leads` (`--project=tenant`)

**Docs**

- [modules/leads.md](/user-guide/leads-overview) (+ user / developer / production)
- [api/tenant-v1-leads.md](/api/tenant-v1-leads)

---

## Platform Freeze & Module Development Standard (2026-07-12)

**Architecture**

- Platform foundation locked — no redesign of Auth, Tenancy, RBAC, Billing, Marketplace, Settings, or Gateway architecture except critical security / data-integrity / production bugs
- Official [Module Development Standard](/developer-guide/module-development): flat Laravel layout, catalog + `module:` + Spatie permissions, audit + activity logging, Pest + Playwright, docs DoD
- Cursor rules added in Backend and Frontend (`.cursor/rules/platform-freeze.mdc`, `module-development.mdc`)
- **Leads** designated as the reference business module; future modules must mirror it

**Docs**

- [architecture/platform-freeze.md](/getting-started/platform-freeze)
- [modules/module-development.md](/developer-guide/module-development) (+ developer / production)

---

## Production Hardening (2026-07-12)

**Authentication**

- Shared tenant `/login` with Workspace field (slug/domain); `/central/login` isolated for platform admins
- Server-owned workspace resolution: host → bearer token → `workspace` input; fail-closed without context
- Email verification enforced for Central and Tenant (`verified` middleware + SPA verify pages)
- Sanctum token TTL wired to `session_lifetime_minutes`; Remember Me extends TTL; login lockout after failed attempts
- Removed client tenant persistence (`tenantStorage` / `VITE_DEFAULT_TENANT_DOMAIN`)

**Provisioning & tenancy**

- Central workspace create always requires an Owner; settings defaults and default role permissions seeded
- Suspended/archived workspaces denied at the API edge

**Security, payments, impersonation, audit**

- Tenant setting cache keys namespaced; isolation Pest coverage
- Stripe webhook signature verification + idempotency; payment matching by metadata; PaymentAttempt logging
- Impersonation issues real tenant tokens with timeout, banner, and revoke-on-end
- Broader PlatformAuditService coverage (auth, workspace, users, roles, settings, modules)

**Client / docs**

- Currency, date/time, locale, and timezone formatters consume bootstrap settings; SPA idle logout
- Authentication / tenancy docs updated for hybrid resolution and custom-domain readiness

---

## Manual QA — Production Readiness Fixes (2026-07-12)

**Backend**

- `DomainRule` now accepts platform hostnames including `tenant.localhost` and `tenant.myapp.com` (previously required three labels and rejected local domains)
- Central `RoleService` lists only `central-api` roles (orphaned `tenant-api` rows no longer leak into Central Users/Roles UI)
- Central role create always sets `guard_name=central-api` and scopes uniqueness to that guard
- `InitializeTenancy` re-resolves and switches tenant per request when the domain/header changes
- New `tenant.user` middleware rejects Sanctum tokens used against a different workspace (`EnsureTenantUserBelongsToCurrentTenant`)
- Pest: `DomainRuleTest`, `RoleListIsolationTest`, `TenantTokenIsolationTest`

**Frontend**

- Tenant form shows domain validation errors and uses `tenant.localhost` placeholder
- Timezone options always include `UTC` so the default value displays correctly

---

## Tenant Users, Roles & Permissions (RBAC)

**Backend**

- Per-workspace roles via `roles.tenant_id` (no Spatie teams); permissions remain shared `tenant-api` vocabulary
- Expanded `config/tenant-permissions.php` (users, roles, settings, leads, tasks)
- Tenant User + Role APIs: CRUD, suspend, password change, clone, permissions matrix
- Owner (`superadmin`) bootstrap with full permissions; protected default roles
- Legacy backfill: `php artisan tenants:isolate-roles` (+ lazy ensure on Users/Roles APIs)
- Pest: user/role CRUD, permission assignment, authorization, workspace isolation, legacy backfill

**Frontend**

- Tenant `/users`, `/roles`, `/roles/matrix` reusing Central pages with workspace-aware copy and routes
- Administration nav: Users / Roles (permission-gated)
- Playwright: `npm run test:e2e:tenant-rbac`

**Docs**

- `authorization/tenant-rbac*.md` — architecture, user guide, production security

---

## Tenant Branding & Configuration

**Backend**

- `TenantSettingService` resolves workspace settings with hierarchy: tenant override → tenant profile → Central → system default
- Tenant Settings API: list/update, branding upload, test mail, public bootstrap
- SMTP passwords encrypted; runtime mail uses tenant SMTP when `mail_host` is set, otherwise Central
- Branding assets stored under `tenants/{uuid}/branding/…`
- Permissions: `settings.list`, `settings.update`
- Pest coverage for resolver + API

**Frontend**

- Tenant Settings page (`/settings`) — General, Branding, Mail with searchable selects, color picker, uploads
- Settings store bootstraps resolved tenant branding when a workspace domain is known
- Playwright: `npm run test:e2e:tenant-settings`

**Docs**

- `settings/tenant-settings*.md` — hierarchy, SMTP, storage, security

---

## Tenant Application UI Foundation

**Frontend**

- Tenant protected routes now use the shared `AppLayout` shell (Sidebar, Topbar, Breadcrumbs, Command Palette, User Menu)
- Context-aware navigation: `centralNavigationGroups` vs `tenantNavigationGroups`
- Tenant sidebar: Dashboard, Leads, Tasks, Settings, Profile
- Tenant dashboard redesigned as layout-matched placeholders (welcome, workspace info, modules, activity, quick actions)
- Leads / Tasks / Tenant Settings reserved via `PlaceholderPage`
- Shared Profile page works on both `/profile` and `/central/profile`

**Docs**

- Shared layout developer + tenant user guides
- Architecture note for shared design system / layout reuse

---

## Tenant Authentication Foundation

**Backend**

- Self-service registration creates workspace owner, default roles/permissions, and returns a tenant Sanctum token
- Password reset emails point at SPA routes via `FRONTEND_URL`
- Tenant dashboard placeholder returns workspace + installed modules
- Email verification architecture prepared (`MustVerifyEmail` + signed verify/resend routes)
- Impersonation helper reserved for future tenant token handoff

**Frontend**

- Tenant auth at `/login`, `/register`, `/forgot-password`, `/reset-password/{token}`
- Central auth moved under `/central/*` with isolated token storage
- Tenant dashboard placeholder for auth/impersonation verification

**Docs / tests**

- Authentication developer, user, and production guides
- Pest coverage for tenant auth; Playwright auth suites updated for `/central` + tenant flows

---

## Features layer removed — module licensing + Spatie authorization

Licensing and authorization are fully decoupled.

**Architecture**

- Removed Features catalog (model, API, UI, entitlements `features[]`, `features.*` permissions, `features` table)
- Modules remain pure licensing products via `workspace_module_subscriptions`
- User access stays on Spatie Roles & Permissions
- Tenant gating: `module:{slug}` (licensing) then `can:{permission}` (authorization)
- Entitlements payload is now `{ core, modules }` only
- Default modules unchanged: Leads + Tasks (free, included, non-removable)

**Backend**

- `EnsureModule` middleware replaces `EnsureModuleFeature`
- Catalog seeder no longer creates Feature rows
- Migration drops `features` table

**Frontend**

- Features admin page, nav, API client, and Playwright suite removed
- Marketplace / tenant details no longer show feature badges

---

## Payment Gateway Management

Gateway-agnostic payment provider management for Central Billing.

**Architecture**

- Billing Engine talks only to `PaymentGatewayInterface` via `GatewayManager`
- Stripe/Cashier isolated inside `StripeGateway`; arch tests enforce isolation
- Admin APIs for enable/disable/default/config/mode/test/webhooks/logs/capabilities
- Encrypted gateway credentials; secrets never returned to the frontend
- Generic webhook ingress `POST /webhooks/gateways/{code}` + Cashier Stripe route

**Schema**

- Expanded `payment_gateways` (mode, encrypted config, webhook/test metadata)
- Added `payment_attempts`, `gateway_logs`, `webhook_logs`
- `payment_methods` remains the workspace preferred-method store

**Frontend**

- Top-level **Billing** nav: Dashboard, Invoices, Payments, Transactions, Refunds, Payment Methods, Payment Gateways, Coupons, Taxes, Billing Logs
- Full Payment Gateways management UI (configure Stripe fields, sandbox/live, test connection, logs)

**Docs**

- `billing/payment-gateways.md` (+ developer/user/production/webhooks guides)
- Updated `billing-engine.md` and `stripe-cashier.md`

---

## Central Application Settings refactor

Rebuilt system settings so every key is validated and consumed at runtime.

**Backend**

- Expanded mail/security/branding/localization settings; removed unused placeholders (`primary_color`, feature-flag duplicates, display-only queue/disk keys)
- Runtime config overlay (app name, timezone, locale, session lifetime, mail From/SMTP, Cashier currency)
- Encrypted `mail_password`, branding file uploads, test-mail endpoint
- Public bootstrap + self-service workspace registration gated by `registration_enabled`
- Tenant-only maintenance middleware (`tenant.available`); Central stays fully operational
- Centralized `PasswordRule` / `Password::defaults()` from security settings
- Support email + company name injected into tenant-facing auth emails

**Frontend**

- Settings UI rebuilt with SearchableSelect for timezone/locale/currency/formats
- App title, sidebar, button color CSS vars, favicon/logo from public settings
- App-wide date/time helpers; registration-closed and branded maintenance pages

**Tests / docs**

- Expanded Pest settings suite; Playwright settings coverage for registration-closed + maintenance copy
- Added Settings user / developer / production guides under `settings/`
- Updated API, admin UI, database, and testing docs

---

## Tenant form cleanup

Removed `owner_id` and `address` from the `tenants` schema and admin UI. Timezone, currency, country, and locale are searchable selects. Logo is an image upload (`logo` file field → `logo_path` / `logo_url`).

---

## Central QA stabilization (Playwright)

Stabilized the Central Application with a full Playwright pass before further Tenant Application work.

**Fixed**

- Logout now revokes only the current Sanctum token (was deleting all tokens and breaking parallel E2E sessions)
- Dashboard growth/revenue series API keys aligned to frontend contract (`count`, `amount`) — removed chart `NaN` display
- Settings E2E opens the Billing tab before toggling trial flags
- Auth greeting assertion matches time-based welcome copy
- Roles cleanup searches before deleting the original role after clone

**Added (Playwright)**

- Module suites: marketplace, billing, impersonation, permissions, profile
- Per-module npm scripts (`test:e2e:marketplace`, `test:e2e:billing`, …)
- Smoke coverage for Marketplace route

**Docs**

- Updated `testing/playwright.md` and Frontend `docs/testing/PLAYWRIGHT.md`

---

## Modular foundation complete (Phases 1–6)

Delivered marketplace APIs, Billing Engine, impersonation, and the financial ledger on top of the module-licensing foundation.

**Added**

- Marketplace: `GET /marketplace/modules`, `GET /marketplace/modules/{module}` (published catalog, dependency hints, `?tenant_id=` install state)
- Module subscriptions: `GET /module-subscriptions`, show, `POST …/cancel`, `POST …/deactivate`; `POST /tenants/{tenant}/modules` (install)
- Billing Engine (`BillingEngine`, `GatewayManager`, `ManualGateway`, `StripeGateway`, `ProrationCalculator`)
- Consolidated billing: `php artisan billing:run-consolidated` (scheduled daily); one invoice per workspace billing cycle for all billable active modules
- Financial ledger tables + read APIs: `invoices`, `invoice_items`, `payments`, `payment_transactions`, `payment_gateways`, `payment_methods`, `billing_addresses`, `taxes`, `coupons`, `refunds`, `credit_notes`
- Impersonation: `impersonation_sessions` table; `POST /tenants/{tenant}/impersonate`, `POST /impersonation/{id}/end`
- Permissions: `module-subscriptions.*`, `invoices.*`, `payments.*`, `impersonation.*`

**Admin UI**

- Marketplace browse screen
- Tenant details tabs: Overview | Modules | Billing; impersonate action with reason prompt
- Module catalog form retains marketplace pricing fields

**Unchanged from prior entry**

- Plans removed; Leads + Tasks remain default-included, non-billable
- `workspace_module_subscriptions` is licensing SoT; Cashier/Stripe is a gateway driver only

---

## Module licensing foundation (Plans removed)

Replaced plan-based licensing with workspace module subscriptions.

**Removed**

- Plans, plan modules/features/limits, limit definitions, usage counters
- Plan-based `tenant_subscriptions` / `subscription_events`
- Central API/UI for plans, limits, and tenant-subscriptions
- `default_plan_id` system setting

**Added**

- Module catalog fields: `uuid`, pricing, `trial_days`, `version`, `status`, `is_default_included`, `is_billable`, Stripe price IDs
- `module_categories`, `module_dependencies`
- `workspace_module_subscriptions` + history
- Workspace billing profile: `billing_anchor_day`, `billing_cycle`, `proration_mode`, `next_billing_at`
- `EntitlementService` + `GET /tenants/{tenant}/entitlements`
- `config/core-platform.php` for always-on platform capabilities
- Catalog seed: **Leads** and **Tasks** only (included, non-billable)
- New workspaces auto-install Leads + Tasks (`source=included`, not cancellable by owners)

---

## Prior: Central SaaS Platform completion

See git history for the earlier plan-based Central Platform delivery notes (tenants, users, roles, Cashier scaffolding, dashboard). That licensing model has been superseded.

