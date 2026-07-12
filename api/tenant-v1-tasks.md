# Tenant API v1 — Tasks

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:tasks`, plus permission middleware / policies.

## Tasks CRUD

### GET `/tasks`

Query: `search`, `status`, `priority`, `assigned_to` (`unassigned` or user id), `trashed`, `sort`, `direction`, `page`, `per_page`.

### POST `/tasks`

Body: `title` (required), `description`, `status`, `priority`, `due_at`, `assigned_to`.

### GET `/tasks/{id}`

Includes assignee, creator, notes, activities.

### PUT `/tasks/{id}`

Partial update of task fields (including `status` / `priority` / `assigned_to` / `due_at`).

### DELETE `/tasks/{id}`

Soft delete.

## Actions

### POST `/tasks/{id}/assign`

`{ "assigned_to": number|null }`

### POST `/tasks/{id}/complete`

Marks status `completed` and sets `completed_at`.

### POST `/tasks/{id}/reopen`

Clears completion and returns the task to an open/in-progress state.

### POST `/tasks/{id}/notes`

`{ "body": string }`

### GET `/tasks/{id}/timeline`

Task activity timeline entries.
