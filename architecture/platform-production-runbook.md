# Platform Production Deployment Runbook

This is the single ops checklist for launching the Diligent Creators SaaS platform (Central + Tenant applications) to paying customers.

Domain production guides still apply for auth, billing, RBAC, modules, Leads, and Tasks. This document covers **platform-wide** process requirements.

RC notes: [releases/rc1-production-readiness.md](../releases/rc1-production-readiness.md).

## Launch blockers (must be green)

| Check | Requirement |
|-------|-------------|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` (boot throws if true in production) |
| `APP_KEY` | Set and backed up |
| `FRONTEND_URL` / `CORS_ALLOWED_ORIGINS` | Pin SPA origins (no `*`) |
| `STRIPE_WEBHOOK_SECRET` / `CREEM_WEBHOOK_SECRET` | Non-empty for each **active** gateway |
| Cache | Prefer `CACHE_STORE=redis`. Isolation uses **explicit tenant-scoped keys** (`CacheTenancyBootstrapper` is intentionally off — do not rely on Redis tags alone) |
| Queue worker | Always running (`queue:work` or Laravel Cloud background process) |
| Scheduler | Cron/`schedule:run` every minute |
| HTTPS | TLS at edge; app trusts proxies (`TrustProxies`); production forces `https` URL scheme; `SESSION_SECURE_COOKIE=true` |
| Registration | `registration_enabled` intentional (defaults **false**) |
| Health | `GET /up` returns 200 (DB; Redis when cache/queue use Redis) |
| Object storage | `FILESYSTEM_DISK=s3` + `AWS_*` configured; migrate local assets with `php artisan storage:migrate-to-s3` ([object-storage.md](object-storage.md)) |

## Frontend SPA deploy

Production builds are automated on merge to `main`. See [frontend-build-artifacts.md](frontend-build-artifacts.md).

**Preferred:** deploy from the **`build-artifacts`** branch (or the GitHub Actions artifact `frontend-build`). Set repository variable `VITE_API_URL` (required), optional `VITE_APP_NAME` / `VITE_API_MODE`, in the SaaS-Frontend GitHub repo before relying on CI.

**Manual fallback:**

```bash
cd SaaS-Frontend
npm ci
# VITE_* must be set at build time (see .env.example)
npm run build
```

Publish `dist/` (or the `build-artifacts` tree) to your CDN/static host / web root.

Cache guidance:

- `index.html` — short TTL or `no-cache` (always revalidate)
- Hashed assets under `assets/` — long-lived immutable cache
- Use `build-info.json` on the artifact branch to confirm which `main` commit was built

Point `FRONTEND_URL` / `CORS_ALLOWED_ORIGINS` on the API at the SPA origin(s).

## Required background processes

1. **HTTP / PHP-FPM** (or Laravel Cloud web process)
2. **Queue worker** — notifications, mail, and future jobs implement `ShouldQueue`
   ```bash
   php artisan queue:work --sleep=1 --tries=3 --max-time=3600
   ```
3. **Scheduler** (every minute)
   ```bash
   * * * * * cd /path/to/SaaS-Backend && php artisan schedule:run >> /dev/null 2>&1
   ```

Scheduled commands (all use `withoutOverlapping`):

- `sanctum:prune-expired`
- `subscriptions:expire`
- `billing:run-consolidated`
- `crm:send-due-notifications`

## Deploy sequence

```bash
php artisan down --retry=60   # optional platform-wide maintenance
git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache
php artisan queue:restart
php artisan up
```

Notes:

- Tenant-only maintenance must use Tenant Settings (`maintenance_mode`), **not** `artisan down`.
- System settings are applied at runtime from the database; env/config cache alone does not replace DB-backed settings.

## Webhooks

| Endpoint | Purpose |
|----------|---------|
| `POST /stripe/webhook` | Cashier subscription mirror (+ BillingEngine when applicable) |
| `POST /webhooks/gateways/{code}` | Billing engine (all gateways) |

Both are CSRF-exempt and rate-limited (`throttle:webhooks`). Invalid Stripe/Creem signatures are rejected **before** full payload persistence. Both paths claim `webhook_logs` by `(payment_gateway_id, provider_event_id)` so the same provider event cannot double-settle.

**Failed processing:** if handling throws after the log row is created, status is `failed` and a **provider retry reprocesses** that event (reclaims the failed row). Successful/`ignored` events still return “already handled”.

Prefer configuring Stripe to deliver business events to `/webhooks/gateways/stripe` and keep Cashier URL for subscription sync as documented in your Stripe dashboard. Creem: `POST /webhooks/gateways/creem` with `creem-signature`.

## Module cancel

Cancelling a purchased module subscription calls the payment gateway (`cancelSubscription`) **before** marking the local row cancelled and clearing entitlements. If the provider call fails, the local subscription stays active and the API returns a validation error so billing does not silently continue while access is revoked.

## Post-deploy smoke

1. Central login + dashboard
2. Tenant login + dashboard
3. Create lead / task (module gates)
4. Stripe test webhook (or gateway health)
5. Forgot-password email leaves the queue
6. Suspend a test user → token immediately unusable
7. `GET /up` healthy
8. Failed jobs empty: `php artisan queue:failed`

## Rollback

1. Redeploy previous release artifact / image
2. `php artisan migrate:rollback` only when the release’s migrations are known-safe to reverse
3. `php artisan queue:restart`
4. Verify `/up`, login, and billing webhook reachability

## Disaster recovery (minimum)

| Asset | RPO guidance | Restore |
|-------|--------------|---------|
| MySQL (central + tenant DBs) | Point-in-time or daily dump | Restore dump; verify tenancy domains |
| Redis | Ephemeral OK | Clear + warm; workers will refill |
| Object storage (branding) | Daily | Sync from backup bucket; see [object-storage.md](object-storage.md) |
| `APP_KEY` | Offline secure store | Required to decrypt encrypted attributes |

## Related docs

- `architecture/platform-freeze.md`
- `authentication/authentication-production.md`
- `billing/payment-gateways-production.md`
- `authorization/tenant-rbac-production.md`
- `modules/leads-production.md`
- `modules/tasks-production.md`
- `releases/rc1-production-readiness.md`
