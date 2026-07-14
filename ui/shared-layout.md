# Shared UI Layout

Central and Tenant applications share one shell so both sides of the platform feel identical until business modules diverge.

| Guide | Audience |
|-------|----------|
| [shared-layout-developer.md](shared-layout-developer.md) | Engineers extending the shell, navigation, or page chrome |
| [tenant-application-user.md](tenant-application-user.md) | Workspace users navigating the Tenant Application |
| [../architecture/shared-ui.md](../architecture/shared-ui.md) | Architecture — design system and reuse strategy |

## Principle

Changing a shared layout component should benefit both applications whenever practical. Business dashboards and module pages may diverge later; the shell stays reusable.
