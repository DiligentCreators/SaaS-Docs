# Tenant Users API

Workspace user administration under `/api/tenant/v1/users` (Sanctum `tenant-api`, tenancy middleware, permission gates).

## CRM preference fields

Returned on list/show and accepted on create/update:

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `exclude_from_lead_auto_assign` | boolean | `false` | When `true`, user is omitted from lead assignee pickers and equal-distribution import/bulk. Workspace owners are typically `true`. |
| `receive_all_users_daily_summary` | boolean | `false` | When `true`, at **Daily Reminder Time** the user receives the **team** (user-wise) CRM summary email and **not** a personal summary. Grants visibility into other members’ open leads/tasks/meetings counts. Prefer Owner/Admin. |

Example create payload fragment:

```json
{
  "name": "Sales Manager",
  "email": "manager@example.com",
  "password": "Password1!",
  "role": ["manager"],
  "exclude_from_lead_auto_assign": false,
  "receive_all_users_daily_summary": true
}
```

These columns are not mass-assignable on the `User` model; `TenantUserService` applies them via `forceFill` after validation.

## Related

- [Tenant notifications — daily CRM summary](/api/tenant-v1-notifications#scheduled-due-digests)
- [Daily CRM summary production](/deployment/daily-crm-summary)
- [Tenant RBAC user guide](/user-guide/tenant-rbac)
