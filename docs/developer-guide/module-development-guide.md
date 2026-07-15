# Module Development — Developer Guide

Canonical checklist for building a business module. Copy the **Leads** module structure; do not invent a second pattern.

## Registration recipe

1. **Catalog** — Add a row via `CatalogSeeder` and/or Central Modules API (`slug`, pricing, `status=published`, `is_default_included` / `is_billable`).
2. **Permissions** — Add `{slug} => [view, create, update, delete, …]` in `config/tenant-permissions.php` and default grants in `config/tenant-default-role-permissions.php`. Modules never auto-grant permissions; roles do.
3. **Routes** — Tenant API:

```php
Route::middleware(['auth:tenant-api', 'tenant.user', 'verified', 'module:{slug}', 'can:{slug}.view'])->group(function () {
    // …
});
```

4. **Domain code** — Flat under existing namespaces (no `Modules/` package):

| Layer | Location |
|-------|----------|
| Models | `app/Models/` + `BelongsToTenant` |
| Migrations | `database/migrations/` |
| Factories | `database/factories/` |
| Seeders | `database/seeders/Tenant/` (or Central for catalog) |
| Controllers | `app/Http/Controllers/Tenant/Api/V1/` |
| Form requests | `app/Http/Requests/Tenant/Api/V1/{Module}/` |
| Resources | `app/Http/Resources/Tenant/Api/V1/{Module}/` |
| Policies | `app/Policies/` |
| Services | `app/Services/Tenant/` |
| Events / Listeners | `app/Events/`, `app/Listeners/` |
| Notifications | `app/Notifications/Tenant/` |

5. **Frontend** — `src/pages/{slug}/`, API service, types, `PERMISSIONS` / `QUERY_KEYS`, nav item with `permission` **and** `module`, route under `TenantProtectedRoute`.
6. **Tests** — Pest feature suite + Playwright `test:e2e:{slug}`.
7. **Docs** — User / developer / production guides, API, database, CHANGELOG.

## Logging (both required)

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| Audit | `PlatformAuditService` → `activity('platform')` | Actor, workspace, IP, UA, action for create/update/delete/assign/status changes |
| Activity | Spatie `LogsActivity` on primary model | Attribute-level change history |
| Timeline | Domain `*_activities` table (when UX needs it) | User-facing history (notes, stage moves, assignments) |

## Events

Dispatch domain events from the service layer. Listeners handle audit side-effects and notifications. Do **not** build per-module notification stacks outside Laravel notifications.

## Dashboard widgets

When a module contributes dashboard cards:

1. Extend `App\Services\Tenant\DashboardWidgetService` (same registry pattern as Leads/Tasks).
2. Gate each widget on `EntitlementService::hasModule` + the user’s Spatie permission.
3. Apply assignee scoping with `ScopesToAssignee` when the module uses `{slug}.assign`.
4. Return `{ id, module, permission, scope, data }` objects only — the SPA renders by `id`.
5. Do not invent a parallel dashboard API or a Calendar widget before the Calendar module.

See [tenant-v1-dashboard.md](/api/tenant-v1-dashboard).

## In-app notifications

- Prefer Laravel notifications with `via(): ['mail', 'database']` for CRM-style alerts.
- Implement `ShouldQueue` and use `App\Notifications\Concerns\QueuesOnEmails` so jobs land on the dedicated `emails` queue (`php artisan queue:work --queue=emails`).
- Persist via the standard `notifications` table; expose tenant APIs under `/notifications*` ([tenant-v1-notifications.md](/api/tenant-v1-notifications)).
- Frontend may poll unread count (~25s) until Reverb/Echo is adopted platform-wide.
- Schedule due/overdue fan-out through `crm:send-due-notifications` rather than ad-hoc cron per module.

## Settings

If the module needs settings, register keys in `SystemSettingDefinitions` / `TenantSettingDefinitions` and resolve Central → Tenant → system. Do not invent a parallel settings store.

## Billing

Paid modules: catalog `is_billable`, marketplace install, `ModuleSubscriptionService`, consolidated billing. Never implement independent payment flows.

## Frontend checklist

- Pages, forms, tables, filters, dialogs/drawers
- Shared design system (`PageHeader`, `DataTable`, `PermissionGate`, empty/error/loading states)
- Nav + breadcrumbs respect **installed modules** and **user permissions**
- Auth payload includes active module slugs for SPA gating

## Testing checklist

**Pest:** unit where useful; feature CRUD; authorization; validation; tenant isolation; module middleware denial.

**Playwright:** dedicated suite; script `test:e2e:{slug}`; independently runnable.

**Manual QA:** Cursor browser — CRUD, search, filters, pagination, validation, authz, responsive layout, console, network.

## Anti-patterns

- Laravel Modules / nwidart / plugin discovery
- Repositories layer
- Skipping `module:` or `can:` middleware
- Static nav that ignores entitlements
- Custom audit/notification systems outside platform services
