# Scheduling Platform Phase 12 — Manual QA / UAT

> **Status: Package ready — human UAT execution required**  
> Architecture v1.0 and ADR-001–006 frozen. Feature freeze in effect.  
> Phases 0–11 complete. **Do not push / PR / merge** until Release Phase approval.

This page is the canonical Phase 12 package. It is a **runbook for human QA/UAT** against a real staging (or local-with-sandbox-providers) environment. Automated evidence from Phase 11 does **not** replace live provider OAuth, email rendering, cross-browser, or responsive UAT.

| Field | Value |
|-------|--------|
| Product | SaleOS Scheduling Platform v1.0 |
| Scope | Calendar, Meetings, Providers, Sync, Notifications, Reminders, Admin Ops |
| Allowed changes | Defect fixes only |
| Enhancements | Record as post-v1.0 backlog — do not implement in Phase 12 |

---

## How to use this package

1. Provision a **staging** tenant with Calendar + Meetings installed (default-included).
2. Configure real sandbox credentials: Zoom, Google (Meet + Calendar), Microsoft 365 (Outlook).
3. Run workers/queues (`queue:work`, scheduler) so reminders, mail, and sync jobs process.
4. Execute [§1 Manual QA Checklist](#1-manual-qa-checklist) row by row; mark Pass / Fail / Blocked.
5. Log every Fail in [§4 Defect Log](#4-defect-log); fix Critical/High only under freeze rules.
6. Complete [§2](#2-browser-compatibility-report)–[§3](#3-provider-validation-report).
7. Obtain sign-off via [§6](#6-uat-sign-off-checklist).
8. Only then request Release Phase approval.

**Severity**

| Level | Definition | Gate |
|-------|------------|------|
| Critical | Data loss, security breach, tenant leak, cannot schedule core meetings | Must be 0 |
| High | Major workflow broken for Admin/Manager (create/sync/notify fails) | Must be 0 |
| Medium | Workaround exists; incorrect UX or intermittent | Reviewed before GA |
| Low | Cosmetic, copy, minor a11y | Documented OK |

---

## 1. Manual QA Checklist

**Environment:** _____________ **Build/SHA:** _____________ **Tester:** _____________ **Date:** _____________

Mark: `P` Pass · `F` Fail · `B` Blocked · `N/A`

### 1.1 Authentication

| ID | Case | Result | Notes |
|----|------|--------|-------|
| A1 | Tenant login | | |
| A2 | Logout clears session | | |
| A3 | Session timeout / re-auth | | |
| A4 | Remember Me | | |
| A5 | Forgot / reset password email + SPA link | | |
| A6 | Tenant isolation (login workspace A vs B) | | |

### 1.2 Calendar

| ID | Case | Result | Notes |
|----|------|--------|-------|
| C1 | Month view | | |
| C2 | Week view | | |
| C3 | Day view | | |
| C4 | Agenda view | | |
| C5 | Create event | | |
| C6 | Edit event | | |
| C7 | Delete / cancel event | | |
| C8 | Categories (filter / assign if present) | | |
| C9 | Colors | | |
| C10 | Filters / search | | |
| C11 | Personal calendar (“My Calendar”) | | |
| C12 | Team calendar (if available in UI; else API-only → note) | | |

### 1.3 Meetings (lifecycle & modes)

| ID | Case | Result | Notes |
|----|------|--------|-------|
| M1 | Draft | | |
| M2 | Scheduled | | |
| M3 | In progress | | |
| M4 | Completed | | |
| M5 | Cancelled | | |
| M6 | Internal | | |
| M7 | Client | | |
| M8 | Physical | | |
| M9 | Online | | |
| M10 | Hybrid | | |
| M11 | Participants add/remove | | |
| M12 | Notes | | |
| M13 | Attachments (link) | | |
| M14 | Appears on Calendar when scheduled | | |

### 1.4 Zoom (real sandbox)

| ID | Case | Result | Notes |
|----|------|--------|-------|
| Z1 | OAuth connect | | |
| Z2 | Connection visible / reconnect | | |
| Z3 | Validate | | |
| Z4 | Health | | |
| Z5 | Create online meeting → Join URL | | |
| Z6 | Update meeting | | |
| Z7 | Cancel meeting | | |

### 1.5 Google Meet (Workspace sandbox)

| ID | Case | Result | Notes |
|----|------|--------|-------|
| GM1 | OAuth (shared Google connection) | | |
| GM2 | Connection / validate / health | | |
| GM3 | Create → Join URL | | |
| GM4 | Update | | |
| GM5 | Cancel | | |

### 1.6 Google Calendar

| ID | Case | Result | Notes |
|----|------|--------|-------|
| GC1 | Connect | | |
| GC2 | Outbound sync (create/update/delete) | | |
| GC3 | Conflict handling (Keep local / Keep remote) | | |
| GC4 | Manual sync | | |
| GC5 | Queue recovery after failed job | | |
| GC6 | Inbound webhook (if channel configured) | | |

### 1.7 Outlook Calendar (M365 sandbox)

| ID | Case | Result | Notes |
|----|------|--------|-------|
| OC1 | OAuth (Microsoft connection) | | |
| OC2 | Sync create/update/delete | | |
| OC3 | Subscription renewal | | |
| OC4 | Webhooks | | |
| OC5 | Conflict + manual sync | | |

### 1.8 Notifications & reminders

| ID | Case | Result | Notes |
|----|------|--------|-------|
| N1 | Meeting created (in-app + email) | | |
| N2 | Updated | | |
| N3 | Cancelled | | |
| N4 | Reminder at due time | | |
| N5 | Participant added / removed | | |
| N6 | Completed | | |
| N7 | Email HTML rendering + deep links | | |
| R1 | Preference None / 15 / 30 / 60 | | |
| R2 | Preference change affects **new** meetings only | | |
| R3 | Existing meetings keep original reminder | | |

### 1.9 Administration

| ID | Case | Result | Notes |
|----|------|--------|-------|
| AD1 | Meetings dashboard buckets | | |
| AD2 | Calendar dashboard / sync status | | |
| AD3 | Provider status | | |
| AD4 | Reminder & notification status | | |
| AD5 | Reports (today/week/month) | | |
| AD6 | Search / filters | | |
| AD7 | Bulk cancel | | |

### 1.10 Permissions (manual per role)

| Role | Access expected | Result | Notes |
|------|-----------------|--------|-------|
| Administrator / Owner | Full module + ops (`meetings.admin`, monitors, reports, providers) | | |
| Manager | Monitor/reports/providers; **no** bulk cancel without `meetings.admin` | | |
| Standard User | Own meetings/calendar per role map; no admin ops | | |
| No access | 403 / nav hidden for denied permissions | | |

### 1.11 Timezone / queues / audit

| ID | Case | Result | Notes |
|----|------|--------|-------|
| TZ1 | Tenant timezone day boundaries | | |
| TZ2 | User timezone display | | |
| TZ3 | DST transition (if applicable) | | |
| Q1 | Reminder jobs | | |
| Q2 | Notification / mail jobs | | |
| Q3 | Sync jobs + retries + failed jobs UI/Horizon | | |
| AU1 | PlatformAuditService: meeting lifecycle | | |
| AU2 | Reminder / notification / provider / sync audits | | |

---

## 2. Browser Compatibility Report

| Browser | Version | Desktop | Tablet | Mobile | Auth | Calendar | Meetings | Admin | Result |
|---------|---------|---------|--------|--------|------|----------|----------|-------|--------|
| Chrome | | | | | | | | | **Pending** |
| Edge | | | | | | | | | **Pending** |
| Firefox | | | | | | | | | **Pending** |
| Safari | | | | | | | | | **Pending** / N/A |

**Automated reference (not a substitute for this table):** Phase 11 Playwright ran Chromium against Calendar/Meetings/Ops (`npm run test:e2e:scheduling` — 5 passed). Re-run after any Phase 12 defect fix.

**Responsive spot-checks**

| Viewport | Width | Calendar | Meetings | Admin | Result |
|----------|-------|----------|----------|-------|--------|
| Desktop | ≥1280 | | | | Pending |
| Tablet | ~768 | | | | Pending |
| Mobile | ~390 | | | | Pending |

---

## 3. Provider Validation Report

Fill after live sandbox runs. Attach connection IDs / meeting IDs (no secrets).

### Zoom

| Check | Pass? | Evidence |
|-------|-------|----------|
| OAuth + connection | | |
| Validate / health | | |
| Create / update / cancel + join URL | | |

### Google Meet

| Check | Pass? | Evidence |
|-------|-------|----------|
| OAuth (Google connection) | | |
| Validate / health | | |
| Create / update / cancel + join URL | | |

### Google Calendar

| Check | Pass? | Evidence |
|-------|-------|----------|
| Connect + outbound sync | | |
| Conflict resolve | | |
| Manual sync / queue recovery | | |
| Webhook (optional) | | |

### Outlook Calendar

| Check | Pass? | Evidence |
|-------|-------|----------|
| Microsoft OAuth | | |
| Sync + webhook + subscription renewal | | |
| Conflict / manual sync | | |

**Overall provider gate:** ☐ Pass ☐ Fail ☐ Blocked (missing sandboxes)

---

## 4. Defect Log

| ID | Date | Area | Severity | Summary | Repro | Status | Owner |
|----|------|------|----------|---------|-------|--------|-------|
| — | — | — | — | *No Phase 12 defects logged yet* | — | — | — |

**Template for new rows**

1. **Repro steps** (numbered)  
2. **Expected vs actual**  
3. **Severity**  
4. **Environment / browser / provider**  
5. **Fix SHA** (if fixed)  
6. **Retest result**

---

## 5. Defect Fix Summary

### Carry-forward from Phase 11 (already fixed; re-verify in UAT)

| Item | Severity | Resolution | Verify in UAT |
|------|----------|------------|---------------|
| MySQL `schedule_items` composite index too long (utf8mb4) | High (env) | Shortened indexed string columns in migration | Fresh migrate on MySQL staging |
| Default module count stale (Calendar/Meetings not asserted) | Medium | Catalog/provisioning/auth tests expect 5 modules | New workspace has Calendar + Meetings nav |
| Meetings row actions missing `aria-label` | Low | Added `aria-label="Row actions"` | Keyboard/row menu |
| Calendar month nested `<button>` | Medium | Day cell is `role="button"` div | Month view + event chip click |

### Phase 12 fixes

*None yet — populate as defects are found and fixed under freeze rules.*

---

## 6. UAT Sign-off Checklist

| Gate | Owner | Status |
|------|-------|--------|
| Manual QA checklist complete (all critical paths P) | QA | ☐ |
| No Critical defects open | QA + Eng | ☐ |
| No High defects open | QA + Eng | ☐ |
| Medium defects reviewed (accept or fix) | Product + Eng | ☐ |
| Low defects documented | QA | ☐ |
| Browser matrix complete (Chrome + Edge minimum) | QA | ☐ |
| Provider validation (Zoom + Google Meet + ≥1 Calendar provider) | QA + Ops | ☐ |
| Notifications email rendering reviewed | QA | ☐ |
| Permissions matrix (Admin / Manager / User / none) | QA | ☐ |
| Documentation matches product (User + Admin + API) | Docs | ☐ |
| Phase 11 E2E still green after any fixes | Eng | ☐ |
| **UAT accepted for Scheduling Platform v1.0** | Product | ☐ **Unsigned** |

**Sign-off**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Engineering | | | |
| Product | | | |

---

## 7. Final Production Readiness Assessment

### Current assessment (as of package publication)

| Dimension | Status | Notes |
|-----------|--------|-------|
| Architecture freeze | **Met** | No Phase 12 feature work |
| Automated regression (Phase 11) | **Met** | Playwright scheduling + Pest provider/API suites |
| Manual QA execution | **Pending** | Checklist above must be run by humans |
| Live provider UAT | **Pending** | Requires Zoom / Google / M365 sandboxes |
| Cross-browser / responsive | **Pending** | |
| Defect gate (0 Critical / 0 High) | **Pending** | No Phase 12 log entries yet |
| UAT sign-off | **Not signed** | |
| Release Phase | **Blocked** until §6 complete | Per instruction: wait for explicit approval |

### Verdict

**CONDITIONAL — not production-released.**  
Engineering automation and Phase 11 E2E are green. **Scheduling Platform v1.0 must not enter the Release Phase until §6 UAT Sign-off is completed** with live provider validation and zero Critical/High defects.

---

## Post-v1.0 backlog (enhancements — do **not** fix in Phase 12)

Recorded so UAT does not turn enhancements into “defects”:

| ID | Item | Why not a v1.0 defect |
|----|------|------------------------|
| B1 | Dedicated Connections Center UI | Connections are API + provider-page OAuth; architecture freeze / not Phase 12 |
| B2 | In-UI “create team calendar” wizard | Team calendars may be API-capable; no create UI shipped — enhancement |
| B3 | Live OAuth in Playwright | Intentionally Pest + Manual QA |
| B4 | Additional reminder channels (SMS/WhatsApp) | Explicitly out of Phase 9–10 |
| B5 | Recurring meetings / booking pages | Explicitly deferred beyond v1.0 |

Add rows during UAT when Product rejects a request as enhancement.

---

## Related docs

- [Phase 11 E2E](/developer-guide/scheduling-phase-11-e2e)
- [Scheduling Administration](/user-guide/scheduling-administration)
- [Playwright](/developer-guide/playwright)
- [Release process](/deployment/release-process)
