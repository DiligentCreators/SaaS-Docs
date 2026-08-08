# Meta App Setup for EloSync / EloSync

> **Operator guide** — how to create a Meta (Facebook) Developer App and wire it to the platform so tenants can connect **Meta Lead Ads**.
>
> Architecture and driver details: [Meta Lead Ads Integration](/developer-guide/meta-lead-ads-integration).  
> Production gates: [Leads — Production Guide](/deployment/leads).

---

## Overview

EloSync uses **one platform Meta App** (Central credentials). Each tenant then connects their own Facebook Pages via OAuth. Page tokens stay tenant-scoped; webhooks share a single ingress URL.

| Role | Example host | Purpose |
|------|--------------|---------|
| API (`APP_URL`) | `https://api.elosync.com` | OAuth callback + webhook |
| SPA (`FRONTEND_URL`) | `https://app.elosync.com` | Post-OAuth return to Leads UI |

Replace hosts with your real `APP_URL` / `FRONTEND_URL`.

### Two different Meta URLs (do not mix)

| Purpose | Path | Where to register in Meta |
|---------|------|---------------------------|
| **OAuth redirect** | `https://{api}/api/oauth/leads/meta/callback` | Facebook Login for Business → **Valid OAuth Redirect URIs** |
| **Webhook callback** | `https://{api}/webhooks/leads/meta` | Webhooks → Callback URL (`leadgen`) |

Putting the webhook URL in Valid OAuth Redirect URIs causes **URL blocked**. Putting only the OAuth URL in Webhooks breaks lead delivery.

---

## Part A — Create the Meta App

### 1. Create the app

1. Open [Meta for Developers](https://developers.facebook.com/) → **My Apps** → **Create App**.
2. When asked for a use case, select **Create & manage ads with Marketing API**.
3. If a follow-up offers **Capture & manage ad leads** (or similar), enable it.
4. Name the app (e.g. `EloSync`), set a contact email, attach a Business Portfolio if prompted.
5. Finish creation.

Do **not** rely on **Authenticate and request data from users with Facebook Login** alone — that does not unlock Lead Ads scopes (`leads_retrieval`, etc.).

### 2. App Domains

**App settings → Basic → App domains** (bare hosts, no `https://`):

```text
elosync.com
api.elosync.com
app.elosync.com
```

Add every SPA subdomain you actually use. Missing domains cause: *The domain of this URL isn't included in the app's domains.*

Save changes.

### 3. Enable permissions (required)

EloSync requests these OAuth scopes (`config/meta.php`):

```text
leads_retrieval
pages_manage_metadata
pages_manage_ads
pages_show_list
pages_read_engagement
ads_read
business_management
```

1. Open **Use cases** → **Create & manage ads with Marketing API** → **Customize**.
2. Under **Permissions and features**, add each permission above until status is **Ready for testing**.
3. Also enable if Meta lists them for Lead Ads: `ads_management`.

If a scope is missing from the app, Facebook shows **Invalid Scopes** (developers only). Enabling permissions on the use case is the fix — not changing EloSync code.

After adding scopes to an already-connected workspace, tenants must **Disconnect Meta** then **Connect Meta** again so Facebook re-grants the new permissions.

### 4. Facebook Login for Business

Left nav → **Facebook Login for Business** → **Settings**:

1. **Client OAuth login** = Yes  
2. **Web OAuth login** = Yes  
3. **Enforce HTTPS** = Yes  
4. **Valid OAuth Redirect URIs** — add **only**:

```text
https://{api}/api/oauth/leads/meta/callback
```

Example: `https://api.elosync.com/api/oauth/leads/meta/callback`

5. Save.  
6. Use the **Redirect URI Validator** with that same callback URL (not the webhook path).

### 5. Webhooks

Configure a Page webhook for leadgen:

| Field | Value |
|-------|--------|
| Callback URL | `https://{api}/webhooks/leads/meta` |
| Verify token | Long random string (store securely; EloSync must use the same value) |
| Subscription | **Page** → field **`leadgen`** |

Verify and save **after** Central credentials are stored (Part B), or Meta’s verify challenge will fail.

### 6. Copy credentials

**App settings → Basic**:

- **App ID**
- **App Secret** (Show → copy)

---

## Part B — Connect Meta to EloSync (Central)

### 1. Backend env

```env
APP_URL=https://api.elosync.com
FRONTEND_URL=https://app.elosync.com
```

Optional (instead of, or as fallback for, Central settings):

```env
META_LEAD_ADS_APP_ID=
META_LEAD_ADS_APP_SECRET=
META_LEAD_ADS_WEBHOOK_VERIFY_TOKEN=
META_GRAPH_VERSION=v21.0
```

`oauthRedirectUri()` and `webhookUrl()` are built from `url(...)` / `APP_URL`. A wrong `APP_URL` produces a redirect URI Meta will reject.

### 2. Save credentials via Central API

Authenticated Central admin:

```http
PUT /api/central/v1/integrations/meta-lead-ads
```

```json
{
  "meta_lead_ads_app_id": "YOUR_APP_ID",
  "meta_lead_ads_app_secret": "YOUR_APP_SECRET",
  "meta_lead_ads_webhook_verify_token": "YOUR_VERIFY_TOKEN",
  "meta_graph_version": "v21.0"
}
```

Confirm with `GET /api/central/v1/integrations/meta-lead-ads`:

- `configured` = `true`
- `oauth_redirect_uri` = `https://{api}/api/oauth/leads/meta/callback`
- `webhook_url` = `https://{api}/webhooks/leads/meta`

### 3. Queue worker

Meta ingest uses the `lead-ingest` queue. At least one worker must listen to it:

```bash
php artisan queue:work --queue=lead-ingest,imports,emails,default --sleep=1 --tries=3 --max-time=3600
```

### 4. Finish Meta webhook verification

In Meta → Webhooks, **Verify and save** the callback + verify token now that EloSync can answer the challenge.

---

## Part C — Connect a tenant workspace

### Prerequisites

- Leads module installed for the workspace
- User permission `leads.manage_integrations`
- While the Meta app is in **Development**, the Facebook user must be an **Admin / Developer / Tester** on the app
- That user must be able to access the Facebook Page and Lead Forms to connect

### Steps in EloSync

1. Open the tenant app → **Leads**.
2. Open **Integrations** → tab **Meta Lead Ads**.
3. If the tab says platform is not configured, finish Part B first.
4. Click **Connect Meta** → approve Facebook permissions.
5. Select Facebook **Page(s)** to subscribe → save.
6. Status should become **connected**. Optional: set **Default source** label.

### Smoke test

1. Submit a Lead Ad form on a subscribed Page.
2. Confirm a lead appears in that workspace.

In Development mode, test submissions typically must come from users with a role on the Meta app.

---

## Part D — Production (customer Pages)

Before real customer Pages work outside app roles:

1. Complete Meta **Business Verification**.
2. Submit **App Review** for `leads_retrieval`, `pages_manage_metadata`, and related Page scopes.
3. Switch the app to **Live**.
4. Re-smoke: Connect Meta → select Pages → form submit → lead created.

Until steps 1–3 are done, only Meta test apps / app-role users work. See [Leads — Production Guide](/deployment/leads).

---

## Troubleshooting

| Error / symptom | Likely cause | Fix |
|-----------------|--------------|-----|
| **URL blocked** / redirect not white-listed | Webhook URL registered as OAuth redirect, or `APP_URL` mismatch | Whitelist exact `/api/oauth/leads/meta/callback`; match scheme/host/port to `APP_URL` |
| **Domain of this URL isn't included in the app's domains** | SPA or API host missing from App Domains | Add `api.*`, `app.*`, and root domain; save |
| **Invalid Scopes: leads_retrieval, …** | Marketing API / Lead Ads use case missing, or permissions not **Ready for testing** | Customize use case → add all EloSync scopes |
| Meta Lead Ads **not configured by the platform administrator** | Central / env credentials incomplete | Set App ID, secret, and verify token |
| Connect works, no leads | Webhook not verified, `leadgen` not subscribed, or no `lead-ingest` worker | Fix Webhooks + queue worker |
| Validator green but OAuth still fails | Validated the **webhook** URL instead of the **OAuth callback** | Re-check with `/api/oauth/leads/meta/callback` |

---

## Checklist

- [ ] Use case: **Create & manage ads with Marketing API** (+ Lead Ads if offered)
- [ ] Permissions **Ready for testing** (all five EloSync scopes)
- [ ] App Domains include API + SPA hosts
- [ ] OAuth redirect = `/api/oauth/leads/meta/callback`
- [ ] Webhook = `/webhooks/leads/meta` + Page `leadgen`
- [ ] Central / `META_LEAD_ADS_*` configured; `GET` shows `configured: true`
- [ ] Queue worker includes `lead-ingest`
- [ ] Tenant Connect Meta → select Pages → test form

---

## Related

- [Meta Lead Ads Integration](/developer-guide/meta-lead-ads-integration) — architecture, driver, multi-tenant design
- [Lead Source Driver Architecture](/developer-guide/lead-source-driver-architecture)
- [Custom Lead Webhook](/developer-guide/custom-lead-webhook)
- [Leads — Production Guide](/deployment/leads)
- [Leads — User Guide](/user-guide/leads-overview)
- [Tenant Leads API](/api/tenant-v1-leads)
- [WhatsApp Cloud Integration](/developer-guide/whatsapp-cloud-integration) — separate Meta products; may share a Business Portfolio later
