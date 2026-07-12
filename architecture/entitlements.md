# Entitlements model

## Philosophy

The platform does **not** sell plans. Licensing is based entirely on **workspace module subscriptions**.

| Layer | Meaning | Example |
|-------|---------|---------|
| Core Platform | Always-on platform capabilities (not modules, not billed) | Auth, users, roles, dashboard, billing, marketplace shell |
| Module | Independently installable business capability | Leads, Tasks |
| Feature | Boolean capability inside a module (never sold alone) | `leads.create`, `tasks.view` |
| Workspace module subscription | License row linking a workspace to a module | Acme → Leads (`source=included`) |

There are **no** plan tiers, plan modules, plan features, or module usage limits (e.g. “100 leads”).

## Core Platform vs modules

Core Platform capabilities live in `config/core-platform.php` and are always available.

Business modules live in the `modules` catalog. Today only **Leads** and **Tasks** exist. They are:

- `is_default_included = true`
- `is_billable = false`
- Auto-installed on every new workspace (`source=included`)
- Not cancellable by workspace owners (platform admin may **deactivate**)

Schema remains flexible so they can become paid for *new* customers later without redesign (`is_billable`, pricing columns, `source`).

## Resolution

```
active_modules(workspace) =
  workspace_module_subscriptions
    WHERE status IN (trial, active)
    AND (ends_at IS NULL OR ends_at > now)

has_feature(workspace, slug) =
  feature belongs to an active module AND feature.is_active

core = config('core-platform.capabilities')
```

Cached as `workspace:{id}:entitlements` (1 hour). Invalidated on install/cancel/deactivate/status change.

API: `GET /api/central/v1/tenants/{tenant}/entitlements`

Returns `{ core, modules, features }` for the tenant application to register routes/nav/permissions.

## Marketplace install rules

Published catalog: `GET /marketplace/modules` (admin browse) or install via `POST /tenants/{tenant}/modules`.

| Rule | Behavior |
|------|----------|
| Module must be `published` and `is_active` | Validation error otherwise |
| Duplicate active/pending/trial install | Rejected |
| Required dependencies (`module_dependencies`, `is_optional=false`) | Must already be installed; marketplace detail returns `missing_required_modules` |
| Non-billable module | `status=active` immediately, `source=included` if `is_default_included` else `purchased` |
| Billable module (`is_billable` + price > 0) | `status=pending` until Billing Engine settles payment |

Install body: `{ "module_id": int, "billing_cycle?": "monthly" \| "yearly" }`.

## Cancel / deactivate rules

| Action | Who | Included modules | Purchased modules |
|--------|-----|------------------|-------------------|
| **Cancel** (`POST /module-subscriptions/{id}/cancel`) | Requires `module-subscriptions.update` | **Blocked** — use deactivate | Sets `cancelled`, `ends_at=now` |
| **Deactivate** (`POST /module-subscriptions/{id}/deactivate`) | Requires `module-subscriptions.deactivate` | Allowed (platform admin) | Sets `suspended` |

Cancel removes entitlements immediately. Deactivate is the platform-admin override for included core modules.

## Dependencies

`module_dependencies` supports hard/optional deps for marketplace modules. Leads and Tasks have none today. `MarketplaceService::detailForTenant` exposes `required_modules`, `optional_modules`, `missing_required_modules`, `already_installed`.

## Billing

Each workspace has a consolidated billing profile (`billing_anchor_day`, `billing_cycle`, `proration_mode`, `next_billing_at`). One invoice per cycle for all **billable active** modules via `billing:run-consolidated`. Mid-cycle installs use proration modes: `prorated` | `free_until_next` | `none`. See [billing/billing-engine.md](../billing/billing-engine.md).
