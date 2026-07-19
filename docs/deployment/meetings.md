# Meetings — Deployment

```bash
php artisan migrate
```

Migrations register the `meetings` catalog module, permissions, meeting tables, and `api_idempotency_keys`.

Production uses data migrations — do not rely on `db:seed`.

Deploy frontend with `/meetings` route and nav. Calendar continues to read ScheduleItems only; no Calendar FK from Meetings.
