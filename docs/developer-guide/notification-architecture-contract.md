# Notification Architecture Contract

**Status:** Frozen (shipped)
**Schema version:** `1`
**Platform:** Laravel Notifications + Tenant SPA (React). Do not introduce a parallel notification framework.

This document freezes contracts for in-app notifications. Implementation Phases 0–8 are complete. No architectural redesign unless a critical security, data-integrity, or production defect appears.

## Backward compatibility

No implementation phase may introduce breaking changes to existing notification consumers unless explicitly documented in that phase’s PR / CHANGELOG. Prefer additive `data` fields.

## Notification UUID

- Laravel `notifications.id` is a UUID primary key.
- Clients use this `id` as the sole stable key for Echo correlation, optimistic updates, browser toast tags, multi-tab locks, and reconnect dedupe.
- Do **not** add a second `notification_uuid` column.
- Mark-read: `POST /notifications/{id}/read`.

## Payload envelope (`schema_version: 1`)

Every CRM/ERP database notification `data` JSON includes:

| Field | Required | Notes |
|-------|----------|-------|
| `schema_version` | Yes | Integer; start at `1` |
| `type` | Yes | Namespaced string `domain.event[.digest]` |
| `category` | Yes | See NotificationCategory |
| `title` | Yes | Server-authored; SPA displays as-is |
| `body` | Yes | Server-authored; SPA displays as-is |
| `entity_type` | Yes* | Domain resource name (`lead`, `task`, …); null only when N/A |
| `entity_id` | Cond. | Required for single/show; null for digests/list |
| `actor_id` | No | User who caused the event |
| `metadata` | No | Free-form object |
| `count` | Cond. | Required for aggregated digests |
| `batch_id` | Cond. | Bulk/import batch UUID |
| `dedupe_key` | Yes* | Required for retryable producers |
| `source` | Yes | See NotificationSource |
| `route` | Yes | Route descriptor (never SPA URLs) |
| `delivery` | Yes | See NotificationDeliveryStrategy |
| `broadcast_ready` | Yes | `true` when eligible for Reverb fan-out |
| `sample_entity_ids` | No | Max 5 ids for digest preview |

\*Legacy rows without `schema_version` / `route` are treated as pre-version `0` and rendered via SPA fallback.

### Schema evolution

- Prefer additive fields.
- Bump `schema_version` when semantics change or fields are renamed/removed.
- Do not rewrite historical rows unless an approved migration job exists.
- SPA supports current and previous version; unknown higher versions → title/body only, no navigation if route cannot be resolved.

## Enums and type conventions

### NotificationCategory (backed enum)

`crm` | `tasks` | `billing` | `support` | `system`

### NotificationDeliveryStrategy (backed enum)

`immediate` | `aggregated` | `scheduled`

- `scheduled` is reserved for future in-app daily/weekly digests. Task due reminders use per-task `database` rows plus a **mail-only** daily digest (`TaskDueDigestNotification`) gated by `task_reminder_time` (**Daily Reminder Time**). The same gate sends mail-only daily CRM summaries (`DailyUserSummaryNotification` / `DailyTeamSummaryNotification`) based on `users.receive_all_users_daily_summary`.

### NotificationSource (backed enum)

`assign` | `bulk_assign` | `import` | `workflow` | `system` | `schedule`

### Route action (small enum)

`show` | `list`

### NotificationType (namespaced string — not a global mega-enum)

Convention: `domain.event[.digest]`

Examples: `lead.assigned`, `lead.assigned.digest`, `task.assigned`, `invoice.created`, `announcement`

Optional per-module PHP enums may stringify into `data.type`.

### Route resource

Module-owned allowlisted strings (`lead`, `task`, …). Not one permanent global mega-enum of all ERP resources.

## Route descriptor (no `action_path`)

Frontend-agnostic navigation intent. Backend must never persist HashRouter / React paths.

```text
route: {
  resource: "lead",
  action: "show" | "list",
  entity_id: 123 | null,
  filters: { ... }   // optional, e.g. { assigned: "me", batch_id: "..." }
}
```

| Mode | Example |
|------|---------|
| Single | `{ resource: "lead", action: "show", entity_id: 123 }` |
| Digest | `{ resource: "lead", action: "list", filters: { assigned: "me", batch_id: "..." } }` |

Validate `resource` / `action` against an allowlist on write.

### Single-notification example

```json
{
  "schema_version": 1,
  "type": "lead.assigned",
  "title": "Lead assigned",
  "body": "\"Acme renewal\" was assigned to you.",
  "category": "crm",
  "delivery": "immediate",
  "source": "assign",
  "route": {
    "resource": "lead",
    "action": "show",
    "entity_id": 123,
    "filters": []
  },
  "broadcast_ready": true,
  "entity_type": "lead",
  "entity_id": 123,
  "lead_id": 123,
  "actor_id": 42,
  "dedupe_key": "lead.assigned:123:87:20260716183000123"
}
```

### Digest example

```json
{
  "schema_version": 1,
  "type": "lead.assigned.digest",
  "title": "Leads assigned",
  "body": "25 new leads have been assigned to you.",
  "category": "crm",
  "delivery": "aggregated",
  "source": "bulk_assign",
  "route": {
    "resource": "lead",
    "action": "list",
    "entity_id": null,
    "filters": {
      "assigned": "me",
      "batch_id": "0d91b79d-7ed7-42d7-9315-52a5cfa5a280"
    }
  },
  "broadcast_ready": true,
  "entity_type": "lead",
  "entity_id": null,
  "count": 25,
  "batch_id": "0d91b79d-7ed7-42d7-9315-52a5cfa5a280",
  "sample_entity_ids": [123, 124, 125, 126, 127],
  "actor_id": 42,
  "dedupe_key": "lead.assigned.digest:0d91b79d-7ed7-42d7-9315-52a5cfa5a280:87"
}
```

The database row supplies the outer notification UUID (`id`), `read_at`, and timestamps. Reverb broadcasts `{ id, type, data, unread_count, created_at, read_at }`; it never includes credentials, tokens, email addresses, or arbitrary model serialization. `metadata` is optional module-owned scalar/array context and must not contain secrets or sensitive personal data.

## Envelope builder guideline

- Build `data` only through the shared envelope helper (`FormatsCrmDatabaseNotification` / typed builder).
- Laravel `Notification` subclasses remain the unit of delivery (channels, queue).
- Do **not** introduce a central god `NotificationFactory` that replaces `$user->notify(new X)`.

## NotificationBatch (delivery aggregation)

Aggregation is a **delivery** concern — not domain logic inside `LeadService` / Import handlers.

```text
NotificationBatch::run(batchId, source, callable)
  → subscribers: if batch active, skip per-entity notify(); keep audit
  → after orchestrator result: flush one digest (or single if count===1) per user
```

- Flush from orchestrator results (e.g. per-user counts on `BulkAssignmentResult`), not from guessing.
- Batch context is **in-process**; only the final `notify(digest)` is queued.
- Import and other bulk paths wrap the bulk assignment service — they do not reimplement aggregation.

## Idempotency

- Retryable producers supply a stable `dedupe_key` and check for an existing notification for the same notifiable **before** `notify()`.
- Immediate assignment keys include the assignment operation timestamp so a queue retry dedupes while a legitimate later reassignment still notifies.
- Digest example: `lead.assigned.digest:{batch_id}:{user_id}`
- Due/overdue example: existing daily `dedupe_key` pattern on cron notifications.
- Skip broadcast when notify was skipped due to dedupe.
- Echo client is idempotent on notification `id`.

## Channels (v1 and future)

| Channel | v1 |
|---------|-----|
| `database` | Yes — source of truth |
| `broadcast` (Reverb) | Yes — open-tab realtime |
| Browser OS toast | Client projection of Echo events — not a Laravel channel |
| `webpush` (standards Web Push / VAPID) | Yes — closed/background browsers via `WebPushChannel` |
| `mail` | Disabled for lead assigned in v1; may return later via `via()` + preferences |
| SMS / webhooks / FCM / APNs | Future Laravel channels — same Notification classes + shared platform payload mapper |

### Platform push payload

Delivery channels that wake devices must consume `PlatformNotificationPayloadMapper` (single mapping from the CRM envelope). Do not invent Web Push–specific notification classes or duplicate title/body/url mapping per channel.

Generic payload shape:

```json
{
  "title": "",
  "body": "",
  "icon": "",
  "badge": "",
  "image": "",
  "url": "",
  "tag": "",
  "type": "",
  "data": {}
}
```

`url` is a HashRouter SPA deep link derived from the route descriptor (server-side). CRM `data.route` remains descriptor-only in the database envelope.

## Reverb / Echo

- Channel: `private-tenant.{tenantId}.user.{userId}`
- Auth: authenticated user id matches `{userId}` **and** `user.tenant_id === {tenantId}`
- Broadcast envelope: `{ id, data, unread_count? }` only after successful DB write
- Echo updates the TanStack Query list/unread caches and invalidates dashboard data.
- The SPA uses a 90-second fallback poll only while Echo is disconnected; window focus also refetches.
- Reconnect fetches recover missed database rows but never replay browser OS notifications.

## Modular Notification Registry (SPA)

```text
src/notifications/
  types.ts
  compose.ts
  index.ts
  modules/
    crm.ts
    tasks.ts
    billing.ts
    support.ts
    system.ts
```

**Allowed:** icon, color, badge, route resolution from descriptor, rendering helpers, fallback rendering, schema_version-aware parse helpers.

**Forbidden:** generating titles/bodies; business logic; API calls; permission decisions.

Server remains source of truth for `title` / `body`.

## Browser Notification Manager

- Permission only via explicit UX (not on login).
- Prefer OS toasts when tab is hidden (Echo path).
- Dedupe by notification UUID; multi-tab lock (`BroadcastChannel` / `localStorage`).
- Live Echo events only — never toast on initial fetch or reconnect backfill.

## Web Push (service worker)

- Explicit opt-in (Profile switch and Notification Center control). Never prompt on bootstrap.
- Sticky denial: do not re-prompt after the user blocks notifications.
- Service worker displays push payloads and focuses/opens the SPA on click.
- Logout unsubscribes locally and deletes the backend subscription while the token is still valid.
- Expired push endpoints (`404` / `410`) are deleted automatically by `WebPushChannel`.

## REST API (additive surface)

Inbox:

- `GET /api/tenant/v1/notifications`
- `GET /api/tenant/v1/notifications/unread-count`
- `POST /api/tenant/v1/notifications/{id}/read`
- `POST /api/tenant/v1/notifications/read-all`

Web Push subscriptions (authenticated tenant user; self-scoped):

- `GET /api/tenant/v1/push-subscriptions/vapid-public-key`
- `POST /api/tenant/v1/push-subscriptions`
- `PUT /api/tenant/v1/push-subscriptions`
- `DELETE /api/tenant/v1/push-subscriptions`

## Testing strategy

| Layer | Focus |
|-------|--------|
| Pest | Payload contract, digests O(users), idempotency, channel auth, tenant isolation, Web Push subscribe/dispatch/cleanup |
| Vitest | Permission flow, SW subscription lifecycle, logout cleanup, click navigation helpers |
| Playwright | Bell, navigation, mark read (Reverb gated by env) |
| Manual | Reverb smoke, browser permission + Web Push delivery |

## Documentation strategy

- This contract is the living architecture source of truth.
- Per-phase updates to [tenant-v1-notifications.md](/api/tenant-v1-notifications) and module guides.
- **Status: Frozen (shipped)** — payload v1, NotificationBatch digests, Reverb/Echo, modular registry, browser manager, prune command.

## Observability (lightweight)

| Metric | Where |
|--------|--------|
| `notifications.created` | After DB write |
| `notifications.aggregated` | Digest flush |
| `notifications.broadcast` | After broadcast dispatch |
| `notifications.failed` | Job / channel failure |
| `notifications.browser_shown` | SPA (sampled) |
| `notifications.browser_clicked` | SPA on OS click |
| `notifications.webpush` | After successful Web Push send |
| `notifications.webpush_subscription_expired` | Expired endpoint cleanup |

## Module recipe (add a new notification type)

1. Domain event + subscriber (mirror Leads).
2. Laravel Notification class using `FormatsCrmDatabaseNotification` + optional `BroadcastsCrmNotification` / `SendsWebPushNotification`.
3. Set `category`, `delivery`, `source`, `route` descriptor, `dedupe_key`.
4. For bulk ops: wrap orchestrator in `NotificationBatch::run` and flush digests from result counts — never notify inside per-entity loops.
5. Add SPA registry entry under `src/notifications/modules/{domain}.ts`.
6. Pest: payload shape, idempotency, tenant isolation; Playwright if UI-visible.
7. To wake closed browsers: implement `SupportsWebPush` and `withWebPushChannel(...)` in `via()` — do not create Web Push–specific notification classes.

## Out of scope (v1)

Full preferences UI (beyond Web Push enable/disable), in-app `delivery: scheduled` digests (task due mail digests ship separately), Firebase/OneSignal/FCM channel implementation, custom notifications table, NotificationRepository, AppLayout redesign.
