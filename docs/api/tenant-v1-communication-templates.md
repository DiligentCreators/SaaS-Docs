# Tenant API v1 — Communication Templates

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:communication-templates`, plus permission middleware / policies.

Route parameter `{communication_template}` resolves by **uuid**.

Bodies are **plain text only**. Placeholder tokens use `{{snake_case}}`. Unknown tokens are rejected on create/update.

## Meta

### GET `/communication-templates/meta/contexts`

Permission: `communication-templates.view`

Returns registered contexts:

```json
[{ "context": "leads", "label": "Leads" }]
```

### GET `/communication-templates/meta/placeholders?context=leads`

Permission: `communication-templates.view`

Returns placeholder definitions (`key`, `label`, `group`, `description`, `sample`) for the context plus shared agent/workspace/system placeholders.

## CRUD

### GET `/communication-templates`

Permission: `communication-templates.view`

Query: `search`, `context`, `channel`, `category`, `is_active`, `trashed`, `sort` (`name`|`created_at`|`updated_at`|`last_used_at`), `direction`, `page`, `per_page`.

### POST `/communication-templates`

Permission: `communication-templates.create`

Body:

| Field | Rules |
|-------|--------|
| `name` | required, max 120, unique per tenant+context+channel (non-deleted) |
| `context` | required, must be a registered context |
| `channel` | required; MVP: `whatsapp` |
| `category` | nullable, max 80 |
| `body` | required, max 4000; only known `{{tokens}}` |
| `is_active` | boolean, default true |

### GET `/communication-templates/{uuid}`

Permission: `communication-templates.view`

### PUT `/communication-templates/{uuid}`

Permission: `communication-templates.update`

Same fields as create.

### DELETE `/communication-templates/{uuid}`

Permission: `communication-templates.delete`

Soft delete.

## Preview & render

Rendering is **generic**: the API resolves placeholders through the registry for `template.context`. Product modules only supply `entity_id`.

### POST `/communication-templates/{uuid}/preview`

Permission: `communication-templates.view` or `use`

Body: `{ "entity_id": 123 }` optional.

- Without `entity_id`: sample values + live agent/workspace/system values.
- With `entity_id`: live entity resolve (must pass entity policy `view`).

Does **not** update `last_used_at`.

Response:

```json
{
  "body": "Hello Jane…",
  "channel": "whatsapp",
  "missing_placeholders": []
}
```

### POST `/communication-templates/{uuid}/render`

Permission: `communication-templates.use`

Body: `{ "entity_id": 123 }` required.

Template must be active. For WhatsApp, entity must have a valid phone (digits only, min 8).

Response:

```json
{
  "body": "Hello Jane…",
  "channel": "whatsapp",
  "phone": "15551234567",
  "wa_me_url": "https://wa.me/15551234567?text=…",
  "missing_placeholders": ["company"]
}
```

Updates `last_used_at` on success.

Frontend should open `wa_me_url` in a new tab. The API does **not** send WhatsApp messages.

## Related

- [Developer guide](/developer-guide/communication-templates)
- [User guide](/user-guide/communication-templates)
