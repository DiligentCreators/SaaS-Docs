# Central admin UI

App: `SaaS-Frontend` (React 19 + Vite).

## Navigation

| Group | Screens | Route |
|-------|---------|-------|
| Overview | Dashboard | `/dashboard` |
| Platform | Tenants, Users, Roles | `/tenants`, `/users`, `/roles` |
| Catalog | Plans, Modules, Features, Limits | `/plans`, `/modules`, `/features`, `/limits` |
| Tenancy | Tenant Subscriptions | `/tenant-subscriptions` |
| System | Settings, Profile | `/settings`, `/profile` |

## Screen ↔ API map

| Screen | Primary APIs |
|--------|----------------|
| Plans | `/plans`, `/plans/{id}/modules`, `/plans/{id}/limits` |
| Modules | `/modules` |
| Features | `/features?module_id=` |
| Limits | `/limit-definitions` |
| Tenants | `/tenants` |
| Tenant Subscriptions | `/tenant-subscriptions` |
| Settings | `/system-settings` |

## Plan editor notes

- Module inclusion via checkboxes → `PUT .../modules` with `module_ids`
- Limits matrix with Unlimited toggle → `value: null`
- Plan fields include `currency`, `trial_days`, `is_default`, `is_public`, `sort_order`

No CRM UI in Phase 1.
