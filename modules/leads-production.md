# Leads — Production Guide

## Licensing

- Catalog slug: `leads`
- Default-included, non-billable for new workspaces
- Deactivate via Central module subscription tools to revoke access without dropping data

## Bootstrap

On workspace provision:

1. Default modules installed (includes Leads)
2. `LeadService::ensureDefaultStages()` seeds New → … → Won / Lost

Existing workspaces without stages get stages lazily on first Leads API call.

## Permissions rollout

After deploying expanded `leads.assign`, re-bootstrap roles for existing workspaces (owner syncs all permissions; default roles use `tenant-default-role-permissions.php`).

## Monitoring

- Platform audit events: `lead_created`, `lead_updated`, `lead_deleted`, `lead_assigned`, `lead_stage_changed`, `lead_note_added`, `lead_follow_up_*`
- Mail: assignment and follow-up notifications use tenant mail settings with Central SMTP fallback

## Deploy checklist

1. Migrate lead tables
2. Deploy frontend with Leads route (not placeholder)
3. Confirm `module:leads` + permissions
4. Smoke: register/login → Leads list → create lead
