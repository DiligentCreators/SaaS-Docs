# Tenant provisioning workflow

## Happy path (admin creates tenant)

1. Admin submits tenant create (company/workspace name, slug, email, phone, logo/address/notes, localization, optional `owner_id`).
2. API resolves default plan (`system_settings.default_plan_id` → `plans.is_default`).
3. Tenant row inserted with `status=active`.
4. Domain created from slug (Stancl).
5. `tenant_subscriptions` row created:
   - If `trial_enabled`: `status=trial`, `trial_starts_at=now`, `trial_ends_at=now + plan.trial_days`
   - Else: `status=active`, trial columns null
6. `tenants.trial_ends_at` mirrored when trial applies.
7. Response returns tenant + current subscription placeholder.

## Invariants

- Trial days always from plan configuration.
- Existing subscriptions are never rewritten when the default plan changes.
- No Stripe/payment provider calls happen during tenant creation — `tenants.stripe_id` is only populated later, if and when the tenant is billed through Cashier (see [billing/stripe-cashier.md](../billing/stripe-cashier.md)).
