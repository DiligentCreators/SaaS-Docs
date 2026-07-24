# Branded — User Guide

The **Branded** marketplace module lets a workspace map a **custom domain** and use its brand name / logo in emails and web push notifications.

## Who can use it

1. Purchase or install **Branded** from Marketplace (`module:branded`).
2. You need permission **View branded** / **Manage branded** (`branded.view` / `branded.manage`). Workspace admins get both by default.

Without the module, the Settings **Domain** tab is hidden and custom hostnames never bind to the workspace — even if someone points DNS or an IP at the server.

## Map a custom domain

1. Open **Settings → Domain**.
2. **Step 1 — Enter your website address** (for example `myai.com.pk` or `app.domain.co.uk`; multi-part ccTLDs are supported) and choose **Continue**.
3. **Step 2 — Connect it at your domain provider** (GoDaddy, Namecheap, Cloudflare, etc.):
   - Copy the **TXT** ownership values (Name / Host and Value) and paste them as a TXT record.
   - Copy the recommended **A** record (Name / Host and Points to IP). Advanced options cover AAAA / CNAME when your operator provides them.
4. **Step 3 — Check the connection**: choose **I’ve added the records — Check now**.

DNS can take a few minutes (sometimes up to 24 hours). The address becomes active only after the check succeeds **and** Branded remains licensed. Pointing an IP alone does not activate the workspace.

Platform subdomains (for example `acme.localhost`) stay managed by Central — they are not configured on this tab.

## Brand in notifications

While Branded is active:

- Tenant emails use your application / company name, logo, and button color in the mail chrome.
- Web push notifications use your logo / favicon and prefix titles with your application name.

Visual SPA branding (Settings → Branding) remains available to all workspaces; notification white-label and custom domains require Branded.

## Remove or cancel

- **Remove** on the Domain tab deletes the custom hostname mapping.
- Cancelling the Branded subscription clears verification so the custom host stops resolving.
