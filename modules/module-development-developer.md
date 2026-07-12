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
