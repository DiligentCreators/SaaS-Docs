# ADR-002 Amendment — Integration Manifest v1.1

- **Status:** Accepted amendment (Architecture Frozen — Phase A approved 2026-07-20)
- **Date:** 2026-07-20
- **Original ADR-002:** Integration Manifest v1 (declarative `*.integration.php`, boot-time validation, registry discovery)
- **Companion:** [ADR-007](./adr-007-tenant-owned-integration-credentials), [ADR-004 amendment](./adr-004-oauth-architecture-amendment)
- **ADR-005:** `connection_integration` semantics unchanged

## Context

Manifest v1 describes connection type, OAuth provider slug, capabilities, adapters, health checks, settings schema, and optional `connection_integration` for satellites. It does **not** declare how tenants supply **application** credentials.

ADR-007 requires schema-driven provider credentials so new providers need **zero** database migrations for secret shapes.

## Decision

Bump the Integration Manifest contract to **v1.1** with additive, backward-compatible fields for Provider Credentials.

`manifest_version` may remain `1` in PHP files if the loader treats v1.1 fields as optional extensions of Manifest v1; documentation and validators refer to the contract as **Manifest v1.1**. (Exact `manifest_version` integer bump is a Phase C implementation note — architecture does not require a breaking version integer if defaults preserve boot.)

## New / clarified fields

| Field | Type | Purpose |
|-------|------|---------|
| `credential_type` | `oauth_app` \| `api_key` \| `basic` \| `none` | How application credentials are shaped |
| `credential_schema` | object | Field definitions for Admin UI + server validation |
| `credential_validator` | class-string \| null | Optional live validation class |
| `supports_validation` | bool | Whether Validate action is offered |
| `supports_rotation` | bool | Whether Rotate flow is offered |
| `connection_integration` | string \| null | **Unchanged (ADR-005)** — primary slug for satellite credential/connection host |

Do **not** add redundant `primary_provider` / `satellite_provider` booleans. Primary vs satellite remains:

- Primary: `connection_integration` is null or equals `slug`
- Satellite: `connection_integration` points at another slug

### `credential_schema` shape (normative)

```php
'credential_schema' => [
    'type' => 'object',
    'fields' => [
        [
            'key' => 'client_id',
            'label' => 'Client ID',
            'input' => 'text',       // text|password|url|select
            'secret' => false,
            'required' => true,
            'validation' => ['string', 'max:255'],
        ],
        [
            'key' => 'client_secret',
            'label' => 'Client Secret',
            'input' => 'password',
            'secret' => true,
            'required' => true,
            'validation' => ['string', 'max:512'],
        ],
    ],
],
```

Satellites **omit** `credential_schema` (or leave empty) and inherit the primary’s credentials via `connection_integration`.

### Recommended defaults by `connection_type`

| `connection_type` | Typical `credential_type` |
|-------------------|---------------------------|
| `oauth` | `oauth_app` |
| `api_key` | `api_key` |
| `basic` | `basic` |
| `none` | `none` |

## Manifest discovery API additions

Discovery responses (`GET /integrations`, `GET /integrations/{slug}`) **must** expose non-secret credential metadata so the SPA can render Provider Credentials UI:

- `credential_type`
- `credential_schema` (field metadata only — never values)
- `supports_validation`
- `supports_rotation`
- existing `connection_integration` / connection_type / oauth_provider

Secrets and masked values are served only from Provider Credentials endpoints (Implementation Phase E), not from discovery.

## Backward compatibility

| Case | Behavior |
|------|----------|
| Manifest missing v1.1 fields | Treat as `credential_type=none`, empty schema, supports_validation/rotation false |
| Boot outside production | Invalid **new** field shapes fail validation (same ManifestValidator policy) |
| Production | Invalid slug disabled/logged (existing policy) |
| Existing satellites | Unchanged; still excluded from Connections Center discovery |

No database migration is required for Manifest v1.1 itself (config files only). Database work for credentials is ADR-007 / Implementation Phase C.

## Consequences

- `ManifestValidator` / `IntegrationManifest` DTO gain additive properties (Phase C/D).
- Primary manifests for `google`, `microsoft`, `zoom` gain concrete schemas in Implementation Phase D.
- Future providers (Twilio, Meta, etc.) add a manifest + optional validator class only.

## Related

- [ADR-007](./adr-007-tenant-owned-integration-credentials)
- [Integration Framework](/developer-guide/integration-framework)
- [Tenant Integrations API](/api/tenant-v1-integrations)
