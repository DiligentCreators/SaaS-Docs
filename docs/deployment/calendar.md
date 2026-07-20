# Calendar — Deployment

## Migrate

```bash
php artisan migrate
```

Migrations:

1. `create_calendar_module_tables` — calendars, members, categories, overlays, user settings
2. `register_calendar_module` — catalog + install for workspaces missing the module
3. `add_calendar_permissions` — grants missing default-role permissions

Do **not** run `db:seed` in production for catalog registration; the data migration is the production path.

## Permissions

Ensure tenant roles receive `calendar.*` as needed (owner/superadmin gets all via provisioning; admin/manager/staff maps are in `config/tenant-default-role-permissions.php`).

## Frontend

Deploy frontend build that includes `/calendar` route, nav item, and `calendarService`.

## Notes

- Uninstalling Calendar stops UI/routes; `schedule_items` are retained (ADR-001).
- External calendar sync uses tenant **Provider Credentials** on primaries (`google`, `microsoft`) and runtime tokens on Connections Center ([ADR-007](/architecture/adr/adr-007-tenant-owned-integration-credentials)). Until cutover, platform env client id/secret remain the deprecated runtime source.
- Meetings / booking are **not** part of Phase 2 Calendar module delivery.
