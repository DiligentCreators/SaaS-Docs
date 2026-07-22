# Meetings — Deployment

## Migrate-only

```bash
php artisan migrate
```

Creates meetings tables, registers the `meetings` catalog module (default-included CRM), grants missing default-role permissions, and records the required **Meetings → Calendar** module dependency.

Do **not** rely on `db:seed` in production for catalog/RBAC.

## Upgrade from legacy Meetings schema

If production still has a **pre-redesign** `meetings` table (for example UUID PK / `organizer_user_id` / `meeting_participants` and **no** `host_id`), the create migration replaces **Meetings-related tables only**:

1. Drops current and legacy Meetings tables (`meetings`, `meeting_attendees`, `meeting_provider_connections`, `meeting_reminders`, plus leftovers such as `meeting_participants`, `meeting_notes`, `meeting_attachments`, `meeting_activities`, `meeting_user_settings`).
2. Deletes orphan `calendar_events` rows with `source_type = meeting`.
3. Creates the current Meetings schema.

Leads, users, tenants, billing, and other modules are **not** dropped. After this one-time upgrade, the Meetings list is empty — recreate meetings in the UI. If the current schema (`host_id` present) is already there, the create migration is a no-op.

## Environment

Meeting provider **client ID / client secret / webhook secret are per workspace** (encrypted on `meeting_provider_connections`). They are entered in Meetings → Integrations — not set in platform `.env`.

| Variable | Purpose |
|----------|---------|
| `APP_URL` | Builds the fixed OAuth callback: `/api/oauth/meetings/{provider}/callback` (must be `http://localhost…` or HTTPS for Google) |
| `FRONTEND_URL` | SPA return URL after OAuth (`/#/meetings?integrations=…`) |
| `MEETINGS_PROVIDERS_FAKE` | Optional local/CI only; **ignored / forced off in production** |

Each tenant registers that platform callback URL on **their** Google/Zoom OAuth app, then connects the workspace account.

## Scheduler / queues

- `crm:send-due-notifications` every 5 minutes must run (`onOneServer`) — delivers meeting reminders (database + web push + mail).
- Queue workers must process `default` / `emails` (and any dedicated notification queues) for invite mail and `RetryProviderSyncJob`.
- Web Push requires VAPID keys (`config/webpush.php`) for browser push delivery.
- Meeting provider webhooks are **not production-complete** (ack stub only); do not configure Zoom/Google marketplace webhooks against SaleOS yet.

## Smoke

1. Confirm marketplace module `meetings` exists and is installed; Calendar is also installed.
2. Owner: `GET /api/tenant/v1/meetings` → 200.
3. Create meeting with `provider=none` → Calendar event with `source=meeting` for host.
4. Save workspace Zoom/Google **Client ID + secret** in Meetings → Integrations, register the shown callback URL on that OAuth app, connect the account → schedule with that provider → `join_url` present.
5. Set `reminder_offset_minutes` in the past for a test meeting → run `php artisan crm:send-due-notifications` → reminder notification delivered once.
6. Staff without `view_all` cannot list unrelated meetings.
7. Frontend: `npm run test:e2e:meetings` against a migrated API.

## Rollback note

Catalog/permission/dependency data migrations are intentionally irreversible; use a forward migration to retire the module if required.
