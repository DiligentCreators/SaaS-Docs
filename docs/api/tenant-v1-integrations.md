# Tenant API v1 — Integrations & Connections

Base path: `/api/tenant/v1`  
Auth: `auth:tenant-api` + tenant context  
Permissions: `connections.view` / `connections.manage`

## Integrations (discovery)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/integrations` | `connections.view` |
| GET | `/integrations/{slug}` | `connections.view` |
| GET | `/integrations/{slug}/capabilities` | `connections.view` |

## Connections

| Method | Path | Permission |
|--------|------|------------|
| GET | `/connections` | `connections.view` |
| GET | `/connections/{id}` | `connections.view` |
| POST | `/connections/{integration}/oauth/start` | `connections.manage` |
| POST | `/connections/{integration}/api-key` | `connections.manage` |
| POST | `/connections/{id}/test` | `connections.manage` |
| POST | `/connections/{id}/reconnect` | `connections.manage` |
| DELETE | `/connections/{id}` | `connections.manage` |

### OAuth start body (optional)

```json
{
  "owner_type": "tenant",
  "scopes": ["openid", "email", "profile"],
  "success_redirect_url": "http://localhost:5173/settings/connections"
}
```

Response includes `authorize_url` and `state`.

### Connection resource

Secrets (`access_token`, `refresh_token`, `credentials`) are **never** returned.

Fields include: `id`, `integration_slug`, `status`, `health_status`, `scopes`, `external_account_id`, `external_email`, `token_expires_at`, `last_tested_at`, `last_error_code`, `last_error_message`.

## OAuth callback (Central/API host)

`GET /oauth/callback/{provider}` — not under `/api/tenant/v1`. Resolves tenant from signed OAuth state and redirects to the SPA.

## Correlation

Send `X-Correlation-ID`; the API echoes it on the response.
