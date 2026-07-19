# Meetings — Deployment

```bash
php artisan migrate
```

Migrations register the `meetings` catalog module, permissions, meeting tables, and `api_idempotency_keys`.

Optional env:

```env
MEETINGS_DEFAULT_PROVIDER=builtin
MEETINGS_BUILTIN_ENABLED=true
INTEGRATIONS_ZOOM_ENABLED=false
INTEGRATIONS_ZOOM_CLIENT_ID=
INTEGRATIONS_ZOOM_CLIENT_SECRET=
```

Manifests: `builtin.integration.php`, `zoom.integration.php`.

Zoom OAuth redirect URI (API host): `/oauth/callback/zoom`.

Tenant settings used for provider selection:

- `meetings_provider`
- `meetings_provider_last_validation`

Production uses data migrations — do not rely on `db:seed`.

Deploy frontend with `/meetings` and `/meetings/providers`. Calendar continues to read ScheduleItems only; no Calendar FK from Meetings. Credentials for future external providers remain in Connections Center only.
