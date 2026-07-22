# Meetings

Use **Meetings** to schedule workspace meetings, invite teammates (and external guests by email), connect a workspace Zoom or Google Meet account, and set one reminder before start.

## Access

- Workspace must have the **Meetings** module installed (included by default; requires **Calendar**).
- Your role needs `meetings.view` (and `create` / `update` / `delete` for edits).
- Connecting Zoom/Google requires `meetings.manage_integrations`.

## Visibility

| Role | What you see |
|------|----------------|
| Staff (no `view_all`) | Meetings you created, host, or are invited to |
| Owner / Admin / Manager (`meetings.view_all`) | All workspace meetings |

Invitees use the Meetings list/detail as their source of truth. Calendar shows the **host’s** projected event (Calendar ACLs remain organizer-scoped).

## Schedule a meeting

1. Open **Meetings** from the workspace nav.
2. Click **New meeting**.
3. Enter title, start/end, timezone, optional agenda.
4. Choose a provider:
   - **None** — optional manual join URL
   - **Google Meet** / **Zoom** — requires a connected workspace account
5. Add internal invitees and optional external guests (`Name <email@domain>` per line).
6. Optionally set **one reminder** (15 minutes, 1 hour, 24 hours, or custom minutes before start).
7. Save.

Host defaults to you. Users with `meetings.assign_host` can reassign the host.

## Connect Zoom or Google Meet

1. Open Meetings → **Integrations** (owners/admins with `meetings.manage_integrations`).
2. Click the **info** icon next to Zoom or Google Meet for step-by-step setup (create the provider OAuth app, required scopes, and how to connect in SaleOS).
3. Create an OAuth app in Google Cloud / Zoom Marketplace for **your organization**.
4. Paste the shown **OAuth callback URL** into that app’s redirect settings (copy from Integrations or the setup guide).
5. For Zoom, add scopes `meeting:write:meeting`, `meeting:read:meeting`, `meeting:delete:meeting`, and `user:read:user` (missing write → create error 4711; missing delete → remote cancel fails while SaleOS still cancels locally).
6. For Google, enable the Meet API and register a **localhost** or **HTTPS** redirect URI (Google rejects `http://*.test`). Meet creates a joinable space link (not a full Calendar conference).
7. Save your workspace **Client ID** and **Client secret** (optional webhook secret is reserved for a future native webhook integration).
8. Click **Connect account** and approve access with the workspace Google/Zoom user.

Staff then schedule using those workspace connections — not personal accounts or platform-wide keys.

If a selected provider is not connected, scheduling with that provider is blocked. If you change Zoom/Google scopes later, disconnect and connect again so a new token is issued.

## Reminder

Creators can set **one** reminder offset. At that time, the creator, host, and invitees receive:

- In-app notification
- Web push (when subscribed)
- Email

External email-only guests receive email only. Cancelling or rescheduling the meeting updates or cancels the pending reminder.

## Cancel vs delete

- **Cancel** — keeps the record, marks status `cancelled`, cancels the Calendar projection and pending reminder. Remote Zoom/Google delete is best-effort: if the provider rejects delete (often missing `meeting:delete:meeting`), the meeting stays cancelled in SaleOS and `provider_sync_error` explains the remote failure.
- **Delete** — soft-deletes the meeting and removes the Calendar projection (same best-effort remote delete).

## Settings

Workspace **Settings → General** includes **Default meeting provider** (`meetings_default_provider`: `none` | `google_meet` | `zoom`) used to preselect the schedule form.
