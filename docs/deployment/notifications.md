# Notification System — Production Deployment

This runbook deploys the frozen Laravel Notifications → Reverb → Echo → React flow, plus standards-based Web Push for closed/background browsers. The payload and module contracts are defined in the [Notification Architecture Contract](/developer-guide/notification-architecture-contract).

## Runtime flow

1. A tenant service dispatches a domain event.
2. The listener sends a queued Laravel notification.
3. The `database` channel persists the UUID notification row.
4. The `broadcast` channel publishes `NotificationCreated` to the user's private tenant channel.
5. Echo updates the TanStack Query caches for the list and unread count.
6. When the tab is hidden and browser permission is already granted, the Browser Notification Manager projects the live event to an OS notification.
7. The `webpush` channel sends a platform payload to each stored browser subscription (after the DB row exists). Expired endpoints are removed automatically.
8. If Echo is unavailable, the SPA polls the unread count. Initial fetches and reconnect backfills never create OS notifications.

Bulk assignment and import use `NotificationBatch`. Per-lead delivery is suppressed while the batch is active, then the orchestrator sends one digest (or one single notification when the count is one) per assignee. Stable `dedupe_key` values and Redis-backed reservations protect retries.

## Required backend environment

Use deployment-specific values. Never commit production secrets.

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.example.com
FRONTEND_URL=https://app.example.com
CORS_ALLOWED_ORIGINS=https://app.example.com

CACHE_STORE=redis
CACHE_PREFIX=saleos_production_
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=null
REDIS_PASSWORD=<secret>
REDIS_DB=0

BROADCAST_CONNECTION=reverb
REVERB_APP_ID=<environment-specific-id>
REVERB_APP_KEY=<public-application-key>
REVERB_APP_SECRET=<secret>
REVERB_HOST=ws.example.com
REVERB_PORT=443
REVERB_SCHEME=https
REVERB_SERVER_HOST=127.0.0.1
REVERB_SERVER_PORT=8080
REVERB_ALLOWED_ORIGINS=https://app.example.com
REVERB_APP_ACCEPT_CLIENT_EVENTS_FROM=none

# Web Push (VAPID) — generate once and reuse across deploys:
# php -r "print_r(Minishlink\WebPush\VAPID::createVapidKeys());"
VAPID_SUBJECT=mailto:ops@example.com
VAPID_PUBLIC_KEY=<public-key>
VAPID_PRIVATE_KEY=<private-key>
```

`REVERB_HOST` is the public hostname used by the broadcaster and browser. `REVERB_SERVER_HOST` / `REVERB_SERVER_PORT` are the internal listener address behind Nginx or Forge. Use a unique app ID, key, secret, and `CACHE_PREFIX` for every environment.

VAPID keys must stay stable; rotating them invalidates existing browser subscriptions. The SPA fetches the public key from `GET /api/tenant/v1/push-subscriptions/vapid-public-key` (optional `VITE_VAPID_PUBLIC_KEY` fallback only).

Redis is required in production for queue durability, worker restart signals, notification dedupe reservations, and Reverb horizontal scaling. If Reverb runs on multiple hosts, also set:

```dotenv
REVERB_SCALING_ENABLED=true
```

All Reverb nodes must use the same Redis service and app credentials.

## Required frontend runtime environment

The SPA needs the public Reverb endpoint:

```dotenv
VITE_REVERB_APP_KEY=<same-as-REVERB_APP_KEY>
VITE_REVERB_HOST=ws.example.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

On Laravel Forge, place these values in the site environment used to generate `/config.js` / `window.env`. Do not bake production API URLs or secrets into CI artifacts. The Reverb app key is public; the app secret must never be exposed to the SPA.

## Required processes

### Queue worker

Notification jobs use the `emails` queue, including database and broadcast channels:

```bash
php artisan queue:work redis \
  --queue=emails,default \
  --sleep=1 \
  --tries=3 \
  --timeout=60 \
  --max-time=3600
```

Use a process monitor. Example Supervisor program:

```ini
[program:saleos-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /home/forge/api.example.com/artisan queue:work redis --queue=emails,default --sleep=1 --tries=3 --timeout=60 --max-time=3600
directory=/home/forge/api.example.com
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=forge
numprocs=2
redirect_stderr=true
stdout_logfile=/home/forge/api.example.com/storage/logs/queue-worker.log
stopwaitsecs=90
```

The queue connection `retry_after` must remain greater than the worker timeout.

### Reverb

Run one long-lived Reverb process behind a TLS reverse proxy:

```bash
php artisan reverb:start --host=127.0.0.1 --port=8080
```

Example Supervisor program:

```ini
[program:saleos-reverb]
command=php /home/forge/api.example.com/artisan reverb:start --host=127.0.0.1 --port=8080
directory=/home/forge/api.example.com
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/home/forge/api.example.com/storage/logs/reverb.log
stopwaitsecs=30
```

Set Supervisor's global `minfds=10000` for production Reverb. Forge's Reverb integration may manage the process and Nginx WebSocket proxy automatically; confirm both `/app` and `/apps` are proxied and HTTP upgrade headers are preserved.

### Scheduler

Run the scheduler every minute:

```text
* * * * * cd /home/forge/api.example.com && php artisan schedule:run >> /dev/null 2>&1
```

It runs due notifications and the weekly `notifications:prune --days=90` retention command. Unread notifications are never pruned.

## Health and monitoring

- `GET /up` must return `200` and verify DB/Redis dependencies.
- Monitor the queue age, queue size, and `failed_jobs`.
- Monitor the Reverb process and public `wss://` handshake.
- Alert on repeated `NotificationFailed`, broadcast authorization failures, or worker restarts.
- Log retention must cover `notifications.created`, `notifications.broadcast`, `notifications.aggregated`, and `notifications.pruned`.
- A queue worker can fail independently while HTTP remains healthy; process-manager state and queue age are required health signals.

## Zero-downtime deployment

```bash
git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize
php artisan queue:restart
php artisan reverb:restart
```

Then deploy the SPA artifact and update `/config.js`. `queue:restart` and `reverb:restart` are graceful; Supervisor must be running so processes return automatically. Deploy backward-compatible database and payload changes before code that requires them. The frozen schema currently uses additive payload changes only.

For multiple Reverb nodes, restart one node at a time behind the load balancer. Existing clients reconnect automatically; the REST unread count recovers any event missed during reconnect without replaying browser notifications.

## Production launch checklist

- [ ] Production `.env` contains the backend variables above; no local hosts or placeholder credentials remain.
- [ ] SPA runtime config contains the matching public `VITE_REVERB_*` values.
- [ ] `php artisan migrate --force` applied the unread/list notification indexes.
- [ ] Redis is reachable and persistence/eviction policy is appropriate for queues.
- [ ] `CACHE_PREFIX` is unique to the environment.
- [ ] Queue worker is supervised and consumes `emails,default`.
- [ ] Reverb is supervised, uses TLS at the edge, and permits only the SPA origin.
- [ ] Client events remain disabled (`REVERB_APP_ACCEPT_CLIENT_EVENTS_FROM=none`).
- [ ] Scheduler runs every minute.
- [ ] `/broadcasting/auth` permits the SPA CORS origin and rejects unauthenticated/cross-tenant requests.
- [ ] Public WebSocket handshake and private subscription succeed.
- [ ] Single lead assignment persists one notification and updates the bell without refresh.
- [ ] Clicking a notification marks it read and opens the correct resource.
- [ ] Browser permission is granted manually or through approved product UX; a hidden tab shows exactly one OS notification.
- [ ] Bulk assignment produces one digest per assignee and no per-lead flood.
- [ ] Unread counter remains correct after logout/login and Reverb reconnect.
- [ ] Failed-job and queue-age alerts are active.

## Troubleshooting

### Bell does not update

1. Confirm the notification row exists and is unread.
2. Check that the `emails` worker is running and has no failed `SendQueuedNotifications` jobs.
3. Verify the browser subscribed to `private-tenant.{tenantId}.user.{userId}`.
4. Inspect `POST /broadcasting/auth`; `401/403` indicates token, tenant header, or channel mismatch.
5. Confirm the fallback unread-count request succeeds.

### WebSocket disconnected or reconnecting

- Verify `VITE_REVERB_HOST`, port, and scheme describe the public endpoint.
- Verify Nginx forwards WebSocket upgrade headers and proxies both `/app` and `/apps`.
- Confirm Reverb is supervised and the public TLS certificate is valid.
- Check firewall rules and Reverb logs.
- Repeated reconnects commonly indicate an HTTP/HTTPS or host mismatch.

### Queue not processing

- Run `php artisan queue:monitor redis:emails --max=100` or inspect queue size/age.
- Confirm the worker uses the same `QUEUE_CONNECTION` and Redis database as the web process.
- Inspect `php artisan queue:failed`.
- Restart gracefully with `php artisan queue:restart`; do not kill an active job unless necessary.

### Redis unavailable

- Treat Redis loss as an incident: queues, dedupe reservations, restart signals, and scaled Reverb depend on it.
- Verify host, credentials, TLS/network policy, memory, and eviction configuration.
- Restore Redis before retrying failed notification jobs.

### Duplicate notifications

- Compare `data.dedupe_key`, notification UUIDs, and producer batch IDs.
- Confirm every application node shares the same Redis cache and `CACHE_PREFIX`.
- Verify the same domain operation was not dispatched twice with different batch IDs.
- Do not manually retry a producer while its original queue job is still reserved.

### CORS or `/broadcasting/auth` failures

- `config/cors.php` must include `broadcasting/auth`.
- `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, and `REVERB_ALLOWED_ORIGINS` must exactly match the SPA origin, including scheme and port.
- A `401` means the bearer token is absent/expired; a `403` means private-channel authorization rejected the user or tenant.

### Browser notification not appearing

- Browser notifications require a secure context (`https`) and user-granted permission.
- The OS notification is intentionally shown only for a live Echo event while the tab is hidden.
- Initial inbox fetches, reconnect backfills, visible tabs, denied permission, and duplicate UUIDs do not show OS notifications.
- Check browser/OS focus-assist and site notification settings.

### Permission denied or blocked

- The application handles denial without failing in-app notifications.
- The user must restore permission in browser site settings; browsers generally do not allow an application to reset a blocked permission.
- The notification bell and unread inbox continue to work without OS notification permission.
