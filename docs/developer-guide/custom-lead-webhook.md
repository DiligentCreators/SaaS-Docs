# Custom Lead Webhook

> Tenant-scoped inbound webhooks for Zapier, Make, websites, and form plugins.

## Overview

Each workspace can create one or more webhook endpoints under **Leads → Integrations → Webhooks**.

| Item | Detail |
|------|--------|
| Permission | `leads.manage_integrations` |
| Module | `module:leads` |
| Driver | `custom_webhook` (`CustomWebhookDriver`) |
| Ingress | `POST /webhooks/leads/custom/{uuid}` |
| Auth | `Authorization: Bearer <api_key>` **or** `X-SaleOS-Key` **or** HMAC via `X-SaleOS-Signature` + `X-SaleOS-Timestamp` |
| Default source | Tenant-editable (`default_source`, factory default `Webhook`) |
| Payload override | Body field `source` overrides the endpoint default when non-empty |
| Module gate | Ingress rejects when tenant lacks active `module:leads` |
| Body limit | 64 KB |

Secrets are returned **once** on create/rotate. List APIs return `has_api_key` / `has_signing_secret` only.

### HMAC signing

```text
X-SaleOS-Timestamp: <unix_seconds>
X-SaleOS-Signature: hex(hmac_sha256("{timestamp}.{rawBody}", signing_secret))
```

Timestamp must be within ±5 minutes of server time.

## Payload

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "phone": "+1-555-0100",
  "company": "Analytical Engines",
  "job_title": "Mathematician",
  "source": "Optional override",
  "external_id": "zapier-row-123",
  "utm_source": "google",
  "custom_fields": { "budget": "10k" }
}
```

`name` is required (or `full_name`). Unknown keys fold into `custom_fields`.

## Responses

| Status | Meaning |
|--------|---------|
| `201` + `"status":"created"` | Lead created |
| `200` + `"status":"skipped"` | Duplicate / already processed (`external_id` or email/phone) |
| `401` | Invalid credentials |
| `404` | Unknown or inactive endpoint |
| `422` | Validation error |

## Management API

- `GET/POST /api/tenant/v1/leads/integrations/webhooks`
- `PUT /api/tenant/v1/leads/integrations/webhooks/{id}`
- `POST .../rotate`
- `DELETE .../{id}`

## Related

- [Lead Source Driver Architecture](/developer-guide/lead-source-driver-architecture)
- [Meta Lead Ads](/developer-guide/meta-lead-ads-integration)
- [Tenant Leads API](/api/tenant-v1-leads)
