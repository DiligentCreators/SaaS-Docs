# Central admin UI

App: `SaaS-Frontend` (React 19 + Vite).

## Navigation

| Group | Screens | Route |
|-------|---------|-------|
| Overview | Dashboard | `/dashboard` |
| Platform | Tenants, Users, Roles | `/tenants`, `/users`, `/roles` |
| Catalog | Marketplace, Modules, Features | `/marketplace`, `/modules`, `/features` |
| Settings | Settings, Profile | `/settings`, `/profile` |

Removed from navigation: Plans, Limits, Tenant Subscriptions.

Not in the sidebar (reached via in-page links): `/tenants/:id`, `/roles/matrix`.

## Screen ↔ API map

| Screen | Primary APIs |
|--------|----------------|
| Tenants | `/tenants`, archive/unarchive/restore/force |
| Tenant details | `/tenants/{id}`, `/tenants/{id}/entitlements`, `/tenants/{id}/invoices`, `/tenants/{id}/payments`, `/tenants/{id}/modules`, `/tenants/{id}/impersonate` |
| Marketplace | `/marketplace/modules`, `/marketplace/modules/{id}`, install via `/tenants/{id}/modules` |
| Module subscriptions | `/module-subscriptions`, cancel/deactivate |
| Users | `/users`, invite, activity, suspend, change-password |
| Roles | `/roles`, clone, permissions-matrix |
| Modules (admin catalog) | `/modules` |
| Features | `/features?module_id=` |
| Dashboard | `/dashboard` |
| Settings | `/system-settings` |
| Invoices / Payments (global) | `/invoices`, `/payments` |

## Marketplace (`/marketplace`)

- Lists published modules from `GET /marketplace/modules` (search, category filter)
- Detail drawer/page: `GET /marketplace/modules/{id}?tenant_id=` for dependency + install state
- **Install to workspace**: select tenant → `POST /tenants/{tenant}/modules` with `module_id`, optional `billing_cycle`
- Today only Leads/Tasks appear (included, non-billable); UI supports future paid modules

## Tenants

### Tenant details (`/tenants/:id`)

Tabbed layout:

| Tab | Content | APIs |
|-----|---------|------|
| **Overview** | Contact, domain, localization, owner, timeline | `GET /tenants/{id}` |
| **Modules** | Installed subscriptions — status, source, price, features; cancel/deactivate actions | `installed_modules` on tenant, `/module-subscriptions/...` |
| **Billing** | Invoice and payment history tables | `/tenants/{id}/invoices`, `/tenants/{id}/payments` |

Header actions:

- Lifecycle: edit, archive, delete, restore, force-delete
- **Impersonate** (`impersonation.start`): reason dialog → `POST /tenants/{id}/impersonate`; end via `POST /impersonation/{id}/end`

Plan subscription and usage-limit cards removed.

## Modules (admin catalog)

List (`/modules`): name, slug, status, default-included / billable flags, pricing, features count.

### Module form

Fields: name, slug, description, icon, category, monthly/yearly price, status, `is_default_included`, `is_billable`, sort order, active.

Only Leads and Tasks exist in the seeded catalog.

## Features

Belong to a module. Used for permissions / API gating / UI visibility — never sold separately.

## Dashboard

- Welcome hero, growth chart, quick actions (Tenants / Users / Modules / Features)
- Recent tenants, recent activity
- Revenue from billable module subscriptions (MRR is `0` while only included modules exist)

## Settings

Billing tab: invoice prefix, proration mode, default payment gateway, trial/Stripe flags.

## Command palette

`⌘K` / `Ctrl+K` — permission-filtered nav items.

No CRM/tenant-product UI in Central.
