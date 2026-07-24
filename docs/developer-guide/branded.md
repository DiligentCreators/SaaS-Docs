# Branded module — Developer Guide

Billable marketplace module (`slug: branded`, not default-included). Licensing: `module:branded`. Permissions: `branded.view`, `branded.manage`.

## Domain model

Stancl `domains` rows:

| Column | Notes |
|--------|--------|
| `type` | `platform` \| `custom` |
| `verification_token` | TXT ownership token |
| `verified_at` | Set after DNS verify |
| `is_primary` | Preferred custom host for frontend links |
| `claimed_at` | Unverified claim TTL (`branded.claim_ttl_hours`) |

`PlatformDomainClassifier` treats `{label}.{suffix}` under `config('branded.platform_domain_suffixes')` as platform. Everything else (including `myai.com.pk`, `app.domain.co.uk`) is custom — no two-label TLD assumption.

## Resolution gate

`WorkspaceResolver::resolveFromHost`:

- Platform domains → always bind
- Custom domains → only when `verified_at` is set **and** `EntitlementService::hasModule($tenant, 'branded')`

Pointing DNS/IP without a verified entitled row does nothing.

## Tenant API

Prefix `/api/tenant/v1`, middleware `module:branded` + Spatie `can:`:

| Method | Path | Permission |
|--------|------|------------|
| GET | `/branded/domain` | `branded.view` |
| POST | `/branded/domain` | `branded.manage` |
| POST | `/branded/domain/verify` | `branded.manage` |
| DELETE | `/branded/domain` | `branded.manage` |

Service: `App\Services\Tenant\BrandedDomainService`. DNS via `App\Contracts\DomainDnsLookup` (`DnsGetRecordLookup` / `FakeDomainDnsLookup` in tests).

Central `TenantService` may only set **platform** hostnames.

## Brand chrome

- `App\Support\BrandedMail::apply()` on tenant mail notifications
- Published `resources/views/vendor/mail/html/message.blade.php` (+ button) for logo / brand name
- `EmailConfigResolver` overrides From name when branded is active
- `PlatformNotificationPayloadMapper` uses tenant logo/favicon + title prefix

## Cancel / deactivate

`ModuleSubscriptionService::cancel` / `deactivate` clears custom-domain verification when the module slug is `branded`.

## Production hardening

- Custom domain rows are **force-deleted** on remove / stale claim expiry so the unique `domains.domain` index can be reclaimed.
- Verify **fails closed** when `BRANDED_SERVER_IPV4` / `BRANDED_SERVER_IPV6` / `BRANDED_CNAME_TARGET` are all empty.
- `BrandedCustomDomainCors` allows API CORS only for Origins whose host is a verified + entitled custom domain.
- Scheduler: `branded:expire-stale-domain-claims` hourly.

## Tests

- Pest: `tests/Feature/Tenant/Branded/BrandedDomainTest.php`, `tests/Feature/Notifications/BrandedNotificationPayloadTest.php`, `tests/Unit/DomainRuleTest.php`, `tests/Unit/PlatformDomainClassifierTest.php`
- Playwright: `npm run test:e2e:branded` (Domain tab hidden without module)
