# Shared Layout — Developer Guide

App: `SaaS-Frontend` (React 19 + Vite).

## Shared layout architecture

Both applications render authenticated pages through the same `AppLayout`:

```
AppLayout
├── Sidebar          (context-aware nav + brand subtitle)
├── Topbar
│   ├── Collapse / mobile menu
│   ├── Breadcrumbs
│   ├── Command palette trigger (⌘K)
│   ├── Theme toggle
│   ├── Notifications (placeholder)
│   ├── Settings shortcut
│   └── User menu
├── <Outlet />       (page content in shared max-width container)
└── CommandPalette
```

Context is **path-based**:

| Application | Path prefix | Nav config |
|-------------|-------------|------------|
| Tenant | `/` (e.g. `/dashboard`) | `tenantNavigationGroups` |
| Central | `/central/*` | `centralNavigationGroups` |

Helpers in `src/config/routes.ts`:

- `getAuthContext(pathname)`
- `dashboardPathFor` / `profilePathFor` / `settingsPathFor` / `loginPathFor`

Helpers in `src/config/navigation.ts`:

- `getNavigationGroups(context)`
- `getNavigationItems(context)`
- `applicationLabelFor(context)` → `"Central Application"` | `"Tenant Application"`

## Layout inheritance

| Layer | Shared? | Notes |
|-------|---------|-------|
| `layouts/app-layout.tsx` | Yes | Identical shell for both apps |
| `layouts/auth-layout.tsx` | Yes | Guest auth screens |
| `components/layout/*` | Yes | Reads context from pathname; no Central fork |
| `components/ui/*` | Yes | Primitives (button, card, dialog, table, …) |
| `components/common/*` | Yes | PageHeader, EmptyState, LoadingState, ErrorState |
| `components/dashboard/*` | Mostly Central widgets | WelcomeHero / QuickActions / TenantsOverviewTable stay Central-specific |
| Page content | Per app | Tenant dashboard uses shared WidgetContainer + EmptyState with workspace placeholders |

Do **not** duplicate Sidebar/Topbar for Tenant. Parameterize via navigation config + route helpers.

## Reusable components (preferred)

**Shell**

- `AppLayout`, `Sidebar`, `Topbar`, `Breadcrumbs`, `UserMenu`, `CommandPalette`, `ThemeToggle`

**Page chrome**

- `PageHeader`, `LoadingState`, `ErrorState`, `EmptyState`, `WidgetContainer`

**Primitives**

- Cards, tables, forms, dialogs, sheets, buttons from `components/ui`

**Placeholders**

- `pages/common/placeholder-page.tsx` — reserved module/settings screens

## UI structure (Tenant)

| Route | Page |
|-------|------|
| `/dashboard` | Tenant dashboard (welcome, workspace info, modules, activity/quick-action placeholders) |
| `/leads` | Placeholder |
| `/tasks` | Placeholder |
| `/settings` | Placeholder (workspace-scoped; not Central system settings) |
| `/profile` | Shared `ProfilePage` (API context from pathname) |

Central remains under `/central/*` with the same shell and its own navigation groups.

## Adding a Tenant module to the sidebar

1. Add the path to `tenantRoutes` in `src/config/routes.ts`.
2. Add a `NavigationItem` under `tenantNavigationGroups` (only for modules the workspace should see).
3. Register the route under `TenantProtectedRoute` → `AppLayout` in `App.tsx`.
4. Prefer `PlaceholderPage` until business UI exists.

Future: filter nav items from installed module subscriptions instead of a static list.

## Auth / API notes

- Profile update/password change omit forced `apiContext` so the axios interceptor uses `getAuthContext()` from the URL.
- Tenant API base: `/api/tenant/v1` + `X-Tenant-Domain`.
- Central API base: `/api/central/v1`.

## Explicit non-goals (this foundation)

- Leads / Tasks business screens
- Tenant system-settings parity with Central
- Divergent dashboard redesigns per app
