# Tenant API v1 — Integrations & Connections

Base path: `/api/tenant/v1`  
Auth: `auth:tenant-api` + tenant context  

Architecture: [Tenant-Owned Integration Credentials](/developer-guide/tenant-owned-integration-credentials) · [ADR-007](/architecture/adr/adr-007-tenant-owned-integration-credentials)

## Permissions

| Area | Permissions |
|------|-------------|
| Connections Center (shipped) | `connections.view`, `connections.manage`, `connections.manage_user` |
| Provider Credentials (planned — Phases C–E) | `provider_credentials.view`, `.manage`, `.validate`, `.rotate` |

## Integrations (discovery)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/integrations` | `connections.view` |
| GET | `/integrations/{slug}` | `connections.view` |
| GET | `/integrations/{slug}/capabilities` | `connections.view` |

### Manifest v1.1 discovery fields (planned)

Discovery responses will also expose non-secret credential metadata:

- `credential_type`
- `credential_schema` (field definitions only — never values)
- `supports_validation`
- `supports_rotation`
- existing `connection_integration`, `connection_type`, `oauth_provider`

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

OAuth start is **gated** on validated Provider Credentials after ADR-007 cutover (hard-block). No platform env fallback for client id/secret.

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

## Provider Credentials (planned — Phases C–E)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/provider-credentials` | `provider_credentials.view` |
| GET | `/provider-credentials/{integration}` | `provider_credentials.view` |
| PUT | `/provider-credentials/{integration}` | `provider_credentials.manage` |
| POST | `/provider-credentials/{integration}/validate` | `provider_credentials.validate` |
| POST | `/provider-credentials/{integration}/rotate` | `provider_credentials.rotate` |
| DELETE | `/provider-credentials/{integration}` | `provider_credentials.manage` |

Application secrets are never returned. Secret fields expose `is_set` only after save. See ADR-007 for contracts.

## OAuth callback (Central/API host)

`GET /oauth/callback/{provider}` — not under `/api/tenant/v1`. Fixed platform redirect URI (ADR-004). Resolves tenant from OAuth state and redirects to the SPA.

Tenants register this URL in **their** provider developer consoles (tenant-owned OAuth apps).

## Correlation

Send `X-Correlation-ID`; the API echoes it on the response.

## Related

- [Integration Framework](/developer-guide/integration-framework)
- [Implementation Roadmap](/developer-guide/tenant-owned-credentials-implementation-roadmap)
