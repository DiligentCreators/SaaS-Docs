# Local Demo Data (Development Only)

Populate a dedicated demo workspace with realistic CRM data for local development, manual QA, UI validation, and dashboard demonstrations.

**Never run this in production.** The Artisan command aborts immediately when `APP_ENV=production`.

## Prerequisites

1. Migrate and seed the central platform:

```bash
php artisan migrate
php artisan db:seed --class=Database\\Seeders\\Central\\CentralDatabaseSeeder
```

2. Ensure `APP_ENV=local` in `.env`.

## Quick start

```bash
php artisan local:seed-demo
```

This will:

1. Create the **Demo CRM Workspace** tenant (if it does not exist)
2. Seed demo users, leads, tasks, notes, follow-ups, activities, and notifications
3. Print login credentials and record counts

### Demo workspace credentials

| Field | Value |
|-------|-------|
| Domain | `demo-crm.localhost` |
| Owner email | `owner@demo-crm.local` |
| Password | `password` |

Additional demo users use `{slug}@demo-crm.local` with the same password.

Configure these values in [`config/local-demo.php`](https://github.com/DiligentCreators/SaaS-Backend/blob/main/config/local-demo.php).

## Dataset sizes

Use `--size` to control volume:

| Size | Users | Leads | Tasks |
|------|-------|-------|-------|
| `small` | 8 | 50 | 25 |
| `medium` (default) | 25 | 500 | 300 |
| `large` | 30 | 2,000 | 1,000 |

```bash
php artisan local:seed-demo --size=small
php artisan local:seed-demo --size=large
```

## Reset demo data

Use `--fresh` to wipe CRM demo data for the target workspace before re-seeding. You will be prompted to confirm.

```bash
php artisan local:seed-demo --fresh
php artisan local:seed-demo --size=medium --fresh
```

The reset removes:

- Demo users (`*@demo-crm.local`, except the owner)
- All leads, tasks, and related notes, follow-ups, activities, and assignment history
- Demo notifications

It does **not** delete the workspace, billing records, or central platform data.

## Seed an existing workspace

To seed a different tenant instead of the default demo workspace:

```bash
php artisan local:seed-demo --tenant=your-workspace-slug
```

## Staging (explicit opt-in only)

Demo seeders refuse to run outside the `local` environment unless you pass:

```bash
php artisan local:seed-demo --force-local-demo
```

Production always aborts, even with `--force-local-demo`.

## What gets seeded

### Users

- Keeps the workspace owner (`superadmin`)
- Adds 7–29 demo users with realistic names and job titles
- Assigns existing RBAC roles: `manager`, `admin`, `staff`
- Varies suspension status and account age

### Leads

- Weighted pipeline distribution (New → Won/Lost)
- Realistic lead values ($100 – $150k+)
- Notes, follow-ups (today, overdue, completed), activity timelines, assignment history

### Tasks

- Mixed statuses, priorities, and due dates (overdue, today, next week, future)
- Comments (task notes) and activity timelines

### Dashboard widgets

Seeded data supports:

- Pipeline overview and revenue sparkline
- Lead sources
- Today's / overdue follow-ups
- Upcoming / overdue tasks
- Activity feed and notifications

## Architecture

| Component | Path |
|-----------|------|
| Artisan command | `app/Console/Commands/LocalSeedDemoCommand.php` |
| Config | `config/local-demo.php` |
| Master seeder | `database/seeders/Local/LocalDevelopmentSeeder.php` |
| Child seeders | `TenantUsersSeeder`, `LeadsSeeder`, `TasksSeeder`, `DemoNotificationsSeeder` |
| Services | `app/Services/Local/LocalDemoDataService.php` |

Demo seeders are **not** registered in `DatabaseSeeder` or `TenantDatabaseSeeder`.

## Tests

```bash
php artisan test --compact tests/Feature/Local/LocalSeedDemoCommandTest.php
```

## Playwright

Existing Playwright tests self-provision workspaces and do not depend on demo seeders. Use demo data for manual QA and local UI exploration only.
