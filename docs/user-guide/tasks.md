# Tasks — User Guide

## Who can use Tasks

Your workspace must have the **Tasks** module installed (included by default on new workspaces). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `assign`, `complete`, `change_due_date` as needed).

Without **assign**, you only see tasks assigned to you.

## Board & list

Open **Tasks** from the sidebar. The default view is the **Board** (columns by status). Switch to **List** for a table.

- Search by title or description
- Filter by status, priority, and assignee
- KPI cards summarize totals, due today / this week, overdue, and completion metrics for your scope

Status labels in the UI:

| Value | Label |
|-------|-------|
| `open` | To Do |
| `in_progress` | In Progress |
| `waiting` | Waiting |
| `completed` | Completed |
| `cancelled` | Cancelled |

## Create & edit

1. Click **New task**
2. Enter title (required) and optional description, status, priority, due date, and assignee
3. Save

Edit from the row menu or the detail drawer. Dragging a card on the board proposes a status change; **Save** in the drawer commits it (Cancel restores the card).

## Due dates

You can set a due date when creating a task. Changing the due date later requires the **change due date** permission (`tasks.change_due_date`).

## Assignment

Users with **assign** can set or clear the assignee. The assignee receives an in-app and email notification when someone else assigns them.

## Complete & reopen

Users with **complete** can mark a task completed (sets `completed_at`) or reopen it from the detail drawer.

## Comments & history

- **Comments** — free-form notes (stored as task notes)
- **History** — activity timeline (create, update, assignment, complete, reopen, note, etc.)
