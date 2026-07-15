# Tenant Application — User Guide

The Tenant Application is your workspace home. It uses the same layout as the Central admin console so navigation, headers, and page structure feel familiar.

## Tenant navigation

The left sidebar includes:

| Item | Purpose |
|------|---------|
| **Dashboard** | Workspace overview with module widgets |
| **Leads** | CRM pipeline (Kanban/table, notes, follow-ups) |
| **Tasks** | Work items (board/list, status, priority, comments) |
| **Settings** | Workspace preferences |
| **Profile** | Your name, email, and password |

Header actions match Central:

- Collapse / expand the sidebar
- Breadcrumbs
- Search (⌘K / Ctrl+K)
- Theme toggle
- **Notifications** — in-app list with unread badge (polls every 25s; live push deferred)
- Settings shortcut
- Account menu (Profile, Settings, Log out)

Only modules available to every workspace are listed today. Additional purchased modules will appear in the sidebar when they are installed.

## Dashboard overview

`GET /dashboard` returns workspace info plus a **widget registry**. You may see:

- **Pipeline / sources / revenue** — when Leads is installed and you can view leads
- **Today’s / overdue follow-ups** and deals closing soon — Leads-scoped
- **Upcoming / overdue tasks** — when Tasks is installed and you can view tasks
- **Activity feed**, **notifications** preview, and **quick actions**

Widget data respects module licensing, your permissions, and assignee scope (without assign permission you only see your own leads/tasks). There is **no calendar widget** until the Calendar module ships.

## Switching apps

| App | Typical entry |
|-----|----------------|
| Tenant (workspace) | `/login` → `/dashboard` |
| Central (platform admin) | `/central/login` → `/central/dashboard` |

Sessions are isolated. Logging into one app does not automatically sign you into the other.
