# Product Roadmap

Long-term direction of the platform: evolution from a CRM into a complete SaaS ERP. Modules should be implemented in the order below unless business priorities require otherwise.

> **Architecture Policy**
>
> The platform foundation (authentication, tenancy, RBAC, billing, marketplace, settings, audit logging, and module licensing) is **frozen**. New functionality must be implemented as modules using the [Module Architecture](/architecture/module-architecture) convention and the [Module Development Standard](/developer-guide/module-development). Architectural changes should only be made for critical security issues, production defects, or platform-wide improvements.
>
> See [architecture/platform-freeze.md](/getting-started/platform-freeze).

---

## Phase 1 — CRM (Completed / In Progress)

The CRM is the foundation of the platform and is the first functional area delivered.

### Completed

| Module / capability | Status |
|---------------------|--------|
| [Leads](/user-guide/leads-overview) | ✅ Completed (Sprint 2 UX: Kanban, KPIs, export, convert stub, independent status/priority) |
| [Tasks](/user-guide/tasks-overview) | ✅ Completed (Sprint 2 UX: board, KPIs, waiting status, due-date permission, comments/history) |
| In-app notifications + Reverb | ✅ Completed (payload v1, NotificationBatch digests, Reverb/Echo, modular registry, browser toasts; poll fallback only) |
| Tenant dashboard widgets | ✅ Completed (module/permission/assignee scoped; includes Calendar upcoming when entitled) |
| [Communication Templates](/user-guide/communication-templates) | ✅ Completed (plain-text templates, placeholder registry, WhatsApp `wa.me` from Leads; migrate-only production registration) |
| [Calendar](/user-guide/calendar-overview) | ✅ Completed (Week/Day time grids + DnD, Month/Agenda, view_all oversight, upcoming widget) |

### Planned

| Module / capability | Status |
|---------------------|--------|
| Contacts | Planned (unlocks full lead convert) |
| Companies | Planned |
| **Meetings** | Planned |
| Activities | Planned |
| **Lead Source Driver Architecture** | Planned (docs only — [architectural standard](/developer-guide/lead-source-driver-architecture) for all lead ingestion) |
| **Meta Lead Ads Integration** | Planned (docs blueprint only — first driver: [Meta Lead Ads](/developer-guide/meta-lead-ads-integration)) |
| **WhatsApp Cloud Integration** | Planned (docs blueprint only — [Cloud API beyond `wa.me`](/developer-guide/whatsapp-cloud-integration)) |

#### Calendar (shipped)

- Personal events; Week (default) / Day / Month / Agenda
- Drag-and-drop reschedule on Week/Day; workspace timezone-aware UI
- Upcoming events dashboard widget
- Org-wide view via `calendar.view_all` (no calendar assignment)

#### Meetings

- Meetings
- Meeting Scheduling
- Zoom Integration
- Google Meet Integration
- Email reminders before meeting start for:
  - Meeting owner
  - All invitees

> **Dependency note (convention):** Meetings is expected to depend on Calendar. See [Module Dependencies](/architecture/module-dependencies).

**Goal:** Provide a complete customer relationship management experience with lead tracking, task management, customer records, scheduling, meetings, and activity history.

---

## Phase 2 — Sales

Once CRM is complete, extend it into a full sales workflow.

| Module | Status |
|--------|--------|
| Opportunities | Planned |
| Sales Pipeline | Planned |
| Quotations | Planned |
| Contracts | Planned |

**Goal:** Manage the entire sales lifecycle from opportunity creation through quotation, negotiation, and contract execution.

---

## Phase 3 — Billing

Build a comprehensive billing and invoicing solution that integrates with the existing Marketplace and subscription platform.

| Module | Status |
|--------|--------|
| Invoices | Planned |
| Estimates | Planned |
| Credit Notes | Planned |
| Payments | Planned |

**Goal:** Provide complete customer billing, payment tracking, and financial document management.

> **Note:** Platform billing (module subscriptions, consolidated billing, gateway abstraction) already exists under Central. Phase 3 modules are **tenant product billing** (customer-facing invoices/payments), not a redesign of the Marketplace billing engine.

---

## Phase 4 — Purchasing

Introduce purchasing and vendor management.

| Module | Status |
|--------|--------|
| Vendors | Planned |
| Purchase Orders | Planned |
| Expenses | Planned |

**Goal:** Manage supplier relationships, procurement workflows, and operational expenses.

---

## Phase 5 — Inventory

Implement inventory and warehouse management.

| Module | Status |
|--------|--------|
| Products | Planned |
| Categories | Planned |
| Warehouses | Planned |
| Stock Management | Planned |
| Stock Transfers | Planned |

**Goal:** Provide inventory control, stock tracking, warehouse operations, and product management.

---

## Phase 6 — Finance

Expand into accounting and financial reporting.

| Module | Status |
|--------|--------|
| Accounts | Planned |
| Journals | Planned |
| General Ledger | Planned |
| Financial Reports | Planned |

**Goal:** Provide the financial backbone required for a complete ERP solution.

---

## Phase 7 — Human Resources

Implement workforce management.

| Module | Status |
|--------|--------|
| Employees | Planned |
| Attendance | Planned |
| Leave Management | Planned |
| Payroll | Planned |

**Goal:** Provide employee management, attendance tracking, leave workflows, and payroll processing.

---

## Future Expansion

The platform architecture supports additional modules without requiring architectural refactoring. Candidates include:

- Assets
- Projects
- Help Desk
- Knowledge Base
- Documents
- Manufacturing
- Quality Assurance
- Recruitment
- Customer Portal
- Vendor Portal
- Business Intelligence & Analytics
- Workflow Automation
- Marketing Automation
- Email Campaigns
- SMS & WhatsApp provider integrations (Cloud API / Twilio) — templates + `wa.me` MVP already shipped; Cloud API blueprint: [WhatsApp Cloud Integration](/developer-guide/whatsapp-cloud-integration)
- API & Webhooks
- **AI Integration (Planning)** — optional integrations with Leads, Tasks, CRM, and other domain modules
- Multi-Branch Management
- Multi-Currency Accounting
- POS (Point of Sale)
- E-Commerce Integrations

### AI

| Capability | Status |
|------------|--------|
| AI Integration (Planning) | Planned |

AI is documented as a future cross-cutting capability. Integrations with Leads, Tasks, CRM, and similar modules should be **optional**. See [Module Dependencies](/architecture/module-dependencies).

These modules will follow the same [Module Architecture](/architecture/module-architecture) and [Module Development Standard](/developer-guide/module-development) established by Leads and Tasks.

---

## Multi-Provider Email Delivery

Platform-wide capability (Central + Tenant). Today outgoing mail is **SMTP-centric** (Central defaults with optional tenant SMTP override). The roadmap evolves that into a **provider-agnostic delivery architecture** so SMTP is one driver among many — not the core design.

This is a **platform infrastructure** improvement (settings, mail transport, logging, ops), not a Marketplace-licensed business module. Implementation must extend the existing settings hierarchy and runtime config overlay; it must not redesign the frozen foundation.

| Status label | Meaning |
|--------------|---------|
| **Shipped** | Implemented in the platform |
| **Future** | Follow-on reliability, observability, and provider-specific features |
| **Enterprise** | Advanced multi-provider routing and ops for large deployments |

### Email transport abstraction (Shipped)

`EmailManager` resolves an `EmailDriverInterface` implementation from the active configuration. Application code (notifications, mailables, invites, password resets, digests) continues to send through Laravel Mail — the manager applies the active provider at runtime.

| Capability | Status |
|------------|--------|
| `EmailManager` + `EmailDriverInterface` | Shipped |
| SMTP driver | Shipped |
| Postmark API driver | Shipped |
| Mailgun API driver | Shipped |
| Amazon SES driver | Future |
| Resend driver | Future |
| SendGrid driver | Future |
| Brevo driver | Future |
| SparkPost driver | Future |
| MailerSend driver | Future |

New providers must be addable by registering a driver — without scattering provider-specific logic through Controllers, Notifications, or settings UIs.

### Central email provider (Shipped)

Central administrators select the **default outgoing email provider** for the platform (and for tenants that inherit Central mail).

| Capability | Status |
|------------|--------|
| Provider selection: SMTP, Postmark API, Mailgun API | Shipped |
| Secure credential storage (encrypted secrets at rest) | Shipped |
| From identity (name / address) retained alongside provider config | Shipped |
| Additional providers via the same Central settings surface | Future |

### Tenant email provider (Shipped)

Every tenant has two configuration modes:

1. **Use Central / System Email Provider** — inherit platform delivery (default).
2. **Use Custom Email Provider** — tenant-owned white-label delivery.

When using a custom provider, the tenant may configure **SMTP**, **Postmark API**, or **Mailgun API** (same initial driver set as Central). Credentials remain tenant-scoped, encrypted, and never returned in clear text from admin APIs.

| Capability | Status |
|------------|--------|
| Inherit Central / System provider | Shipped |
| Custom tenant provider (SMTP / Postmark / Mailgun) | Shipped |
| Encrypted tenant secrets + runtime resolution | Shipped |

### Email logs (Shipped)

Comprehensive, **isolated** email logs for Central and for each Tenant.

Typical fields:

- Subject, Recipient, CC, BCC
- Provider, Driver, Message ID
- Status, Sent Timestamp, Failure Reason
- Queue Job ID
- Notification / Mailable type

Filtering:

| Filter | Scope |
|--------|--------|
| Status, Provider, Date, User | Central and Tenant |
| Tenant | Central only |

| Capability | Status |
|------------|--------|
| Central email log store + UI filters | Shipped |
| Tenant email log store + UI filters (tenant-isolated) | Shipped |

### Queue & retry (Partial / Future)

| Capability | Status |
|------------|--------|
| Queued email delivery (`emails` queue + runtime re-apply) | Shipped |
| Retry policies + exponential backoff (`email.queue.*`) | Shipped (basic) |
| Dead-letter handling | Future |
| Manual resend from logs | Shipped |
| Priority queues | Future |

### Provider capabilities (Future)

Optional **driver capabilities** — not required of every provider. Drivers advertise what they support; the platform enables features only when the active driver implements them.

| Capability | Status |
|------------|--------|
| Delivery events | Shipped (webhook-driven) |
| Bounce detection | Shipped (webhook-driven) |
| Spam complaints | Shipped (webhook-driven) |
| Open tracking | Shipped (selectable webhook event) |
| Click tracking | Shipped (selectable webhook event) |
| Webhook processing | Shipped |
| Suppression lists | Future |

### Email analytics (Future)

Dashboards for Central and Tenant (each scoped to its own mail traffic):

- Total Sent, Failed, Delivery Rate, Bounce Rate
- Queue Size, Provider Usage
- Daily Volume, Monthly Volume

| Capability | Status |
|------------|--------|
| Central email analytics dashboard | Future |
| Tenant email analytics dashboard | Future |

### Test email (Shipped)

**Send Test Email** validates provider configuration before (or immediately after) saving credentials. Report:

- Authentication failures
- SMTP / API connectivity
- DNS / configuration issues (where applicable)
- Success / failure response
- Response time

| Capability | Status |
|------------|--------|
| Send Test Email for Central provider config | Shipped |
| Send Test Email for Tenant custom / system provider config | Shipped |

### Enterprise enhancements (Enterprise)

| Capability | Status |
|------------|--------|
| Multiple providers per tenant | Enterprise |
| Automatic provider failover | Enterprise |
| Provider priority | Enterprise |
| Cost-aware routing | Enterprise |
| Regional routing | Enterprise |
| Per-notification provider selection | Enterprise |
| Per-domain provider selection | Enterprise |
| Rate limiting | Enterprise |
| Provider health monitoring | Enterprise |

**Goal:** Production-grade, extensible email delivery for Central and Tenant applications — provider-agnostic at the core, with SMTP as one interchangeable driver, white-label tenant providers, durable logs, and a clear path to reliability, analytics, and enterprise routing without redesigning the platform.

---

## Development Principles

Every module must:

- Follow the established [Module Architecture](/architecture/module-architecture) and [platform freeze](/getting-started/platform-freeze)
- Be self-contained, own its resources, and declare [dependencies](/architecture/module-dependencies) when required
- Remain compatible with independent [module licensing](/architecture/module-licensing) and Marketplace activation
- Enforce RBAC permissions
- Maintain tenant isolation
- Integrate with the shared settings framework where applicable
- Generate audit and activity logs where applicable
- Include automated testing (Pest and Playwright)
- Pass manual browser QA
- Update the Developer Guide, User Guide, API documentation, database documentation, testing documentation, and [CHANGELOG](/changelog/) before being considered complete — see [Documentation Governance](/developer-guide/documentation-governance) (same-PR rule)

Full checklist: [Module Development Standard](/developer-guide/module-development).

---

## Long-Term Vision

Evolve the platform into a modular, enterprise-grade SaaS ERP where organizations subscribe only to the modules they require. Each module integrates with the shared platform foundation while remaining independently licensable, maintainable, and scalable.

## Related

- [Architecture](/architecture/)
- [Module Architecture](/architecture/module-architecture)
- [Module Dependencies](/architecture/module-dependencies)
- [Module Licensing](/architecture/module-licensing)
- [Platform Architecture Freeze](/getting-started/platform-freeze)
- [Module Development Standard](/developer-guide/module-development)
- [Entitlements](/developer-guide/entitlements)
- [Leads](/user-guide/leads-overview) · [Tasks](/user-guide/tasks-overview)
