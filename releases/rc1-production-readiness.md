# Release Candidate RC1 — Production Readiness

| Field | Value |
|-------|--------|
| **Recommended tag** | `v1.2.0-rc.1` |
| **Release date** | 2026-07-14 |
| **Status** | Release Candidate |
| **Base** | v1.1.0-platform + CRM Sprint 2 |
| **Scope** | Hardening only — no new business modules |

---

## Summary

RC1 closes Critical and High severity production blockers discovered during the production readiness audit across Backend, Frontend, and ops docs. The platform remains under the architecture freeze; this release is security, resilience, and operator readiness.

---

## Release Notes

### Security

- Suspended users: Sanctum tokens revoked on suspend; `not.suspended` middleware rejects remaining sessions
- Workspace self-registration defaults to **off**
- Branding uploads reject SVG (stored XSS); privileged user fields stay non-fillable
- CORS origins pinned via `FRONTEND_URL` / `CORS_ALLOWED_ORIGINS`
- Impersonation targets workspace **owner** (`superadmin`) only
- Password-reset emails include `workspace` query param for tenant SPA routing
- SPA: Safe post-login redirects; email-verify `redirect` allowlisted to API origin
- SPA: React Query cache cleared on login, impersonation, logout, and 401 handling
- Payment API / webhook logs redact raw gateway bodies
- Protected role assignment: cannot assign `superadmin` via tenant user APIs

### Billing & webhooks

- Webhook logs store safe summaries only (never full Stripe payloads)
- Unique `(payment_gateway_id, provider_event_id)` prevents double processing
- Cashier `/stripe/webhook` and `/webhooks/gateways/stripe` share the same idempotency store
- Stripe driver requires signature unless `preVerified: true` (Cashier path only)

### Ops & observability

- Health `/up` checks DB; also Redis when cache/queue drivers use Redis
- Queued notifications; scheduler uses `withoutOverlapping`
- Production runbook updated

### Frontend UX / a11y

- Lead / Task detail sheets sync to `?lead=` / `?task=` (Back closes the drawer)
- Billing pages surface `ErrorState` on query failure
- Skip-to-content link; Kanban keyboard sensor
- Remember-me defaults off
- Email verified gate treats missing `email_verified_at` as unverified

### Performance

- Kanban board APIs cap cards per column (`per_column`, default 50, max 100) while returning accurate counts

---

## Upgrade Notes

1. Pull RC1; run `composer install --no-dev` / `npm ci && npm run build` as applicable.
2. Set production env (see Production Checklist). Especially:
   - `APP_DEBUG=false`
   - `CACHE_STORE=redis` (**required** for Stancl tenant cache tags)
   - `QUEUE_CONNECTION=redis` (recommended)
   - `STRIPE_WEBHOOK_SECRET` non-empty when Stripe is live
   - Pin `FRONTEND_URL` / `CORS_ALLOWED_ORIGINS`
3. Run migrations:
   ```bash
   php artisan migrate --force
   ```
   Includes `webhook_logs` unique index (duplicates are pruned to the earliest row).
4. Warm caches: `config:cache`, `route:cache`, `event:cache`, `view:cache`
5. Restart queue workers: `php artisan queue:restart`
6. If using open registration, explicitly set `registration_enabled` to true in Central system settings (seeded default is now **false**).
7. Point Stripe to **one** primary business webhook preferred: `/webhooks/gateways/stripe`. Keep `/stripe/webhook` for Cashier subscription mirroring if needed — both are idempotent for BillingEngine side effects.

---

## Production Checklist

- [ ] `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY` backed up
- [ ] TLS terminated; `SESSION_SECURE_COOKIE=true`
- [ ] `CACHE_STORE=redis` + Redis reachable
- [ ] Queue worker running; scheduler every minute
- [ ] `STRIPE_WEBHOOK_SECRET` set; gateway sandbox/live mode correct
- [ ] CORS / `FRONTEND_URL` exact SPA origins
- [ ] `registration_enabled` intentional
- [ ] Storage disk writable; logos/branding backups
- [ ] Log rotation configured; Nightwatch/Telescope policy decided
- [ ] Database + Redis backups scheduled
- [ ] `GET /up` returns 200
- [ ] Smoke: central login, tenant login, lead create, task create, test webhook, forgot-password queued

---

## Deployment Checklist

```bash
php artisan down --retry=60   # optional
git checkout v1.2.0-rc.1      # or deploy artifact
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache
php artisan queue:restart
php artisan up
```

Frontend: build SPA and publish static assets behind HTTPS.

---

## Rollback Checklist

1. Redeploy previous release artifact / prior tag
2. Rollback migrations **only** if safe for this release (`webhook_logs` unique index is reversible; data loss risk is low)
3. `php artisan queue:restart`
4. Verify `/up`, login, and Stripe webhook reachability
5. If registration was relied upon while default was on, re-enable via Central settings after rollback if needed

---

## Known Issues / Limitations

| Item | Severity | Notes |
|------|----------|-------|
| Assignee pickers load first 100 users | Medium | Searchable async select deferred; use list filters for large orgs |
| Bearer tokens in web storage | Medium | SPA/Sanctum Bearer design; XSS surface locked down; remember defaults off |
| Spatie `teams` false | Low | Roles scoped by `tenant_id` column; avoid `Role::findByName` without tenant |
| Dual Stripe ingress | Info | Shared idempotency; prefer documenting one ops webhook URL |
| Calendar widget | Info | Deferred until Calendar module |

---

## Verification (RC1)

| Suite | Result |
|-------|--------|
| New/updated Pest (suspend, webhook idempotency, impersonation owner, related auth/settings) | Passed in hardening runs |
| Full Pest / Playwright | Re-run before GA tag |

Recommended GA tag after soak: `v1.2.0` once full suite + soak smoke are green.

---

## Related docs

- [architecture/platform-production-runbook.md](../architecture/platform-production-runbook.md)
- [billing/payment-gateways-production.md](../billing/payment-gateways-production.md)
- [authentication/authentication-production.md](../authentication/authentication-production.md)
