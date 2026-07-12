# Leads — User Guide

## Who can use Leads

Your workspace must have the **Leads** module installed (included by default on new workspaces). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `assign`, `export`, `convert` as needed).

Without **assign**, you only see leads assigned to you.

## Board & table

Open **Leads** from the sidebar. The default view is the **Kanban board** (columns = pipeline stages). Switch to **Table** when you prefer a list.

- Search by name, email, phone, or company
- Filter by stage, status, priority, assignee, and lead value range
- KPI cards summarize totals, pipeline value, follow-ups, and conversion metrics for your scope

## Create & edit

1. Click **New lead**
2. Enter name (required) and optional contact / company / source / **lead value** / priority / status
3. Optionally set stage and assignee (assignee requires **assign**)
4. Save

Edit from the row menu or the detail drawer.

## Pipeline vs status

- **Stage** — where the lead sits in the sales pipeline (New … Won / Lost). Moving a card on the board proposes a stage change; open the drawer and **Save** to commit (Cancel restores the card).
- **Status** — lifecycle state managed separately: Active, Waiting, On hold, Closed, Archived. Changing stage does **not** automatically change status.

## Assignment

Users with **assign** can set or clear the assignee. Assignment changes are recorded in **Assignment history**. The assignee receives an in-app and email notification when someone else assigns them.

## Notes & follow-ups

- **Notes** — free-form history on the lead
- **Follow-ups** — titled reminders with due dates; edit/reschedule or complete when done
- Assignees receive notifications when a follow-up is created for them (by someone else) and when due/overdue reminders run

## Convert

Users with **convert** can mark a lead converted. Today this is a **stub**: the lead is stamped with `converted_at`, status becomes Closed, and an activity is recorded. Creating Contact/Company records is deferred until those modules ship.

## Export

Users with **export** can download the current filtered set as **CSV** or **XLSX**.

## Activity timeline

The **Activity** tab shows create, update, stage, assignment, note, follow-up, convert, and related events.
