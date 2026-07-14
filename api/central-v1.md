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
| GET | `/tenants/{tenant}/entitlements` | `tenants.read` | `{ core, modules }` — licensing only |
| POST | `/tenants/{tenant}/modules` | `module-subscriptions.create` | Install module — body: `module_id`, optional `billing_cycle` |
| GET | `/tenants/{tenant}/invoices` | `invoices.list` | Paginated workspace invoices |
| GET | `/tenants/{tenant}/payments` | `payments.list` | Paginated workspace payments |
| POST | `/tenants/{tenant}/impersonate` | `impersonation.start` | Body: `reason` (required, 5–1000 chars) |

Tenant create/update body: `company_name`, `workspace_name?`, `slug?`, `email`, `phone?`, `logo?` (image upload), `notes?`, `domain?`, `status?`, `timezone?`, `currency?`, `country?`, `locale?`. Multipart form-data is supported for logo uploads. Response includes `logo_path` and `logo_url`.

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
| Modules | CRUD + restore/force | Full catalog admin. Fields include `uuid`, pricing (`monthly_price`, `yearly_price`, `currency`), `status`, `is_default_included`, `is_billable` — **no** payment-provider IDs |

Default-included modules (Leads, Tasks) cannot be deleted while marked `is_default_included`. Modules with workspace subscriptions cannot be deleted until those subscriptions are removed.

Provider price mappings are managed under Payment Gateways (`GET/PUT /payment-gateways/{id}/module-prices`), not on Modules. Features catalog has been removed — modules are licensing products; Spatie permissions handle authorization.

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

## Payment gateways

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| GET | `/payment-gateways` | `payment-gateways.list` | List providers |
| GET | `/payment-gateways/{id}` | `payment-gateways.read` | Redacted config (secrets never returned) |
| POST | `/payment-gateways/{id}/enable` | `payment-gateways.update` | |
| POST | `/payment-gateways/{id}/disable` | `payment-gateways.update` | Rejects if default |
| POST | `/payment-gateways/{id}/default` | `payment-gateways.update` | Syncs `default_payment_gateway` setting |
| PUT | `/payment-gateways/{id}/config` | `payment-gateways.update` | Merge encrypted credentials |
| PUT | `/payment-gateways/{id}/mode` | `payment-gateways.update` | `sandbox` \| `live` |
| POST | `/payment-gateways/{id}/test-connection` | `payment-gateways.update` | Driver probe |
| GET | `/payment-gateways/{id}/webhook-status` | `payment-gateways.read` | |
| GET | `/payment-gateways/{id}/logs` | `payment-gateways.read` | Operational logs |
| GET | `/payment-gateways/{id}/webhook-logs` | `payment-gateways.read` | |
| GET | `/payment-gateways/{id}/capabilities` | `payment-gateways.read` | Capabilities + currencies + `requires_product_mapping` |
| GET | `/payment-gateways/{id}/module-prices` | `payment-gateways.read` | Gateway ↔ module product/price mappings |
| PUT | `/payment-gateways/{id}/module-prices` | `payment-gateways.update` | Replace mappings (`{ mappings: [...] }`); 422 if gateway does not require mapping |

Also accepts `billing.manage` as an alternate permission.

## Impersonation

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| POST | `/tenants/{tenant}/impersonate` | `impersonation.start` | Creates session; audits reason, IP, user-agent |
| POST | `/impersonation/{impersonation}/end` | `impersonation.end` (or session owner) | Sets `ended_at`, `duration_seconds` |

Returns session metadata only — tenant-app login token exchange is out of scope for Central v1.

## Stripe / gateway webhooks

| Method | Path | Notes |
|--------|------|-------|
| POST | `/stripe/webhook` | Cashier-compatible path (`config('cashier.path')` + `/webhook`) |
| POST | `/webhooks/gateways/{code}` | Gateway-agnostic ingress for all drivers |

**Not** under `/api/central/v1`. Both normalize via `PaymentGatewayInterface::parseWebhook()` into `BillingEngine`. Stripe Cashier route additionally syncs Cashier mirror tables.

## System

| Method | Path | Notes |
|--------|------|-------|
| GET | `/public/settings` | Unauthenticated bootstrap (branding, formats, registration/maintenance flags). No secrets. |
| POST | `/public/register-workspace` | Self-service workspace create when `registration_enabled`; otherwise `403` with dedicated message |
| GET | `/system-settings` | All admin settings (`mail_password` masked) |
| PUT | `/system-settings` | `{ "settings": { "key": value } }` — per-key validation |
| POST | `/system-settings/test-mail` | `{ "email": "…" }` — sends test mail using runtime SMTP config |
| POST | `/system-settings/branding/{logo\|favicon}` | Multipart `file` upload → stores via `FileUploadService` on the configured uploads disk |

Settings groups: `general`, `localization`, `mail`, `branding`, `security`, `maintenance`, `billing`.

### Consumed keys

| Group | Keys | Runtime use |
|-------|------|-------------|
| general | `app_name`, `company_name`, `timezone`, `locale`, `currency`, `registration_enabled` | App title/config, tenant defaults, self-service registration |
| localization | `date_format`, `time_format` | Central SPA formatters |
| mail | `mail_driver`, `mail_host`, `mail_port`, `mail_username`, `mail_password` (encrypted), `mail_encryption`, `mail_from_name`, `mail_from_address` | Laravel mail config + From identity |
| branding | `button_color`, `support_email`, `logo_path`, `favicon_path` | SPA CSS/`document.title`/sidebar; support footer on tenant-facing emails |
| security | `session_lifetime_minutes`, `password_min_length`, `password_require_special` | Session lifetime; centralized `PasswordRule` / `Password::defaults()` |
| maintenance | `maintenance_mode`, `maintenance_message`, `maintenance_eta` | **Tenant Application only** (`tenant.available` middleware). Central stays up. |
| billing | `invoice_prefix`, `proration_mode`, `default_payment_gateway`, `trial_enabled`, `stripe_enabled`, `stripe_webhook_configured` | Billing engine / invoices |

Removed: `primary_color`, `feature_registration`, `feature_invites`, `queue_connection_display`, `filesystem_disk`.

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
| `module-subscriptions` | `list`, `create`, `read`, `update`, `delete`, `deactivate` |
| `invoices` | `list`, `read`, `update` |
| `payments` | `list`, `read`, `update` |
| `impersonation` | `start`, `end`, `list` |
| `system-settings` | `list`, `update` |

## Removed

- `/features` (+ restore/force)
- `/plans`, `/plans/{plan}/modules|features|limits`
- `/limit-definitions`
- `/tenant-subscriptions` (+ cancel/resume/suspend)
- `/subscriptions`, `/setting-definitions`

## Artisan

| Command | Notes |
|---------|-------|
| `billing:run-consolidated` | Daily scheduled; invoices all due workspaces |

Postman: `SaaS-Backend/.docs/postman/Central.postman_collection.json` (refresh after API changes).

