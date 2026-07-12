# Central API v1

Base path: `/api/central/v1`

Auth: Sanctum bearer token, guard `central-api`.

Authorization: Spatie permissions + policies. The `superadmin` role bypasses all gates.

Response envelope on every endpoint:

```json
{ "status": "success" | "error", "message": "...", "data": { } | [ ] | null, "meta": { } | null }
```

Paginated list endpoints populate `meta` (`current_page`, `last_page`, `per_page`, `total`, `next_page_url`, `prev_page_url`); single-resource endpoints set `meta: null`.

## Auth & profile

| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/login` | Throttled (`throttle:auth-login`, 5/min by email or IP) |
| POST | `/auth/forgot-password` | |
| POST | `/auth/reset-password` | Body: `email`, `token`, `password`, `password_confirmation` |
| GET | `/me` | Current user + roles/permissions |
| POST | `/me` | Update profile |
| POST | `/me/change-password` | |
| POST | `/me/logout` | Revokes tokens |
| GET | `/dashboard` | Platform stats — permission `dashboard.view`; see [Dashboard payload](#dashboard-payload) |

## Platform

### Tenants

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| GET | `/tenants` | `tenants.list` | |
| POST | `/tenants` | `tenants.create` | Provisions default modules — see [tenant provisioning](../workflows/tenant-provisioning.md) |
| GET | `/tenants/{tenant}` | `tenants.read` | Includes `installed_modules` when loaded |
| PUT/PATCH | `/tenants/{tenant}` | `tenants.update` | |
| DELETE | `/tenants/{tenant}` | `tenants.delete` | Soft delete |
| POST | `/tenants/{tenant}/restore` | `tenants.restore` | Also restores the tenant's soft-deleted users and domains |
| DELETE | `/tenants/{tenant}/force` | `tenants.force.delete` | Force-deletes users, domains, module subscriptions, then the tenant |
| POST | `/tenants/{tenant}/archive` | `tenants.archive` | Sets `archived_at`; independent of soft delete |
| POST | `/tenants/{tenant}/unarchive` | `tenants.archive` | Clears `archived_at` |
| GET | `/tenants/{tenant}/entitlements` | `tenants.read` | `{ core, modules, features }` |
| POST | `/tenants/{tenant}/modules` | `module-subscriptions.create` | Install module — body: `module_id`, optional `billing_cycle` |
| GET | `/tenants/{tenant}/invoices` | `invoices.list` | Paginated workspace invoices |
| GET | `/tenants/{tenant}/payments` | `payments.list` | Paginated workspace payments |
| POST | `/tenants/{tenant}/impersonate` | `impersonation.start` | Body: `reason` (required, 5–1000 chars) |

Tenant create/update body: `company_name`, `workspace_name?`, `slug?`, `email`, `phone?`, `logo_path?`, `address?`, `notes?`, `domain?`, `owner_id?`, `status?`, `timezone?`, `currency?`, `country?`, `locale?`.

### Users

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| POST | `/users/invite` | `users.invite` | Creates the user, assigns roles, emails an invite, sets `invite_token`/`invite_sent_at` |
| GET | `/users` | `users.list` | |
| POST | `/users` | `users.create` | |
| GET | `/users/{user}` | `users.read` (or self) | |
| PUT/PATCH | `/users/{user}` | `users.update` | |
| DELETE | `/users/{user}` | `users.delete` | |
| POST | `/users/{user}/restore` | `users.restore` | |
| DELETE | `/users/{user}/force` | `users.force.delete` | |
| POST | `/users/{user}/suspend` | `users.suspend` | |
| POST | `/users/{user}/unsuspend` | `users.unsuspend` | |
| POST | `/users/{user}/change-password` | `users.reset-password` | |
| GET | `/users/{user}/activity` | `users.read` (or self) | Up to 50 recent `spatie/laravel-activitylog` entries for the user |

Invite body: `name`, `email`, `phone?`, `role[]` (role names, at least one).

Create/update body adds: `phone?`, `avatar_path?`, `password` (create), `role[]`.

### Roles

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| GET | `/roles/permissions-matrix` | `roles.list` | All permissions grouped by prefix, with the list of role names holding each one |
| GET | `/roles` | `roles.list` | |
| POST | `/roles` | `roles.create` | |
| GET | `/roles/{role}` | `roles.read` | Returns the role plus every permission with an `is_assigned` flag |
| PUT/PATCH | `/roles/{role}` | `roles.update` | Body: `name`, `permissions[]` (permission IDs) |
| DELETE | `/roles/{role}` | `roles.delete` | Blocked for protected roles (`config('central-protected-roles')`) |
| POST | `/roles/{role}/clone` | `roles.clone` | Copies all permissions to a new role; optional `name` in body, otherwise auto-generated |

`permissions-matrix` response shape: `[{ "id", "name", "group", "roles": ["admin", "manager", ...] }]`, where `group` is the permission name's prefix before the first `.` (e.g. `tenants` for `tenants.archive`).

## Catalog (admin)

| Resource | Paths | Notes |
|----------|-------|-------|
| Modules | CRUD + restore/force | Full catalog admin. Fields include `uuid`, pricing, `status`, `is_default_included`, `is_billable`, Stripe price IDs |
| Features | CRUD + restore/force (`?module_id=`) | Belong to a module; never sold separately |

Default-included modules (Leads, Tasks) cannot be deleted while marked `is_default_included`. Modules with workspace subscriptions cannot be deleted until those subscriptions are removed.

Module create/update accepts optional Stripe price IDs (manual mapping only — the API never creates Stripe products/prices).

## Marketplace

Published modules only. Permission: `modules.list` / `modules.read`.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/marketplace/modules` | Paginated; filters: `search`, `category_id` |
| GET | `/marketplace/modules/{module}` | Detail + `already_installed`, `required_modules`, `optional_modules`, `missing_required_modules`; optional `?tenant_id=` |

Install for a workspace: `POST /tenants/{tenant}/modules` (not a separate marketplace purchase endpoint).

## Module subscriptions

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| GET | `/module-subscriptions` | `module-subscriptions.list` | Filters: `tenant_id`, `status`, `source` |
| GET | `/module-subscriptions/{module_subscription}` | `module-subscriptions.read` | Includes `module`, `tenant`, `history` |
| POST | `/module-subscriptions/{module_subscription}/cancel` | `module-subscriptions.update` | Purchased modules only; included modules rejected |
| POST | `/module-subscriptions/{module_subscription}/deactivate` | `module-subscriptions.deactivate` | Platform-admin suspend (works on included modules) |

## Financial ledger (read-only)

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| GET | `/invoices` | `invoices.list` | Platform-wide paginated list |
| GET | `/invoices/{invoice}` | `invoices.read` | Includes `tenant`, `items`, `payments` |
| GET | `/payments` | `payments.list` | Platform-wide paginated list |
| GET | `/payments/{payment}` | `payments.read` | Includes `tenant`, `invoice`, `transactions` |

Tenant-scoped lists: `GET /tenants/{tenant}/invoices`, `GET /tenants/{tenant}/payments`.

Invoices are created by the Billing Engine (consolidated run or purchase settlement) — no public write endpoints.

## Impersonation

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| POST | `/tenants/{tenant}/impersonate` | `impersonation.start` | Creates session; audits reason, IP, user-agent |
| POST | `/impersonation/{impersonation}/end` | `impersonation.end` (or session owner) | Sets `ended_at`, `duration_seconds` |

Returns session metadata only — tenant-app login token exchange is out of scope for Central v1.

## Stripe webhook

| Method | Path | Notes |
|--------|------|-------|
| POST | `/stripe/webhook` | **Not** under `/api/central/v1`. Path is `config('cashier.path')` + `/webhook` (default `/stripe/webhook`). |

Handled by `StripeWebhookController` → Cashier mirror + `BillingEngine::handleGatewayEvent()`.

## System

| Method | Path | Notes |
|--------|------|-------|
| GET | `/system-settings` | All settings |
| PUT | `/system-settings` | `{ "settings": { "key": value \| { value, type, group } } }` |

Settings groups: `general`, `localization`, `mail`, `branding`, `security`, `maintenance`, `billing`, `feature_flags`. Billing keys include `invoice_prefix`, `proration_mode`, `default_payment_gateway`, `trial_enabled`, `stripe_enabled`, `stripe_webhook_configured`.

## Dashboard payload

`GET /dashboard` returns workspace stats, module subscription status counts, revenue (MRR from billable active subscriptions), growth series, recent tenants, recent module subscriptions, recent activities.

Series shapes (frontend contract):

- `growth[]`: `{ month: "YYYY-MM", count: number }`
- `revenue_series[]`: `{ month: "YYYY-MM", amount: number }` (zeros until paid modules exist)

## Permissions

Seeded by `Database\Seeders\Central\PermissionsSeeder`, guard `central-api`.

| Group | Permissions |
|-------|-------------|
| `users` | `list`, `create`, `read`, `update`, `delete`, `restore`, `force.delete`, `suspend`, `unsuspend`, `invite`, `reset-password` |
| `tenants` | `list`, `create`, `read`, `update`, `delete`, `restore`, `force.delete`, `archive` |
| `roles` | `list`, `create`, `read`, `update`, `delete`, `clone` |
| `dashboard` | `view` |
| `billing` | `manage` |
| `modules` | `list`, `create`, `read`, `update`, `delete`, `restore`, `force.delete` |
| `features` | `list`, `create`, `read`, `update`, `delete`, `restore`, `force.delete` |
| `module-subscriptions` | `list`, `create`, `read`, `update`, `delete`, `deactivate` |
| `invoices` | `list`, `read`, `update` |
| `payments` | `list`, `read`, `update` |
| `impersonation` | `start`, `end`, `list` |
| `system-settings` | `list`, `update` |

## Removed

- `/plans`, `/plans/{plan}/modules|features|limits`
- `/limit-definitions`
- `/tenant-subscriptions` (+ cancel/resume/suspend)
- `/subscriptions`, `/setting-definitions`

## Artisan

| Command | Notes |
|---------|-------|
| `billing:run-consolidated` | Daily scheduled; invoices all due workspaces |

Postman: `SaaS-Backend/.docs/postman/Central.postman_collection.json` (refresh after API changes).
