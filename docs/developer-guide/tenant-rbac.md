# Tenant RBAC — Developer Guide

Workspace (tenant) authorization is isolated per workspace: users, roles, and role↔permission assignments never cross tenant boundaries. Permissions are a shared vocabulary on the `tenant-api` guard; roles are scoped with `roles.tenant_id`.

## Model

```text
Workspace
  → Users (tenant DB / tenancy-scoped users table)
  → Roles (central roles table, tenant_id = workspace UUID)
  → Permissions (global names on guard tenant-api)
  → Application access (policies + middleware)
```

| Layer | Concern | Enforcement |
|-------|---------|-------------|
| Tenancy | Workspace isolation | Stancl tenancy + `X-Tenant-Domain` / host |
| Module licensing | Workspace owns the domain | `module:{slug}` middleware |
| RBAC | User may act inside that domain | Spatie `can:{permission}` / policies |

Both module ownership and permission checks are required for module features:

```text
Workspace owns module? → User has permission? → Allow; otherwise deny
```

Core Administration (Users, Roles, Settings) does not require a module subscription; it uses Spatie permissions only.

## Isolation approach

Spatie **teams** are not enabled. Isolation uses:

1. `roles.tenant_id` set to the workspace UUID when roles are created (provisioning + CRUD).
2. Unique index `(tenant_id, name, guard_name)`.
3. Role assignment by **Role model instance** (not bare name), so Spatie attaches the correct row.
4. Permission validation: `exists:roles,name` filtered by current `tenant_id` + `guard_name = tenant-api`.
5. `RolePolicy` / `TenantUserPolicy` ensure actors only see/mutate resources in the current workspace.

Permissions remain a shared vocabulary defined in `config/tenant-permissions.php` (e.g. `users.list`, `leads.view`, `communication-templates.use`). They are not copied per tenant.

**How permissions reach production:**

| Moment | Mechanism |
|--------|-----------|
| New workspace | `TenantAuthorizationProvisioningService::provisionDefaults()` during `TenantProvisioningService` |
| Existing workspace + new permissions | Additive **data migration** via `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])` |
| Login / dashboard / role listing | **Never** mutates roles or permissions |

Do not run permission seeders in production. Do not `syncPermissions()` on customized roles during deploy.

### Legacy shared roles

Workspaces created before isolation may still have users on `tenant_id = null` roles. Repair is an explicit maintenance operation; authenticated requests never mutate authorization state. Operators run:

```bash
php artisan tenants:isolate-roles
```

## Owner

- Role name: `superadmin` (`TenantAuthorizationProvisioningService::OWNER_ROLE`)
- Created during workspace registration
- Receives all tenant-api permissions
- Protected from deletion (`config/tenant-protected-roles.php`)
- Cannot access the Central Application (separate guard / user model)

Default undeletable roles: `admin`, `manager`, `staff` (editable permissions; not deletable).

## API (tenant)

Prefix: `/api/tenant/v1` · Guard: `auth:tenant-api`

| Resource | Routes |
|----------|--------|
| Users | CRUD + suspend / unsuspend / restore / force-delete / change-password / verify-email / resend-verification |
| Roles | CRUD + clone |
| Permissions matrix | `GET roles/permissions-matrix` |

Services: `TenantUserService`, `TenantRoleService`. Policies gate every mutating action.

## Frontend

Shared Central pages are reused with `getAuthContext()`:

| Path | Page |
|------|------|
| `/users` | `UsersPage` (no Invite; workspace copy) |
| `/roles` | `RolesPage` |
| `/roles/matrix` | `RolesMatrixPage` |

Axios uses the tenant API base when the SPA is on a tenant path. Navigation: Administration → Users / Roles (`PERMISSIONS.users.list` / `roles.list`).

## Tests

- Pest: `tests/Feature/Tenant/User/`, `tests/Feature/Tenant/Role/` (CRUD, assignment, isolation, authorization)
- Playwright: `npm run test:e2e:tenant-rbac`
