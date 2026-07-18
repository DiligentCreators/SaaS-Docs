# Communication Templates — Developer Guide

Reusable **platform module** for plain-text communication templates. Templates are licensed via the marketplace catalog (`communication-templates`) and authorized via Spatie permissions. The first consumer is **Leads → WhatsApp Web** (`wa.me`). There is no Meta/Twilio/server-side send in this version.

## Purpose

- Give workspaces a single place to author reusable messages
- Keep message composition module-agnostic through a **placeholder registry**
- Let product modules (Leads today; Contacts/etc. later) open a picker, render, and hand off to an external channel UI

Templates store **plain text only** (no HTML/rich text). Channels include `whatsapp`, `sms`, and `email` in the enum; MVP create/update allows **`whatsapp` only**.

## Architecture

```text
Product UI (e.g. Lead detail)
  → POST /communication-templates/{uuid}/render
      → CommunicationTemplateService
          → TemplateRenderer
              → PlaceholderRegistry
                  → context PlaceholderProvider (e.g. Lead)
                  → shared SharedPlaceholderProvider (agent / workspace / system)
          → channel extras (WhatsApp phone + wa.me URL)
  → SPA opens wa_me_url in a new tab
```

| Concern | Implementation |
|---------|----------------|
| Licensing | Catalog module `communication-templates` + `module:` middleware |
| Authorization | `communication-templates.{view,create,update,delete,use}` |
| Storage | Tenant-scoped `communication_templates` rows |
| Placeholders | Modular providers registered on `PlaceholderRegistry` |
| Rendering | Generic `TemplateRenderer` (module-agnostic) |
| Audit | Domain events → `CommunicationTemplateEventSubscriber` → `PlatformAuditService` |

### Backend layout

| Piece | Path |
|-------|------|
| Model | `app/Models/CommunicationTemplate.php` |
| Enum | `app/Enums/Tenant/CommunicationTemplateChannelEnum.php` |
| Contracts | `app/Contracts/CommunicationTemplates/PlaceholderProvider.php`, `SharedPlaceholderProvider.php` |
| Support DTOs | `app/Support/CommunicationTemplates/*` |
| Service | `app/Services/Tenant/CommunicationTemplates/CommunicationTemplateService.php` |
| Registry / renderer | `PlaceholderRegistry.php`, `TemplateRenderer.php` |
| Providers | `Providers/LeadPlaceholderProvider.php`, `Agent*`, `Workspace*`, `System*` |
| Controller | `CommunicationTemplateController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/CommunicationTemplate/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/CommunicationTemplate/*` |
| Policy | `app/Policies/CommunicationTemplatePolicy.php` |
| Events / subscriber | `CommunicationTemplateCreated/Updated/Deleted` + `CommunicationTemplateEventSubscriber` |
| Tests | `tests/Feature/Tenant/CommunicationTemplates/*`, `tests/Feature/ProductionModuleDeploymentTest.php` |

### Frontend layout

| Piece | Path |
|-------|------|
| List page | `src/pages/communication-templates/communication-templates-page.tsx` |
| Form dialog | `template-form-dialog.tsx` (placeholder chip inserter) |
| WhatsApp picker | `src/components/crm/whatsapp-template-picker-dialog.tsx` |
| Lead wiring | WhatsApp action in `lead-detail-sheet.tsx` |
| API client | `communicationTemplateService` in `src/api/services.ts` |
| E2E | `e2e/tests/communication-templates/`, `npm run test:e2e:communication-templates` |

## Data model

Table: `communication_templates`

| Column | Notes |
|--------|-------|
| `tenant_id` | Workspace FK |
| `uuid` | Public route key (`getRouteKeyName()` → `uuid`) |
| `name` | Unique per tenant + context + channel among non-deleted rows |
| `context` | Single context slug (e.g. `leads`) — drives placeholder set |
| `channel` | Enum string; MVP writes: `whatsapp` |
| `category` | Optional free-text grouping |
| `body` | Plain text, max 4000; only known `{{tokens}}` |
| `is_active` | Inactive templates hidden from pickers; still editable |
| `created_by` / `updated_by` | Nullable user FKs |
| `last_used_at` | Set on successful **render** |
| soft deletes | |

Indexes cover `(tenant_id, context, channel, is_active)`, name, and `last_used_at`.

## Domain rules

- **One context per template** — filters placeholders and picker lists
- Tokens are `{{snake_case}}` (optional surrounding whitespace inside braces)
- Unknown tokens are **rejected on save**
- Render replaces missing/null values with `""` and returns `missing_placeholders`
- WhatsApp phone normalization: digits only, minimum 8 digits; no silent country-code inventing
- Render requires an active template and (for WhatsApp) a valid entity phone

## Placeholder registry

The registry is **modular and extensible**. Context providers own entity-specific tokens; shared providers merge into every context.

### Contracts

- `PlaceholderProvider` — `context()`, `label()`, `definitions()`, `resolve(Model, ctx)`, `findEntity()`
- `SharedPlaceholderProvider` — `group()`, `definitions()`, `resolve(ctx)` (no entity)

### Registration

Bound as a singleton in `AppServiceProvider`:

```php
new PlaceholderRegistry(
    contextProviders: [
        $app->make(LeadPlaceholderProvider::class),
        // future: ContactPlaceholderProvider::class, …
    ],
    sharedProviders: [
        $app->make(AgentPlaceholderProvider::class),
        $app->make(WorkspacePlaceholderProvider::class),
        $app->make(SystemPlaceholderProvider::class),
    ],
);
```

### Built-in keys

**Lead context:** `name`, `email`, `phone`, `company`, `job_title`, `source`, `status`, `priority`, `lead_value`, `stage_name`, `assignee_name`

**Shared — agent:** `agent_name`, `agent_email`

**Shared — workspace:** `workspace_name`

**Shared — system:** `today`, `now` (workspace timezone)

## Rendering & preview flow

| Endpoint | Permission | Entity | Behavior |
|----------|------------|--------|----------|
| `POST …/preview` | `view` or `use` | optional | Without `entity_id`: sample + live shared values. With `entity_id`: live resolve (entity `view` policy). No `last_used_at` update. |
| `POST …/render` | `use` | required | Live resolve; WhatsApp extras (`phone`, `wa_me_url`); updates `last_used_at`. |

`TemplateRenderer` is generic: it does not know about Leads beyond what the registry returns for `template.context`.

## WhatsApp flow (Leads)

1. User opens a lead with a phone number
2. SPA opens the template picker (module installed + `communication-templates.use`)
3. User selects a template → `POST …/render` with `entity_id`
4. API returns `wa_me_url` (`https://wa.me/{digits}?text=…`)
5. Browser opens the URL; the agent sends from WhatsApp Web/app

SaleOS does **not** send messages or store outbound message history in this version.

## Permission model

Config: `config/tenant-permissions.php` → `communication-templates` actions.

| Permission | Purpose |
|------------|---------|
| `view` | List, show, meta, preview |
| `create` / `update` / `delete` | CRUD |
| `use` | Render / open channel handoff |

Default role map (`config/tenant-default-role-permissions.php`):

- **admin** — all
- **manager** — all except `delete`
- **staff** — `view` + `use`
- **superadmin (owner)** — all permissions via provisioning / additive deploy grants

Routes: `module:communication-templates` then `can:` / policies.

## Production registration (no seeders)

Communication Templates ships with **data migrations**, not production `db:seed`:

| Migration | Responsibility |
|-----------|----------------|
| Schema | `create_communication_templates_table` |
| Catalog | `register_communication_templates_module` via `DefaultModuleRegistrar` |
| Permissions | `add_communication_template_permissions` via `TenantPermissionSynchronizer` |

Production:

```bash
php artisan migrate --force
php artisan optimize
```

Do **not** run `CatalogSeeder` or permission seeders in production for this module. See [deployment/communication-templates.md](/deployment/communication-templates).

## Extension guide (future product modules)

To add a new context (e.g. Contacts):

1. Implement `PlaceholderProvider` for the context (definitions + resolve + findEntity)
2. Register it in the `PlaceholderRegistry` singleton
3. Expose picker UI on that module’s detail surface
4. Gate with **module entitlement** (`communication-templates` installed) **and** `communication-templates.use`
5. Call preview/render with the new context’s `entity_id`
6. Add Pest coverage for the provider + an E2E path if the UI is user-facing

No changes to `TemplateRenderer` are required when placeholders and context registration stay behind the contracts.

## Related

- [API reference](/api/tenant-v1-communication-templates)
- [User guide](/user-guide/communication-templates)
- [Deployment](/deployment/communication-templates)
- [Module Development Standard](/developer-guide/module-development)
- [Tenant provisioning](/developer-guide/tenant-provisioning)
