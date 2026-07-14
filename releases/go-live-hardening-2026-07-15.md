# Go-Live Hardening — 2026-07-15

| Field | Value |
|-------|--------|
| **Status** | Pre-production hardening pass |
| **Scope** | Central + Tenant + Billing (Stripe/Creem) + Leads + Tasks |
| **Recommended** | Tag after smoke on staging, then ship |

## What this pass fixed

See `CHANGELOG.md` section **Go-live hardening (2026-07-15)**.

Highlights:

1. Gateway cancel on module cancel (charge-continuation fix)
2. Failed webhook retry reclaim
3. Renewal invoice ledger for recurring provider charges
4. Tenant-bound email verification
5. Production boot guards (`APP_DEBUG`, HTTPS, secure headers, trusted proxies)
6. Staff UX: no spurious users.list 403 on Leads/Tasks
7. CSV formula injection escape

## Remaining risks (accepted for v1 or follow-up)

| Risk | Severity | Notes |
|------|----------|-------|
| In-app plan upgrade/downgrade (monthly↔yearly swap) | Medium | Cancel + repurchase only; document as unsupported for now |
| Staff role is view-mostly for Leads | Low | Product choice; `tasks.complete` only on Tasks |
| Bearer tokens in web storage | Medium | SPA design; already tracked in RC1 |
| No frontend CI / crash telemetry | Medium | Follow-up: GitHub Actions + Sentry |
| Dual Stripe webhook ingress | Info | Shared idempotency; prefer `/webhooks/gateways/stripe` |

## Verification

```bash
cd SaaS-Backend && php artisan test --compact
# Expected: 323 passed
```

Staging smoke: Central login → create tenant → Stripe/Creem test checkout → cancel module (confirm provider subscription cancelled) → Leads/Tasks as admin + staff.
