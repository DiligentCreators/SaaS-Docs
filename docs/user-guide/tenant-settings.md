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

## Branding

| Field | Behavior |
|-------|----------|
| **Button color** | Primary buttons and accents for this workspace only. |
| **Support email** | Shown in tenant-facing emails when set. |
| **Logo / Favicon** | Upload immediately. If unset, the platform (Central) logo/favicon is used automatically. |

Hints under fields show when a value is still inheriting the Central default.

## Mail

Configure SMTP only if this workspace should send from its own mail server.

- Leave **Host** empty to keep using the Central Application SMTP.
- Password fields never show the stored secret; leave blank to keep the existing password.
- Use **Send test** to verify delivery.

## What you cannot change

Platform registration, maintenance mode, password policy, and billing defaults stay under Central Settings.
