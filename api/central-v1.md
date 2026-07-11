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
| POST | `/tenants` | `tenants.create` | |
| GET | `/tenants/{tenant}` | `tenants.read` | Includes usage summary keyed by limit `key` |
| PUT/PATCH | `/tenants/{tenant}` | `tenants.update` | |
| DELETE | `/tenants/{tenant}` | `tenants.delete` | Soft delete |
| POST | `/tenants/{tenant}/restore` | `tenants.restore` | Also restores the tenant's soft-deleted users and domains |
| DELETE | `/tenants/{tenant}/force` | `tenants.force.delete` | Force-deletes users, domains, tenant subscriptions, then the tenant |
| POST | `/tenants/{tenant}/archive` | `tenants.archive` | Sets `archived_at`; independent of soft delete |
| POST | `/tenants/{tenant}/unarchive` | `tenants.archive` | Clears `archived_at` |

Tenant create/update body: `company_name`, `workspace_name?`, `slug?`, `email`, `phone?`, `logo_path?`, `address?`, `notes?`, `domain?`, `owner_id?`, `status?`, `timezone?`, `currency?`, `country?`, `locale?`.

On create, the API assigns the default plan and trial window (see [tenant provisioning](../workflows/tenant-provisioning.md)).

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

## Catalog

| Resource | Paths | Notes |
|----------|-------|-------|
| Modules | CRUD + restore/force | |
| Features | CRUD + restore/force (`?module_id=`) | |
| Limit definitions | CRUD | |
| Plans | CRUD + restore/force | See [Stripe fields](#plans-stripe-fields) |
| Plan modules | `GET/PUT /plans/{plan}/modules` body `{ "module_ids": [] }` | Grants all active features of included modules |
| Plan features | `GET/PUT /plans/{plan}/features` body `{ "feature_ids": [] }` | Per-feature override, independent of `plan_modules` — see [entitlements.md](../architecture/entitlements.md) |
| Plan limits | `GET/PUT /plans/{plan}/limits` body `{ "limits": [{ "limit_definition_id", "value": null }] }` | |

`value: null` on a plan limit means **unlimited**.

### Plans: Stripe fields

Plan create/update body accepts `stripe_product_id?`, `stripe_monthly_price_id?`, `stripe_yearly_price_id?` (all nullable strings), plus `is_popular?` (boolean). These are **manually entered** IDs of Stripe objects that already exist — the API never calls Stripe to create products or prices. See [billing/stripe-cashier.md](../billing/stripe-cashier.md).

## Tenant subscriptions

| Method | Path | Permission | Notes |
|--------|------|-------------|-------|
| GET/POST/PUT/DELETE | `/tenant-subscriptions` + `/{tenant_subscription}` | `tenant-subscriptions.*` | Standard CRUD |
| POST | `/tenant-subscriptions/{tenant_subscription}/restore` | `tenant-subscriptions.restore` | |
| DELETE | `/tenant-subscriptions/{tenant_subscription}/force` | `tenant-subscriptions.force.delete` | |
| POST | `/tenant-subscriptions/{tenant_subscription}/cancel` | `tenant-subscriptions.update` | Delegates to `BillingService`; cancels on Stripe too when `provider = 'stripe'` |
| POST | `/tenant-subscriptions/{tenant_subscription}/resume` | `tenant-subscriptions.update` | Delegates to `BillingService`; resumes on Stripe too when applicable |
| POST | `/tenant-subscriptions/{tenant_subscription}/suspend` | `tenant-subscriptions.update` | Local status change only, no Stripe API call |

Create/update body: `tenant_id`, `plan_id`, `status` (`trial`\|`active`\|`expired`\|`cancelled`\|`suspended`), `billing_cycle?` (`monthly`\|`yearly`), `trial_starts_at?`, `trial_ends_at?`, `starts_at?`, `ends_at?`, `provider?`, `provider_subscription_id?`, `meta?`. Status transitions are validated against an allowed-transition map.

`GET /tenant-subscriptions/{tenant_subscription}` includes the tenant, plan (with modules/features/limits), and its `subscription_events` timeline.

Cancel/resume/suspend/create/update all append a row to `subscription_events` (`event`, `description`, `meta`).

## Stripe webhook

| Method | Path | Notes |
|--------|------|-------|
| POST | `/stripe/webhook` | **Not** under `/api/central/v1`. Path is `config('cashier.path')` + `/webhook` (default `stripe`, i.e. `/stripe/webhook`). Route name `cashier.webhook`. Signature-verified via Cashier's `VerifyWebhookSignature` when `STRIPE_WEBHOOK_SECRET` is set. |

Handled by `StripeWebhookController` (extends Cashier's `WebhookController`). On `customer.subscription.created|updated|deleted`, after Cashier's own handling it calls `BillingService::syncFromStripe()` to map the Stripe subscription status onto the matching tenant's `tenant_subscriptions` row (matched by `stripe_id`) and records a `subscription_events` entry. See [billing/stripe-cashier.md](../billing/stripe-cashier.md) for the full status mapping.

## System

| Method | Path | Notes |
|--------|------|-------|
| GET | `/system-settings` | All settings |
| PUT | `/system-settings` | `{ "settings": { "key": value \| { value, type, group } } }` |

Settings are grouped for the admin UI (`general`, `localization`, `mail`, `branding`, `security`, `maintenance`, `billing`, `feature_flags`). Keys include `default_plan_id`, `registration_enabled`, `trial_enabled`, `maintenance_mode`, `maintenance_message`, `company_name`, `app_name`, `timezone`, `currency`, `locale`, `date_format`, `time_format`, `mail_from_name`, `mail_from_address`, `primary_color`, `support_email`, `logo_path`, `favicon_path`, `session_lifetime_minutes`, `password_min_length`, `password_require_special`, `invoice_prefix`, `stripe_enabled`, `stripe_webhook_configured`, `feature_registration`, `feature_invites`.

## Dashboard payload

`GET /dashboard` returns:

```json
{
  "stats": {
    "total_tenants": 0, "active_tenants": 0, "suspended_tenants": 0,
    "archived_tenants": 0, "expired_tenants": 0, "total_users": 0
  },
  "subscriptions": { "active": 0, "trial": 0, "cancelled": 0, "suspended": 0, "expired": 0 },
  "revenue": { "mrr": 0.00, "arr": 0.00, "monthly_revenue": 0.00 },
  "growth": [ { "month": "2026-01", "count": 0 } ],
  "revenue_series": [ { "month": "2026-01", "amount": 0.00 } ],
  "recent_tenants": [ { "id": "uuid", "company_name": "", "workspace_name": null, "slug": "", "email": "", "status": "active", "created_at": "..." } ],
  "recent_subscriptions": [ { "id": 1, "tenant": "Company Name", "plan": "Plan Name", "status": "active", "created_at": "..." } ],
  "recent_activities": [ { "id": 1, "description": "", "event": "", "subject_type": "App\\Models\\...", "created_at": "..." } ]
}
```

Notes:

- `active_tenants` requires `status = active` AND `archived_at IS NULL`; `archived_tenants` counts `archived_at IS NOT NULL`; `expired_tenants` counts non-archived tenants with no active subscription
- `mrr` sums `monthly_price` of `active` subscriptions (yearly plans contribute `yearly_price / 12`); `arr = mrr * 12`
- `growth` / `revenue_series` cover the trailing 12 months
- `recent_activities` reads from `activity_log`; falls back to recent tenant creations if the log is empty
- The admin UI currently surfaces `stats`, `growth`, `revenue_series`, `recent_tenants`, and `recent_activities`; `revenue.mrr`/`revenue.arr`, `subscriptions`, and `recent_subscriptions` are in the payload but not yet rendered — see [admin-ui.md](../admin-ui.md#dashboard)

## Permissions

Seeded by `Database\Seeders\Central\PermissionsSeeder`, guard `central-api`, naming pattern `{resource}.{action}`.

| Group | Permissions |
|-------|-------------|
| `users` | `list`, `create`, `read`, `update`, `delete`, `restore`, `force.delete`, `suspend`, `unsuspend`, `invite`, `reset-password` |
| `tenants` | `list`, `create`, `read`, `update`, `delete`, `restore`, `force.delete`, `archive` |
| `roles` | `list`, `create`, `read`, `update`, `delete`, `clone` |
| `dashboard` | `view` |
| `billing` | `manage` (seeded; not yet enforced by any controller/policy) |
| `plans` | `list`, `create`, `read`, `update`, `delete`, `restore`, `force.delete` |
| `modules` | `list`, `create`, `read`, `update`, `delete`, `restore`, `force.delete` |
| `features` | `list`, `create`, `read`, `update`, `delete`, `restore`, `force.delete` |
| `limit-definitions` | `list`, `create`, `read`, `update`, `delete` |
| `tenant-subscriptions` | `list`, `create`, `read`, `update`, `delete`, `restore`, `force.delete` |
| `system-settings` | `list`, `update` |

Actions without a dedicated permission reuse an adjacent one: plan feature sync uses `plans.update`; subscription cancel/resume/suspend use `tenant-subscriptions.update`; tenant unarchive uses `tenants.archive`; the permissions matrix uses `roles.list`.

## Removed in Phase 1 rewrite

- `/plans/{plan}/features` typed pivot (pre-rewrite version — superseded by the current `plan_feature` override endpoint of the same path)
- `/subscriptions` (replaced by `/tenant-subscriptions`)
- `/setting-definitions`

Postman: `SaaS-Backend/.docs/postman/Central.postman_collection.json` (refresh after API changes).
