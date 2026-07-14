# Product Roadmap

Long-term direction of the platform: evolution from a CRM into a complete SaaS ERP. Modules should be implemented in the order below unless business priorities require otherwise.

> **Architecture Policy**
>
> The platform foundation (authentication, tenancy, RBAC, billing, marketplace, settings, audit logging, and module licensing) is **frozen**. New functionality must be implemented as modules using the [Module Development Standard](modules/module-development.md). Architectural changes should only be made for critical security issues, production defects, or platform-wide improvements.
>
> See [architecture/platform-freeze.md](architecture/platform-freeze.md).

---

## Phase 1 — CRM (Completed / In Progress)

The CRM is the foundation of the platform and is the first functional area delivered.

### Completed

| Module / capability | Status |
|---------------------|--------|
| [Leads](modules/leads.md) | ✅ Completed (Sprint 2 UX: Kanban, KPIs, export, convert stub, independent status/priority) |
| [Tasks](modules/tasks.md) | ✅ Completed (Sprint 2 UX: board, KPIs, waiting status, due-date permission, comments/history) |
| In-app notifications + due digests | ✅ Completed (mail + database; polling; Reverb deferred) |
| Tenant dashboard widgets | ✅ Completed (module/permission/assignee scoped; no calendar until Calendar module) |

### Planned

| Module | Status |
|--------|--------|
| Contacts | Planned (unlocks full lead convert) |
| Companies | Planned |
| Calendar | Planned (calendar dashboard widget) |
| Activities | Planned |

**Goal:** Provide a complete customer relationship management experience with lead tracking, task management, customer records, scheduling, and activity history.

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
- SMS & WhatsApp Integrations
- API & Webhooks
- AI Assistants
- Multi-Branch Management
- Multi-Currency Accounting
- POS (Point of Sale)
- E-Commerce Integrations

These modules will follow the same Module Development Standard established by Leads and Tasks.

---

## Development Principles

Every module must:

- Follow the established platform architecture ([platform freeze](architecture/platform-freeze.md))
- Respect module licensing and Marketplace activation
- Enforce RBAC permissions
- Maintain tenant isolation
- Integrate with the shared settings framework where applicable
- Generate audit and activity logs where applicable
- Include automated testing (Pest and Playwright)
- Pass manual browser QA
- Update the Developer Guide, User Guide, API documentation, database documentation, testing documentation, and [CHANGELOG](CHANGELOG.md) before being considered complete

Full checklist: [Module Development Standard](modules/module-development.md).

---

## Long-Term Vision

Evolve the platform into a modular, enterprise-grade SaaS ERP where organizations subscribe only to the modules they require. Each module integrates with the shared platform foundation while remaining independently licensable, maintainable, and scalable.

## Related

- [Platform Architecture Freeze](architecture/platform-freeze.md)
- [Module Development Standard](modules/module-development.md)
- [Entitlements](architecture/entitlements.md)
- [Leads](modules/leads.md) · [Tasks](modules/tasks.md)
