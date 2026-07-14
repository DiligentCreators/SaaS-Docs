# Platform Architecture Freeze

The platform foundation is **locked**. From this point forward, do not redesign core subsystems unless the change addresses a **critical security issue**, **data integrity issue**, or **production bug**.

Business capability ships as **modules** on top of this foundation. The first reference module is **Leads**; every later module (Tasks, Invoices, Inventory, etc.) must mirror that structure.

## Locked subsystems

Do **not** redesign:

| Area | Includes |
|------|----------|
| Authentication | Central + Tenant auth, shared tenant login, email verification, password reset, sessions, remember me, lockout |
| Tenancy | Workspace resolution, isolation, middleware, domain resolver, white-label readiness |
| Authorization | Modules = licensing; Roles/Permissions = RBAC (Spatie); `module:` + `can:` middleware. No Features, Plans, or Limits |
| Billing | Marketplace, module subscriptions, consolidated billing, invoices/payments foundation, gateway abstraction, Stripe driver |
| Configuration | Central defaults → Tenant overrides → System defaults (branding, SMTP, locale, currency, timezone) |
| Security | Audit logs, impersonation, session/workspace isolation, payment security |

## Allowed changes

- **Extend** existing implementations (new catalog rows, permissions, routes, services, UI pages).
- Fix critical defects, security holes, or data-integrity bugs.
- Add domain events, listeners, and notifications **inside a module** following the [Module Development Standard](../modules/module-development.md).

## Forbidden without explicit approval

- Introducing a Laravel Modules package or plugin auto-discovery layer
- Repositories abstraction for domain code
- Reintroducing Features / Plans / usage limits
- Divergent Central vs Tenant shell redesigns
- Parallel billing, auth, or settings systems inside a module

## Related

- [Product Roadmap](../product-roadmap.md)
- [Module Development Standard](../modules/module-development.md)
- [Entitlements](entitlements.md)
- [Shared UI](shared-ui.md)
