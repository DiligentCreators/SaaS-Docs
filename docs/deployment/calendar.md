# Calendar — Deployment

## Migrate-only

```bash
php artisan migrate
```

Creates `calendar_events`, registers the `calendar` catalog module (default-included CRM), and grants missing default-role permissions (`calendar.view|create|update|delete|view_all`).

Do **not** rely on `db:seed` in production for catalog/RBAC.

## Smoke

1. Confirm marketplace module `calendar` exists and is installed on a test workspace.
2. Owner: `GET /api/tenant/v1/calendar/events` → 200.
3. Create event → appears on Week (default), Day, Month, and Agenda.
4. On Week/Day, drag an event to a new slot → persists after refresh (`PUT` succeeds; toast “Event rescheduled”).
5. Staff without `view_all` cannot list another user’s events.
6. Dashboard includes `calendar` upcoming widget when entitled.

## Rollback note

Catalog/permission data migrations are intentionally irreversible; use a forward migration to retire the module if required.
