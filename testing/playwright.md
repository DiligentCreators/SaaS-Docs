# Central Playwright E2E

The Playwright suite for the **Central Application** lives in the Frontend repository:

- Guide: [`SaaS-Frontend/docs/testing/PLAYWRIGHT.md`](../../SaaS-Frontend/docs/testing/PLAYWRIGHT.md)
- Tests: `SaaS-Frontend/e2e/`
- Config: `SaaS-Frontend/playwright.config.ts`

## Scope

Covers Platform/Core only: auth, dashboard, tenants, users, plans, modules, features, limits, settings, navigation, and form validation.

Does **not** cover Leads, Tasks, Contacts, Calendar, Pipelines, CRM, Reports, AI, Billing, or Payments.

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

These image files are **documentation artifacts only** and must not be committed to Backend, Frontend, or Docs repositories. Generate them locally or in CI.

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
