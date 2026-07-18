# Multi-Provider Email Delivery

Platform infrastructure for Central and Tenant outgoing mail. SMTP remains fully supported; Postmark and Mailgun are first-class API drivers.

## Architecture

Application code continues to send through Laravel `Mail` / Notification mail channels. Runtime provider selection is handled by:

| Class | Role |
|-------|------|
| `EmailConfigResolver` | Builds `EmailConfig` from Central / Tenant settings (+ env fallback) |
| `EmailManager` | Clears prior secrets, applies config to Laravel mailers, calls `Mail::forgetMailers()` |
| `EmailDriverInterface` | Provider-specific config mapping + validation |
| `ApplyEmailRuntimeConfig` | Queue middleware that re-applies config on the `emails` worker, then clears secrets |
| `ApplyCentralEmailRuntimeConfig` | Central HTTP middleware (`central.mail`) re-applies Central mail every request |

Drivers are registered in `config/email.php`.

## Tenant modes

| `mail_mode` | Behavior |
|-------------|----------|
| `system` (default) | Inherit Central provider + From identity |
| `custom` | Tenant-owned SMTP / Postmark / Mailgun |

Backward compatible: a filled tenant `mail_host` without `mail_mode` still counts as custom SMTP. Run:

```bash
php artisan email:migrate-tenant-mail-modes
```

## Settings keys

Shared mail group keys (Central `system_settings` / Tenant `tenant_settings`):

- `mail_provider` (canonical) / `mail_driver` (legacy alias, kept in sync)
- SMTP: `mail_host`, `mail_port`, `mail_username`, `mail_password`, `mail_encryption`
- Postmark: `mail_postmark_token`, `mail_postmark_message_stream`
- Mailgun: `mail_mailgun_secret`, `mail_mailgun_domain`, `mail_mailgun_endpoint`
- Identity: `mail_from_name`, `mail_from_address`, `mail_reply_to`, `mail_timeout`
- Tenant only: `mail_mode`

Secrets are encrypted at rest and masked as `********` in admin APIs.

## Test email

- Central: `POST /api/central/v1/system-settings/test-mail`
- Tenant: `POST /api/tenant/v1/settings/test-mail`

Optional `settings` object tests unsaved draft credentials. Response includes `success`, `code`, `provider`, `duration_ms`.

## Email logs

- Central: `GET /api/central/v1/email-logs`
- Tenant: `GET /api/tenant/v1/email-logs`
- Permissions: `email-logs.list`, `email-logs.view`
- Retention: `php artisan email-logs:prune` (scheduled weekly)

## Queue workers

```bash
php artisan queue:work --queue=emails,default
```

Restart workers after changing mail credentials (`queue:restart`).

## Extending with a new provider

1. Implement `EmailDriverInterface`
2. Register in `config/email.php` → `drivers`
3. Add settings catalog keys + validation + UI conditional fields
4. Nothing else — notifications/mailables stay unchanged

## Future / Enterprise stubs

- `config/email.php` → `queue`, `failover`, `webhooks`
- `SupportsWebhooks` / `SupportsSuppression` capability interfaces
- `EmailResendService`, `EmailAnalyticsService` (stubs until follow-on PRs)
- Retry/DLQ, provider webhooks, and failover routing remain follow-on PRs
