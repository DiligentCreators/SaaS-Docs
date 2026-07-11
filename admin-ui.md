# Central admin UI

App: `SaaS-Frontend` (React 19 + Vite).

## Navigation

| Group | Screens | Route |
|-------|---------|-------|
| Overview | Dashboard | `/dashboard` |
| Platform | Tenants, Users, Roles | `/tenants`, `/users`, `/roles` |
| Catalog | Plans, Modules, Features, Limits | `/plans`, `/modules`, `/features`, `/limits` |
| System | Tenant Subscriptions | `/tenant-subscriptions` |
| Settings | Settings, Profile | `/settings`, `/profile` |

Not in the sidebar (reached via in-page links or direct URL): `/tenants/:id` (tenant details, linked from the Tenants table) and `/roles/matrix` (permissions matrix, linked from the Roles page).

The command palette (`⌘K` / `Ctrl+K`, `cmdk`-based) lists every sidebar-visible item filtered by permission; it does not include `/tenants/:id` or `/roles/matrix` since those aren't nav items.

## Screen ↔ API map

| Screen | Primary APIs |
|--------|----------------|
| Tenants | `/tenants`, `/tenants/{id}/archive`, `/tenants/{id}/unarchive`, `/tenants/{id}/restore`, `/tenants/{id}/force` |
| Tenant details | `/tenants/{id}` |
| Users | `/users`, `/users/invite`, `/users/{id}/activity`, `/users/{id}/change-password`, `/users/{id}/suspend`, `/users/{id}/unsuspend` |
| Roles | `/roles`, `/roles/{id}/clone` |
| Permissions matrix | `/roles/permissions-matrix`, `/roles?per_page=100` |
| Plans | `/plans`, `/plans/{id}/modules`, `/plans/{id}/limits`, `/plans/{id}/features` |
| Modules | `/modules` |
| Features | `/features?module_id=` |
| Limits | `/limit-definitions` |
| Tenant Subscriptions | `/tenant-subscriptions`, `.../cancel`, `.../resume`, `.../suspend` |
| Dashboard | `/dashboard` |
| Settings | `/system-settings` |

## Tenants

List (`/tenants`): company name (links to details) with slug subtitle, domain, email, status, created date. Status badges are **Deleted** (soft-deleted), **Archived** (`archived_at` set), or the normal `active`/`suspended`/`cancelled` badge. A toolbar select filters by `trashed`: Active only / Include deleted / Deleted only — there is no separate "archived only" filter; archived tenants surface via the Archived badge instead.

Row actions (permission-gated, hidden as appropriate when trashed): View details, Edit, Archive/Unarchive, Delete, Restore, Delete permanently.

### Tenant details (`/tenants/:id`)

- Header: company name, status badges (Deleted / Archived / status), lifecycle actions (Edit, Archive/Unarchive, Delete/Restore, Delete permanently)
- Overview card: email, phone, domain, user count, timezone, currency, country, locale, address, notes
- Active subscription card: plan name, monthly price, status, billing cycle, start/end dates, module and feature badges, link to Tenant Subscriptions
- Usage card: per-limit used/total progress bars, when usage data is present
- Subscription events timeline, when the active subscription has events
- Sidebar: owner (name, email); timeline (created, last updated, trial ends, archived date if set)

`workspace_name` shows in the header description (falls back to slug); it is not repeated as an Overview field. `logo_path` is editable in the tenant form but not rendered on the details page.

### Tenant form (create/edit)

Fields: Company name, Slug, Workspace name, Phone, Email, Domain, Status, Owner, Timezone, Currency, Country, Locale, Logo path, Address, Notes.

## Users

List (`/users`): name with email subtitle, role badges, status (Deleted / Suspended / Active), created date, trashed filter (same pattern as Tenants). Header actions: **Invite user** and **New user**.

### Invite user

Dialog fields: full name, email address, phone (optional), roles (checkbox grid, at least one). Calls `POST /users/invite`; the invited user receives an email to set up their account.

### User form (create/edit)

Create fields: name, email, phone, password, roles. Edit drops password.

### User view sheet

Three tabs:

- **Overview** — name, email, phone, role badges, status, email verified, last login (or "Never"), created/updated dates. Note: `avatar_path` exists on the user model but is not yet rendered as an image in this sheet.
- **Permissions** — the user's effective permissions as badges
- **Activity** — timeline from `GET /users/{id}/activity` (description, causer, timestamp)

### Change password

Row action opens a dialog with `password` / `password_confirmation` fields, calls `POST /users/{id}/change-password`.

## Roles

List (`/roles`): role name with icon, guard name, created date. Header actions: **Permissions matrix** (link to `/roles/matrix`) and **New role**.

Row actions: Edit (opens the role form with grouped permission checkboxes), **Clone** (confirms, then `POST /roles/{id}/clone`, default name `{name} Copy`), **Delete** (`DELETE /roles/{id}`, blocked server-side for protected roles).

### Role form

Create: name only. Edit: name plus permission checkboxes grouped by prefix (e.g. all `tenants.*` together); saves `{ name, permissions }`.

### Permissions matrix (`/roles/matrix`)

Read-only grid: permissions as rows (grouped and titled by prefix), roles as columns, a check icon where a role holds that permission. Includes a search box filtering by permission name or group. There is no bulk/cell editing here — per-role permission changes still happen in the role edit form.

## Plans

List (`/plans`): plan name with Default / **Popular** / Private badges, monthly/yearly price, trial days, status, trashed filter.

### Plan form

Four tabs (Modules, Limits, and Features are edit-only — a plan must exist first):

| Tab | Contents |
|-----|----------|
| Details | name, slug, description, monthly/yearly price, currency, trial days, sort order, Active/Public/Default/**Popular** switches, and a **Stripe mapping** section with `stripe_product_id`, `stripe_monthly_price_id`, `stripe_yearly_price_id` |
| Modules | checkbox sync against `PUT /plans/{id}/modules` |
| Limits | per-limit unlimited toggle + numeric value against `PUT /plans/{id}/limits` |
| **Features** | per-feature checkbox sync against `PUT /plans/{id}/features` — independent of the Modules tab; see [entitlements.md](architecture/entitlements.md) |

## Tenant subscriptions

List (`/tenant-subscriptions`): tenant (company + email), plan (name + monthly price), billing cycle badge, status, start/end dates. No trashed filter on this list (unlike Tenants/Users/Plans).

Row actions: View details, Edit, **Suspend** (when not already suspended), **Resume** (when suspended or cancelled), **Cancel** (unless already cancelled/expired), Delete/Restore.

### Subscription form

Fields: tenant, plan, status, billing cycle, trial start/end, subscription start/end, provider, provider subscription ID.

### Subscription view sheet

Tenant, plan + monthly price, status and billing-cycle badges, start/end/trial dates, provider, plan module and feature badges, and a timeline of `subscription_events`.

## Dashboard

Wired to `GET /dashboard` (previously placeholder data). Widgets:

- **Welcome hero** — greeting, total/active tenants, total users, quick links (create user, create tenant, invite team, upgrade plan)
- **Growth trend** chart — tenants and revenue over 1/3/6/12 months, with CSV export
- **Quick actions** — shortcuts to Tenants/Users/Plans/Tenant Subscriptions
- **Recent tenants** table
- **Recent activity** timeline (from `recent_activities`)
- **Health card** and **Plan usage** gauges — currently static/illustrative, not sourced from live API fields

`revenue.mrr` / `revenue.arr` and `recent_subscriptions` are present in the API response (see [api/central-v1.md](api/central-v1.md#dashboard-payload)) but not yet surfaced as dedicated widgets.

## Settings

Sectioned into 8 tabs, each backed by `system_settings` groups via `GET/PUT /system-settings`:

| Tab | Contents |
|-----|----------|
| General | App name, company name, timezone, locale, currency, registration enabled |
| Localization | Date format, time format |
| Mail | Mail from name, mail from address |
| Branding | Primary color, support email, logo path, favicon path |
| Security | Session lifetime, password minimum length, require special characters |
| Maintenance | Maintenance mode toggle, maintenance message |
| Billing | Default plan, invoice prefix, trial enabled, Stripe enabled/webhook-configured indicators |
| Feature Flags | Self-service registration, user invitations |

## Command palette

Still present, opened via `⌘K`/`Ctrl+K` or the topbar search button. Lists permission-filtered navigation items and routes on selection.

No CRM/tenant-product UI in Phase 1.
