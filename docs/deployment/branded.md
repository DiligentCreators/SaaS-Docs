# Branded — Deployment

## Migrate

```bash
php artisan migrate
```

Registers the billable `branded` catalog module (not auto-installed), syncs `branded.*` permissions, and adds domain verification columns.

## Environment (required for production)

```dotenv
# Comma-separated platform subdomain suffixes (Central-managed hosts)
PLATFORM_DOMAIN_SUFFIXES=saleos.com

# REQUIRED: public IPs tenants must point A/AAAA records at
BRANDED_SERVER_IPV4=203.0.113.10
# BRANDED_SERVER_IPV6=

# Optional CNAME target for subdomain custom hosts
# BRANDED_CNAME_TARGET=workspaces.saleos.com

# TXT ownership prefix (default _saleos-verification)
# BRANDED_TXT_PREFIX=_saleos-verification

# Hours before an unverified claim expires (default 72)
# BRANDED_DOMAIN_CLAIM_TTL_HOURS=72
```

Verification **fails closed** when `BRANDED_SERVER_IPV4`, `BRANDED_SERVER_IPV6`, and `BRANDED_CNAME_TARGET` are all empty. Do not leave pointing targets blank in production.

## Scheduler

Ensure the scheduler is running. Hourly job:

```bash
php artisan branded:expire-stale-domain-claims
```

Purges unverified custom-domain claims past the claim TTL so hostnames can be reclaimed.

## SSL / proxy / SPA

The application verifies DNS ownership and binds hosts. **TLS certificates for custom hostnames** are terminated at your proxy / Laravel Cloud / Forge — configure wildcard or per-host certs there. The app does not issue Let’s Encrypt certificates.

Recommended topology:

1. Proxy terminates TLS for each verified custom host (or a wildcard covering them).
2. Proxy routes HTTP(S) for those hosts to the same frontend + API stack as the primary SPA.
3. Prefer **same-origin** serving (custom host serves the SPA and proxies `/api` to the backend) so CORS is unnecessary for that host.
4. If the SPA on a custom host calls the API cross-origin, the API allows CORS only for **verified + entitled** branded custom Origins (`BrandedCustomDomainCors`). Static `FRONTEND_URL` / `CORS_ALLOWED_ORIGINS` still apply for the primary app.

Also allow custom hosts on Reverb / WebSocket if realtime is used from those Origins.

## Checklist

- [ ] Migrations applied; `branded` appears in Central catalog as billable / not default-included
- [ ] `PLATFORM_DOMAIN_SUFFIXES` matches production platform hosts
- [ ] `BRANDED_SERVER_IPV4` (and/or CNAME target) set to the **real edge IP** (not a laptop/dev IP by mistake)
- [ ] Scheduler runs `branded:expire-stale-domain-claims`
- [ ] Proxy accepts traffic for verified custom hosts and routes to the same app (TLS + SPA path decided)
- [ ] Smoke: purchase Branded → Settings → Domain → propose → DNS → verify → host resolves; remove → re-propose works; cancel module → host unbinds
