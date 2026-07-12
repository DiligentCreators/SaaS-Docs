# Central Playwright E2E

The Playwright suite for the **Central Application** lives in the Frontend repository:

- Guide: [`SaaS-Frontend/docs/testing/PLAYWRIGHT.md`](../../SaaS-Frontend/docs/testing/PLAYWRIGHT.md)
- Tests: `SaaS-Frontend/e2e/tests/<module>/`
- Shared POM / fixtures: `SaaS-Frontend/e2e/{pages,fixtures,helpers,utils,test-data}/`
- Config: `SaaS-Frontend/playwright.config.ts`

## Scope

Covers Platform/Core only: auth, dashboard, tenants (workspaces), users, roles, permissions matrix, modules, features, marketplace, billing (settings + tenant invoice/payment tabs), impersonation, settings, profile, smoke, and regression.

Does **not** cover Tenant Application product UIs (Leads/Tasks screens), Payments Checkout, or future ERP modules. Suites remain Central-only.

## Spec directories (independently runnable)

| Suite | Path | npm script |
|-------|------|------------|
| Auth | `e2e/tests/auth/` | `npm run test:e2e:auth` |
| Dashboard | `e2e/tests/dashboard/` | `npm run test:e2e:dashboard` |
| Tenants / workspaces | `e2e/tests/tenants/` | `npm run test:e2e:tenants` |
| Users | `e2e/tests/users/` | `npm run test:e2e:users` |
| Roles | `e2e/tests/roles/` | `npm run test:e2e:roles` |
| Permissions | `e2e/tests/permissions/` | `npm run test:e2e:permissions` |
| Modules | `e2e/tests/modules/` | `npm run test:e2e:modules` |
| Features | `e2e/tests/features/` | `npm run test:e2e:features` |
| Marketplace | `e2e/tests/marketplace/` | `npm run test:e2e:marketplace` |
| Billing | `e2e/tests/billing/` | `npm run test:e2e:billing` |
| Impersonation | `e2e/tests/impersonation/` | `npm run test:e2e:impersonation` |
| Settings | `e2e/tests/settings/` | `npm run test:e2e:settings` |
| Profile | `e2e/tests/profile/` | `npm run test:e2e:profile` |
| Smoke | `e2e/tests/smoke/` | `npm run test:e2e:smoke` |
| Regression | `e2e/tests/regression/` | `npm run test:e2e:regression` |

Setup project (`auth.setup.ts`) authenticates once for chromium suites. Auth project uses empty storage and does not revoke other sessions (logout revokes only the current Sanctum token).

## QA status (Central stabilization)

- Full suite: **48 passed**, 0 skipped, 0 failed (local Chromium run).
- Each module directory is executable independently via `npx playwright test e2e/tests/<module>` or the npm scripts above.
- After module-level green runs, re-run `npm run test:e2e` before declaring Central stable.

## Screenshots

Success and failure screenshots are generated under:

```text
SaaS-Frontend/docs/testing/images/
```

These image files are **documentation artifacts only** and must not be committed to Backend, Frontend, or Docs repositories.

## Quick start

```bash
cd SaaS-Frontend
cp .env.e2e.example .env.e2e
npm install
npx playwright install chromium
npm run test:e2e
npm run test:e2e:report
```

See the Frontend guide for environment variables, CI usage, debugging, and extension patterns.
