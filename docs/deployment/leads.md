# Leads — Production Guide

## Licensing

- Catalog slug: `leads`
- Default-included, non-billable for new workspaces
- Deactivate via Central module subscription tools to revoke access without dropping data

## Bootstrap

On workspace provision:

1. Default modules installed (includes Leads)
2. `LeadService::ensureDefaultStages()` / `LeadStageSeeder` seeds New → … → Won / Lost

Existing workspaces without stages get stages lazily on first Leads API call.

## Permissions rollout

New Leads permissions for **existing** workspaces must ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])` (same pattern as Communication Templates). Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

Status migration maps legacy `open` → `active` and `won`/`lost` → `closed`. Column rename: `estimated_value` → `lead_value`.

Include `leads.manage_integrations` in the grant list for lead ingest integrations.

## Queue workers

Lead imports run on the dedicated `imports` queue. Meta Lead Ads ingest uses `lead-ingest`:

```bash
php artisan queue:work --queue=lead-ingest,imports,emails,default --sleep=1 --tries=3 --max-time=3600
```

Ensure at least one worker listens to `imports` and `lead-ingest`. Uploads use the configured `filesystems.uploads` disk (`public` locally / `s3` in production) under `imports/{tenant_uuid}/`.

## Lead ingest webhooks

| Endpoint | Notes |
|----------|-------|
| `POST /webhooks/leads/custom/{uuid}` | Per-tenant Custom Webhook (HMAC or Bearer) |
| `GET/POST /webhooks/leads/meta` | Shared Meta Lead Ads ingress (signature + verify challenge) |

CSRF-exempt under `webhooks/leads/*`. Configure Meta App ID/secret/verify token via Central `PUT /api/central/v1/integrations/meta-lead-ads` or `META_LEAD_ADS_*` env.

### Meta production gates (required for customer Pages)

Before enabling Meta Lead Ads for customer workspaces:

1. Meta **Business Verification** completed for the platform app
2. Meta **App Review** approved for `leads_retrieval` + `pages_manage_metadata` (and related Page scopes)
3. App switched to **Live Mode**
4. Webhook subscription field `leadgen` pointed at `https://{api}/webhooks/leads/meta` with the configured verify token
5. OAuth redirect URI registered: `https://{api}/api/oauth/leads/meta/callback`
6. At least one worker consuming `lead-ingest`
7. Smoke: Connect Meta → select Pages → submit a Lead Ad form → lead appears in workspace

Without steps 1–3, only Meta test Apps / test users work.

### Deploy checklist (ingest)

- [ ] Migrate ingest tables + `leads.manage_integrations` permission grant
- [ ] Queue worker includes `lead-ingest`
- [ ] `META_LEAD_ADS_*` (or Central settings) set for production
- [ ] Custom webhook HMAC/Bearer smoke
- [ ] Meta verify challenge + signed webhook smoke (sandbox)
- [ ] Confirm deactivated `module:leads` rejects ingress

## Monitoring

- Platform audit events: `lead_created`, `lead_updated`, `lead_deleted`, `lead_assigned`, `lead_stage_changed`, `lead_note_added`, `lead_follow_up_*`, `lead_import_completed`, `lead_import_failed`, convert-related activity
- Mail + database notifications: assignment, follow-up created, follow-up due/overdue (`crm:send-due-notifications` every 5 minutes)
- Tenant mail settings with Central SMTP fallback

## Scheduled jobs

| Command | Cadence | Purpose |
|---------|---------|---------|
| `crm:send-due-notifications` | Every 5 minutes (`onOneServer`) | Idempotent due/overdue follow-up (and task) notifications |

Ensure the Laravel scheduler is running in production.

## Deploy checklist

1. Migrate lead tables + Sprint 2 enhance migration + `lead_assignment_histories` + `lead_imports`
2. Deploy frontend (Kanban/table, KPIs, export, import wizard/history, convert stub, notifications)
3. Confirm `module:leads` + expanded permissions (including `leads.import`)
4. Confirm queue worker includes `imports`
5. Smoke: register/login → Leads board → create → DnD stage (save) → export → import template → small CSV import → history download → convert stub
