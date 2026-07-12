# Tenant API v1 — Leads

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:leads`, plus permission middleware / policies.

## Lead stages

### GET `/lead-stages`

Returns seeded pipeline stages for the workspace.

## Leads CRUD

### GET `/leads`

Query: `search`, `status`, `stage_id`, `assigned_to` (`unassigned` or user id), `trashed`, `sort`, `direction`, `page`, `per_page`.

### POST `/leads`

Body: `name` (required), `email`, `phone`, `company`, `job_title`, `source`, `estimated_value`, `stage_id`, `assigned_to`.

### GET `/leads/{id}`

Includes stage, assignee, notes, follow-ups, activities.

### PUT `/leads/{id}`

Partial update of lead fields (including `stage_id` / `assigned_to`).

### DELETE `/leads/{id}`

Soft delete.

## Actions

### POST `/leads/{id}/assign`

`{ "assigned_to": number|null }`

### POST `/leads/{id}/stage`

`{ "stage_id": number }` — syncs status from stage `is_won` / `is_lost`.

### POST `/leads/{id}/notes`

`{ "body": string }`

### POST `/leads/{id}/follow-ups`

`{ "title", "due_at", "notes?", "assigned_to?" }`

### POST `/leads/{id}/follow-ups/{followUpId}/complete`

Marks follow-up completed.

### GET `/leads/{id}/timeline`

CRM activity timeline entries.
