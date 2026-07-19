# Email provider webhooks

Inbound delivery webhooks for API mail providers (Postmark, Mailgun). SMTP / log / array / sendmail do not support webhooks.

## Endpoints

| Scope | Method | Path |
|-------|--------|------|
| Central | `POST` | `/webhooks/email/{provider}` |
| Tenant (custom mail) | `POST` | `/webhooks/email/{provider}/{tenant}` |

`{provider}` is the driver slug (`postmark`, `mailgun`). `{tenant}` is the Stancl tenant string id (UUID).

Both routes are CSRF-exempt (`webhooks/email/*`) and rate-limited (`throttle:webhooks`).

## Feature flag

| Env | Default | Purpose |
|-----|---------|---------|
| `EMAIL_WEBHOOKS_ENABLED` | `true` | Master switch (503 when false) |
| `EMAIL_WEBHOOK_TOLERANCE` | `300` | Mailgun signature timestamp skew (seconds) |

## Settings

Central `system_settings` / Tenant `tenant_settings`:

| Key | Type | Notes |
|-----|------|--------|
| `mail_webhook_secret` | encrypted string | Postmark Basic Auth password / Mailgun signing key |
| `mail_webhook_events` | JSON array | Platform event keys to process |

Admin GET settings responses include `meta.mail_webhook` with `webhook_url`, `available_events`, `selected_events`, `instructions`, and `has_webhook_secret`.

Tenant `mail_mode=system` does not expose a tenant webhook URL — configure Central.

## Platform event keys

Drivers advertise a catalog; the UI multiselect stores these keys:

`delivered`, `bounced`, `complained`, `opened`, `clicked`, `failed`

Defaults when unset: `delivered`, `bounced`, `complained`.

## Processing

1. Resolve driver via `EmailDriverRegistry` (`SupportsWebhooks`).
2. Verify signature with the scoped webhook secret.
3. Parse provider payload → normalized events.
4. Filter by `mail_webhook_events`.
5. Match `CentralEmailLog` / `TenantEmailLog` by `message_id` and update status / `meta` (idempotent via `meta.webhook_event_ids`).

### Status progression

Typical path: `sending` → `sent` → `delivered` → `opened` → `clicked`.

- Open/Click webhooks set status to `opened` / `clicked` (and increment `meta.opens` / `meta.clicks`).
- Engagement statuses are not downgraded back to `delivered`.
- Terminal statuses (`bounced`, `complained`, `failed`) are not overwritten by open/click.

### Provider tracking requirements

Selecting Open/Click in Central/Tenant settings only controls which inbound events SaleOS processes. You must also enable Open/Click on the **provider webhook** and turn on open/link tracking in the provider console (e.g. Postmark server tracking). Settings save does not sync checkboxes into Postmark/Mailgun.

## Extending a new provider

1. Implement `EmailDriverInterface` + `SupportsWebhooks`.
2. Register in `config/email.php` → `drivers`.
3. Advertise `webhookEvents()`, `verifySignature()`, `parseEvents()`, `setupInstructions()`.
4. No controller or UI branching on provider name is required beyond the driver catalog.

## Related

- [Multi-Provider Email](/developer-guide/multi-provider-email)
- Body logging + [manual resend](/developer-guide/multi-provider-email#manual-resend) (same email logs surface)
