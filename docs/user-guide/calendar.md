# Calendar

Use Calendar to manage **your** personal events. Default view is **Week** (Google-style vertical time slots); **Day**, **Month**, and **Agenda** are also available.

## Access

- Workspace must have the **Calendar** module installed (included by default).
- Your role needs `calendar.view` (and `create` / `update` / `delete` for edits).

## Visibility

| Role | What you see |
|------|----------------|
| Staff (no `view_all`) | Only events you created |
| Owner / Admin / Manager (`calendar.view_all`) | All workspace events |

There is **no calendar assignment**. You cannot assign a calendar to someone else. Booking meetings and assigning a host belongs to the future **Meetings** module.

## Create an event

1. Open **Calendar** from the workspace nav.
2. Click **New event**, click a day cell (Month), or click a time slot (Week/Day).
3. Enter title, start/end, optional description and all-day.
4. Save — the event is stored on **your** personal calendar.

Times use the workspace timezone from settings (not only the browser’s local clock).

## Views

- **Week** (default) / **Day** — vertical hour slots; events are sized by start/end. Overlapping events share the column side-by-side. Click a slot to create at that hour. **Drag** an event to another day or time to reschedule (requires `calendar.update`; snaps to 15-minute increments).
- **Month** — month grid; chips show start time + title.
- **Agenda** — chronological list with start/end times and search.

## Cancel vs delete

- **Cancel event** — keeps the record, marks status `cancelled`.
- **Delete** — soft-deletes the event.

## Dashboard

The tenant dashboard shows an **Upcoming events** widget (same visibility rules as the list).
