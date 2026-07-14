# Tenant API v1 — Tasks

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:tasks`, plus permission middleware / policies.

Assignee scoping: without `tasks.assign` (and not superadmin), list/board/stats only include tasks where `assigned_to` is the current user.

## Stats & board

### GET `/tasks/stats`

Same filters as list (minus pagination/sort). Payload includes:

`total_tasks`, `my_tasks`, `due_today`, `due_this_week`, `overdue`, `completed_today`, `completion_rate`, `scope` (`org`|`mine`).

### GET `/tasks/board`

One column per status (`open`, `in_progress`, `waiting`, `completed`, `cancelled`): `status`, `task_count`, `tasks[]`. Honors the same filters as list.

## Tasks CRUD

### GET `/tasks`

Query: `search`, `status`, `priority`, `assigned_to` (`unassigned` or user id), `trashed`, `sort`, `direction`, `page`, `per_page`.

Status values: `open`, `in_progress`, `waiting`, `completed`, `cancelled`.  
Priority values: `low`, `medium`, `high`, `urgent`.

### POST `/tasks`

Body: `title` (required), `description`, `status`, `priority`, `due_at`, `assigned_to`.

Initial `due_at` on create does not require `tasks.change_due_date`.

### GET `/tasks/{id}`

Includes assignee, creator, notes, activities.

### PUT `/tasks/{id}`

Partial update of task fields (including `status` / `priority` / `assigned_to` / `due_at`).

Changing `due_at` after create requires `tasks.change_due_date` (403 otherwise).

### DELETE `/tasks/{id}`

Soft delete.

## Actions

### POST `/tasks/{id}/assign`

`{ "assigned_to": number|null }`

### POST `/tasks/{id}/complete`

Marks status `completed` and sets `completed_at`.

### POST `/tasks/{id}/reopen`

Clears completion and returns the task to a non-completed status (typically open/in-progress workflow in the UI).

### POST `/tasks/{id}/notes`

`{ "body": string }` — comments in the UI.

### GET `/tasks/{id}/timeline`

Task activity timeline entries (History tab).
