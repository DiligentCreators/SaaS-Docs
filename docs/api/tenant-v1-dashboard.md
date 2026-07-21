# Tenant API v1 — Dashboard

Base path: `/api/tenant/v1`

### GET `/dashboard`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `subscription`. Authorization: `dashboard.view`.

Returns workspace chrome plus a **widget registry**. Widgets are filtered by installed module, Spatie permission, and assignee scope.

## Payload

| Key | Description |
|-----|-------------|
| `welcome` | Greeting string |
| `workspace` | Company / slug / email / timezone / currency / locale |
| `installed_modules` | Active module subscriptions (`slug`, `name`, `status`) |
| `widgets` | Ordered list of widget objects (see below) |
| `scope` | `org` if the user has `leads.assign` or `tasks.assign` (or superadmin); otherwise `mine` |

## Widget shape

```json
{
  "id": "pipeline_overview",
  "module": "leads",
  "permission": "leads.view",
  "scope": "org",
  "data": {}
}
```

`module` may be `null` for core widgets. `scope` is `org` or `mine` for the data inside `data`.

## Registered widgets (Sprint 2)

| id | Module gate | Permission | Notes |
|----|-------------|------------|--------|
| `pipeline_overview` | `leads` | `leads.view` | Counts / values by stage |
| `lead_sources` | `leads` | `leads.view` | Source breakdown |
| `revenue_pipeline` | `leads` | `leads.view` | Open-pipeline `lead_value` totals |
| `todays_follow_ups` | `leads` | `leads.view` | |
| `overdue_follow_ups` | `leads` | `leads.view` | |
| `deals_closing_soon` | `leads` | `leads.view` | |
| `upcoming_tasks` | `tasks` | `tasks.view` | |
| `overdue_tasks` | `tasks` | `tasks.view` | |
| `calendar` | `calendar` | `calendar.view` | Upcoming events; scoped by `calendar.view_all` |
| `activity_feed` | — | `dashboard.view` | Recent lead/task activity |
| `notifications` | — | `dashboard.view` | Unread count + recent (scoped to current user) |
| `quick_actions` | — | `dashboard.view` | Shortcuts gated by module + permission |

Leads/tasks widgets apply assignee scoping: without the module’s `*.assign` permission, data is limited to the current user’s assignments. Calendar uses `calendar.view_all` for org vs mine (no calendar assignment).

## Explicitly not included

- Dedicated Week/Day **dashboard** widgets (Week/Day live on the Calendar page), Meetings host assignment, external calendar sync

Implementation: `App\Services\Tenant\DashboardWidgetService`.
