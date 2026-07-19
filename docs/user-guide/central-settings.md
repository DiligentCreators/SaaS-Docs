# Central Application Settings — User Guide

Central admins configure platform identity and behavior under **Settings** (not Billing).

## Tabs

| Tab | What to set |
|-----|-------------|
| **General** | **Application Name** — browser title, sidebar, auth screens. **Company Name** — copyrights and email salutations only. Timezone / Locale / Currency (searchable). Registration enabled. |
| **Localization** | Date format + 12/24-hour time. Tables and timelines across Central use these formats. |
| **Mail** | Provider (SMTP, Postmark, Mailgun, Log, …), provider credentials, From / Reply-To / timeout. For Postmark/Mailgun: copy the **Webhook URL**, set the signing secret, and select which delivery events to process. Use **Send test** (can use unsaved form values). Leave secrets blank to keep existing values. |
| **Branding** | Button color (primary buttons), support email (shown on maintenance/registration-closed and tenant emails), logo + favicon uploads with preview. |
| **Security** | Session timeout (minutes), minimum password length, require special character. Applies to Central and Tenant password forms. |
| **Maintenance** | Tenant Application only. Central stays fully usable so you can turn maintenance off. Optional message + ETA. |
| **Billing** | Invoice prefix, proration mode, default gateway code, trial / Stripe flags. Gateway secrets are managed under **Billing → Payment Gateways**. |

## Registration closed

When **Registration enabled** is off:

1. `POST /public/register-workspace` returns `403`.
2. Visiting `/register` shows the dedicated **Registration closed** page (with logo/support/copyright when configured).

## Tenant maintenance

When **Tenant maintenance mode** is on:

- Tenant API responses return `503` with `code: maintenance_mode`.
- Tenant SPA shows the branded maintenance page.
- Central admin API and UI continue to work.

## Tips

- Change Application Name if you want the product title to update immediately (after save + public bootstrap refresh).
- Use Company Name for legal/copyright wording without renaming the product in the chrome.
- After mail provider changes, always send a test email before relying on invites or password resets. Restart queue workers after credential changes so queued mail picks up the new config.
- For Postmark/Mailgun, paste the webhook URL into the provider dashboard and enable the same events selected in Settings.
- Review delivery history under **Email logs** — open a row to see the full message body and use **Resend** when you have `email-logs.resend`.
