# Tenant API v1 — Leads

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:leads`, plus permission middleware / policies.

Assignee scoping: without `leads.assign` (and not superadmin), list/board/stats/export only include leads where `assigned_to` is the current user.

## Lead stages

### GET `/lead-stages`

Returns seeded pipeline stages for the workspace (New … Won / Lost).

## Stats & board

### GET `/leads/stats`

Same filters as list (minus pagination/sort). Payload includes:

`total_leads`, `my_leads`, `pipeline_value`, `todays_follow_ups`, `overdue_follow_ups`, `won_this_month`, `average_lead_value`, `conversion_rate`, `scope` (`org`|`mine`).

Pipeline / won metrics use stage `is_won` / `is_lost` flags, not lead status.

### GET `/leads/board`

Columns per stage: `stage`, `lead_count`, `total_lead_value`, `leads[]`. Honors the same filters as list.

## Leads CRUD

### GET `/leads`

Query: `search`, `status`, `stage_id`, `priority`, `assigned_to` (`unassigned` or user id), `lead_value_min`, `lead_value_max`, `trashed`, `sort`, `direction`, `page`, `per_page`.

Status values: `active`, `waiting`, `on_hold`, `closed`, `archived`.

### POST `/leads`

Body: `name` (required), `email`, `phone`, `company`, `job_title`, `source`, `lead_value` (or legacy alias `estimated_value`), `priority`, `status`, `stage_id`, `assigned_to`.

### GET `/leads/{id}`

Includes stage, assignee, notes, follow-ups, activities, assignment histories. Exposes `converted_at` / `is_converted`.

### PUT `/leads/{id}`

Partial update of lead fields (including `stage_id`, `status`, `priority`, `lead_value`, `assigned_to`). Stage change does **not** sync status.

### DELETE `/leads/{id}`

Soft delete.

## Export

### GET `/leads/export`

Permission: `leads.export`.

Query: same filters as list, plus `format` = `csv` (default) or `xlsx`. Streams a download of the filtered set.

## Actions

### POST `/leads/{id}/assign`

`{ "assigned_to": number|null, "reason"?: string }` — records assignment history.

### POST `/leads/{id}/stage`

`{ "stage_id": number }` — updates stage only (status unchanged).

### POST `/leads/{id}/convert`

Permission: `leads.convert`.

Optional body: `{ "notes"?: string }`.

Stub until Contacts exist: sets `converted_at`, `conversion_meta` (includes `stub: true`), status `closed`, and a converted activity. Does not create contact records.

### POST `/leads/{id}/notes`

`{ "body": string }`

### POST `/leads/{id}/follow-ups`

`{ "title", "due_at", "notes?", "assigned_to?" }`

### PUT `/leads/{id}/follow-ups/{followUpId}`

Partial update (`title`, `due_at`, `notes`, `assigned_to`). Changing `due_at` is treated as a reschedule in the activity timeline.

### POST `/leads/{id}/follow-ups/{followUpId}/complete`

Marks follow-up completed.

### GET `/leads/{id}/timeline`

CRM activity timeline entries.

### GET `/leads/{id}/assignment-history`

Ordered assignment change rows (`old_user`, `new_user`, `changed_by`, `reason`, timestamps).
