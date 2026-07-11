# Central Playwright E2E

The Playwright suite for the **Central Application** lives in the Frontend repository:

- Guide: [`SaaS-Frontend/docs/testing/PLAYWRIGHT.md`](../../SaaS-Frontend/docs/testing/PLAYWRIGHT.md)
- Tests: `SaaS-Frontend/e2e/`
- Config: `SaaS-Frontend/playwright.config.ts`

## Scope

Covers Platform/Core only: auth, dashboard, tenants (including details, archive/unarchive), users, roles (including clone and permissions matrix navigation), tenant subscriptions (full lifecycle), plans, modules, features, limits, settings, navigation, and form validation.

Does **not** cover Leads, Tasks, Contacts, Calendar, Pipelines, CRM, Reports, AI, or Payments/Checkout UI. The suite remains Central-only — no tenant-side/product specs exist.

## Spec files

| Spec | Covers |
|------|--------|
| `auth.setup.ts` | Admin login, saves storage state for other specs |
| `auth/login.spec.ts` | Unauthenticated login/forgot-password flows |
| `dashboard/dashboard.spec.ts` | Dashboard load, quick actions, sidebar, breadcrumbs |
| `tenants/tenants.spec.ts` | CRUD, validation, **navigating to tenant details, archive/unarchive** |
| `users/users.spec.ts` | CRUD, validation, pagination |
| `roles/roles.spec.ts` | Create role, assign permissions, **clone**, **permissions matrix navigation**, validation |
| `subscriptions/subscriptions.spec.ts` | Full lifecycle: create, edit status, view sheet, **suspend, resume, cancel**, delete |
| `plans/plans.spec.ts` | Plan CRUD |
| `modules/modules.spec.ts` | Module CRUD |
| `features/features.spec.ts` | Feature CRUD |
| `limits/limits.spec.ts` | Limit CRUD |
| `settings/settings.spec.ts` | Settings update |
| `smoke/central-smoke.spec.ts` | Page-load smoke test across main routes |
| `regression/central-regression.spec.ts` | Cross-page navigation, catalog workflow |

## Screenshots

Success and failure screenshots are generated under:

```text
SaaS-Frontend/docs/testing/images/
```

Examples referenced by the Frontend guide:

- `images/auth/login-success.png`
- `images/dashboard/dashboard-loaded.png`
- `images/tenants/tenant-created.png`
- `images/plans/plan-created.png`
- `images/modules/module-created.png`
- `images/settings/settings-updated.png`

These image files are **documentation artifacts only** and must not be committed to Backend, Frontend, or Docs repositories. Generate them locally or in CI. If a docs page in this repository ever needs an illustrative screenshot (e.g. the tenant details page or permissions matrix), place it under `SaaS-Docs/assets/` and reference it with a relative path — do not fabricate placeholder images; only add real captures.

## Quick start

```bash
cd SaaS-Frontend
cp .env.e2e.example .env.e2e
npm install
npx playwright install chromium
npm run test:e2e
npm run test:e2e:report
```

See the Frontend guide for environment variables, CI usage, debugging, and extension patterns for future modules.
