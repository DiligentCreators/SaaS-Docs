# Branded — User Guide

The **Branded** marketplace module lets a workspace map a **custom domain** and use its brand name / logo in emails and web push notifications.

## Who can use it

1. Purchase or install **Branded** from Marketplace (`module:branded`).
2. You need permission **View branded** / **Manage branded** (`branded.view` / `branded.manage`). Workspace admins get both by default.

Without the module, the Settings **Domain** tab is hidden and custom hostnames never bind to the workspace — even if someone points DNS or an IP at the server.

## Map a custom domain

1. Open **Settings → Domain**.
2. Enter a hostname such as `myai.com.pk` or `app.domain.co.uk` (multi-part ccTLDs are supported).
3. Save, then create the DNS records shown on the page:
   - **TXT** ownership record on `_saleos-verification.<your-host>`
   - **A** / **AAAA** to the platform server IP(s), **or** **CNAME** to the platform target
4. Click **Verify DNS**.

The hostname becomes active only after verification succeeds **and** Branded remains licensed.

Platform subdomains (for example `acme.localhost`) stay managed by Central — they are not configured on this tab.

## Brand in notifications

While Branded is active:

- Tenant emails use your application / company name, logo, and button color in the mail chrome.
- Web push notifications use your logo / favicon and prefix titles with your application name.

Visual SPA branding (Settings → Branding) remains available to all workspaces; notification white-label and custom domains require Branded.

## Remove or cancel

- **Remove** on the Domain tab deletes the custom hostname mapping.
- Cancelling the Branded subscription clears verification so the custom host stops resolving.
