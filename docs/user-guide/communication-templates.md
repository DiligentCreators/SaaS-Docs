# Communication Templates

Create reusable **plain-text** messages for WhatsApp (and future channels). Templates support clickable placeholders such as lead name, agent name, and workspace name.

SaleOS does not send messages for you. WhatsApp opens in a new tab with the message pre-filled.

## Manage templates

1. Open **Templates** in the workspace navigation (requires the Communication Templates module and view permission).
2. Click **New template**.
3. Enter a name, choose context (e.g. Leads), channel (WhatsApp), optional category, and message body.
4. Click placeholder chips to insert tokens at the cursor (or replace selected text).
5. Save. Toggle **Active** off to hide a template from pickers without deleting it.

## Send via WhatsApp from a Lead

1. Open a lead that has a phone number.
2. Click **WhatsApp** next to the phone field.
3. Pick a template and review the preview, **or** open a blank chat if you have no templates (or do not want one).
4. WhatsApp Web (or the WhatsApp app) opens. Send from WhatsApp as usual.

There is no outbound message history in this version.

## Permissions

| Action | Typical roles |
|--------|----------------|
| View / use templates | Admin, Manager, Staff |
| Create / update | Admin, Manager |
| Delete | Admin |

Workspace owners (superadmin) have full access.
