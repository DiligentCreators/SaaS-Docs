# Tenant RBAC — User Guide

Manage who can access your workspace and what they can do.

## Users

Open **Administration → Users**.

| Action | How |
|--------|-----|
| View | Search, filter by status, open a row |
| Create | **New user** → name, email, password, roles |
| Edit | Row menu → **Edit** → update details and roles |
| Activate / Deactivate | Suspend / Unsuspend (when available) |
| Reset password | Row menu → change password |
| Resend verification | Row menu → **Resend verification** (unverified users; requires `users.verify`) |
| Mark email verified | Row menu → **Mark as verified** when the member never received the email (requires `users.verify`) |
| Delete | Row menu → **Delete** (if your role allows it) |

Each person belongs only to **this** workspace. They cannot see users from other workspaces.

Roles control what the user can do. Prefer assigning roles rather than asking for one-off exceptions.

## Roles

Open **Administration → Roles**.

| Action | How |
|--------|-----|
| Create | **New role** → name |
| Edit | Row menu → **Edit** → toggle permissions |
| Clone | Row menu → **Clone** |
| Delete | Row menu → **Delete** (not allowed for Owner / system defaults) |
| Matrix | **Permissions matrix** — read-only overview by module group |

Example roles you might create: Sales Manager, Sales Agent, Finance, Support. Defaults often include Owner (`superadmin`), Administrator, Manager, and Staff.

## Permissions

Permissions are checked actions such as `users.list` or `leads.create`.

- Granted to **roles**, not directly to users (standard setup).
- Grouped by area (Users, Roles, Settings, Leads, Tasks, …) when editing a role.
- The permissions list / matrix is read-only; change access by editing roles.

## Modules and access

Two checks apply to product areas (e.g. Leads):

1. Your workspace must **own** (subscribe to) the module.
2. Your role must include the needed permission.

If the workspace does not own the module, nobody can use it—even with permissions assigned.

## Owner

The person who registered the workspace is the Owner. They have full workspace access by default, can add administrators, and manage users, roles, and settings. They do **not** access the Central (platform) admin console.
