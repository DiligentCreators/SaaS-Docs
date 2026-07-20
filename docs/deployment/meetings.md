# Meetings — Deployment

```bash
php artisan migrate
```

Migrations register the `meetings` catalog module, permissions, meeting tables, and `api_idempotency_keys`.

Optional env (**enable flags only**). Configure OAuth apps in **Administration → Provider Credentials** ([ADR-007](/architecture/adr/adr-007-tenant-owned-integration-credentials)).

```env
MEETINGS_DEFAULT_PROVIDER=builtin
MEETINGS_BUILTIN_ENABLED=true
INTEGRATIONS_GOOGLE_ENABLED=true
INTEGRATIONS_GOOGLE_MEET_ENABLED=true
INTEGRATIONS_ZOOM_ENABLED=false
# INTEGRATIONS_*_CLIENT_ID/SECRET are deprecated and unbound — do not set
```

Manifests: `builtin`, `zoom`, `google-meet` (Provider Credentials + connection tokens on primary `google`).

OAuth redirect URIs (API host — fixed; tenants register these on **their** OAuth apps): `/oauth/callback/google`, `/oauth/callback/zoom`.

Tenant settings used for provider selection:

- `meetings_provider`
- `meetings_provider_last_validation`

Production uses data migrations — do not rely on `db:seed`.

Deploy frontend with `/meetings` and `/meetings/providers`. Calendar continues to read ScheduleItems only; no Calendar FK from Meetings.

**Credentials split:** application secrets → Provider Credentials; runtime tokens → Connections Center. See [Tenant-Owned Integration Credentials](/developer-guide/tenant-owned-integration-credentials).
