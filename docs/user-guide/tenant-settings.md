# Tenant Settings — User Guide

Workspace **Settings** lets each tenant customize identity and mail without affecting other workspaces or the Central Application.

## Open Settings

In the Tenant Application sidebar, open **Settings**.

You need permission to view/update settings (workspace owners have this by default).

## General

| Field | Behavior |
|-------|----------|
| **Workspace Name** | Display name for the workspace. Also used as the browser/app title unless you set Application Name. |
| **Application Name** | Optional title override. Leave blank to use Workspace Name. |
| **Company Name** | Used in emails and documents. |
| **Timezone / Locale / Currency** | Workspace defaults. Inherit from Central when not customized. |
| **Daily Reminder Time** | Local workspace time (default `09:00`) for the daily CRM summary email and the consolidated task due digest. Assignees still get in-app alerts per due/overdue task. |
| **Default meeting provider** | Preselects None / Google Meet / Zoom on the Meetings schedule form (`meetings_default_provider`). Connecting providers is done under Meetings → Integrations. |

## Security

| Field | Behavior |
|-------|----------|
| **Session timeout (minutes)** | How long a signed-in user may stay idle before the app signs them out. Inherits the Central platform default when not customized. |
| **Never timeout** | Sets timeout to `0` so users stay signed in until they use **Sign out** (or an admin revokes their token). Issues a non-expiring API token for that workspace. |

Password length / special-character rules stay under Central Settings.

## Branding

| Field | Behavior |
|-------|----------|
| **Button color** | Primary buttons and accents for this workspace only. |
| **Support email** | Shown in tenant-facing emails when set. |
| **Logo / Favicon** | Upload immediately. If unset, the platform (Central) logo/favicon is used automatically. |

Hints under fields show when a value is still inheriting the Central default.

With the **Branded** marketplace module, logo and application name are also used in email chrome and web push. See [Branded](/user-guide/branded).

## Domain (Branded module)

When **Branded** is installed, **Settings → Domain** lets you map a custom hostname (including multi-part ccTLDs). See [Branded](/user-guide/branded).

## Mail

Choose **Use system provider** to inherit Central Application mail, or **Use custom provider** for workspace-specific SMTP / Postmark / Mailgun.

- Password and API token fields never show the stored secret; leave blank to keep the existing value.
- With a custom Postmark/Mailgun provider, copy the workspace **Webhook URL**, set the signing secret, and select delivery events to process.
- Use **Send test** to verify delivery (uses the form values, including unsaved changes when supported).
- Delivery history is available under **Email logs** — open a message to view the full body and **Resend** when permitted.

## What you cannot change

Platform registration, maintenance mode, password policy, and billing defaults stay under Central Settings.
