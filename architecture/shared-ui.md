# Shared Design System & Layout Reuse

## Goal

Central and Tenant applications share one visual and structural foundation. Users moving between platform admin and workspace surfaces should recognize the same shell immediately.

Business functionality will differentiate the apps later; the shell must not require another layout refactor when that happens.

## Design system

| Concern | Shared source |
|---------|----------------|
| Colors, typography, spacing | Global CSS / Tailwind theme tokens |
| Primitives | `SaaS-Frontend/src/components/ui` |
| Page helpers | `components/common` (headers, empty/loading/error states) |
| App chrome | `layouts/app-layout.tsx` + `components/layout` |
| Motion / density | Same card radii, sidebar width, topbar height, content max-width |

Central-specific dashboard widgets (tenant analytics, platform health, marketplace shortcuts) stay in `components/dashboard` and are **not** reused on the Tenant dashboard.

Tenant dashboard reuses shell + `WidgetContainer` patterns and renders widgets from `GET /api/tenant/v1/dashboard` (module + permission + assignee scoped).

## Layout reuse strategy

```mermaid
flowchart TB
  subgraph shared [Shared shell]
    AppLayout
    Sidebar
    Topbar
    CommandPalette
  end

  subgraph config [Context config]
    Routes["routes.ts helpers"]
    Nav["centralNavigationGroups / tenantNavigationGroups"]
  end

  subgraph pages [Page content]
    CentralPages["Central pages + widgets"]
    TenantPages["Tenant dashboard widgets + modules"]
  end

  Routes --> Sidebar
  Nav --> Sidebar
  Nav --> CommandPalette
  AppLayout --> CentralPages
  AppLayout --> TenantPages
```

1. **One `AppLayout`** wraps both protected route trees.
2. **Navigation is data**, not duplicated components — swap groups by `AuthContext`.
3. **Route helpers** resolve dashboard / profile / settings / login per context.
4. **Business pages own their content**; they must not fork the shell.
5. **Modules** ship real pages (mirror Leads); placeholders are only transitional.

## Evolution

| Phase | Central | Tenant |
|-------|---------|--------|
| Now | Platform metrics dashboard | Widget registry dashboard (Leads/Tasks scoped) |
| Later | Platform-focused metrics stay | More module-driven widgets (Invoices, Calendar, …) |
| Shell | Remains shared | Remains shared |

Installed module subscriptions and Spatie permissions drive Tenant sidebar visibility.

## Related docs

- [ui/shared-layout.md](../ui/shared-layout.md)
- [ui/shared-layout-developer.md](../ui/shared-layout-developer.md)
- [ui/tenant-application-user.md](../ui/tenant-application-user.md)
- [admin-ui.md](../admin-ui.md)
