# Developer Guide

Engineering documentation for extending SaleOS. New business capability ships as **modules** that mirror **Leads** and **Tasks**.

## Core standards

| Document | Description |
|----------|-------------|
| [Documentation Governance](./documentation-governance) | Same-PR docs rule — code + tests + docs |
| [Module Development](./module-development) | Module Development Standard + Definition of Done |
| [Module Development Guide](./module-development-guide) | End-to-end engineer checklist |
| [Module Architecture](/architecture/module-architecture) | Self-contained modules and ownership boundaries |
| [Module Dependencies](/architecture/module-dependencies) | Required vs optional; free vs billable dependencies |
| [Module Licensing](/architecture/module-licensing) | Independent licensing convention |
| [Entitlements](./entitlements) | Module licensing vs Spatie authorization |
| [Database](./database) | ERD / table dictionary |
| [Object Storage](./object-storage) | Wasabi / S3 uploads |
| [Frontend Build Artifacts](./frontend-build-artifacts) | CI/CD → `build-artifacts` branch |
| [Playwright](./playwright) | E2E suites (Central + Tenant) |
| [Tenant Provisioning](./tenant-provisioning) | Workspace create → default modules |
| [Notification Architecture Contract](./notification-architecture-contract) | Frozen notification payload, batching, Reverb, registry |

## Auth, RBAC & settings

| Document | Description |
|----------|-------------|
| [Authentication](./authentication) | Auth architecture, guards, reset flow |
| [Tenant RBAC](./tenant-rbac) | Implementing workspace RBAC |
| [Central Settings](./central-settings) | Settings resolution & APIs |
| [Multi-Provider Email](./multi-provider-email) | EmailManager, drivers, logs, queues, body capture, resend |
| [Email Webhooks](./email-webhooks) | Postmark/Mailgun delivery webhooks |
| [Tenant Settings](./tenant-settings) | Tenant configuration hierarchy |

## UI

| Document | Description |
|----------|-------------|
| [Shared UI](./shared-ui) | Design system and reuse strategy |
| [Shared Layout](./shared-layout) | Shell, nav, and page structure |

## Billing

| Document | Description |
|----------|-------------|
| [Billing Engine](./billing-engine) | Gateway-agnostic invoicing |
| [Payment Gateways Overview](./payment-gateways-overview) | Architecture & driver map |
| [Payment Gateways](./payment-gateways) | Implementing gateway drivers |
| [Webhooks](./payment-gateways-webhooks) | Webhook reference |
| [Stripe / Cashier](./stripe-cashier) | Cashier driver notes |
| [Creem](./creem) | Creem checkout and ops |

## Modules

| Document | Description |
|----------|-------------|
| [Leads](./leads) | Leads reference implementation |
| [Tasks](./tasks) | Tasks module engineering guide |
| [Communication Templates](./communication-templates) | Templates, placeholders, WhatsApp render |

## Platform Integrations

| Document | Description |
|----------|-------------|
| [Integration Framework](./integration-framework) | Manifests, Connections Center, OAuthManager, health, event envelope |
| [Tenant-Owned Integration Credentials](./tenant-owned-integration-credentials) | ADR-007 two-store architecture (shipped; Phase F deferred) |
| [Credentials Implementation Roadmap](./tenant-owned-credentials-implementation-roadmap) | Phases C–G exit criteria and quality gates |
| [Scheduling Platform](./scheduling-platform) | Phase 1 — Always-on ScheduleItems, availability, working hours, reminder engine foundation |
| [Zoom Meeting Provider](./zoom-meeting-provider) | Zoom adapter on primary Zoom credentials + connection |
| [Google Meet Provider](./google-meet-provider) | Meet satellite on shared Google connection (ADR-005) |
| [Google Calendar Sync](./google-calendar-sync) | Calendar Provider Framework + Google Calendar projection sync (ADR-005) |
| [Outlook Calendar Sync](./outlook-calendar-sync) | Outlook Calendar on shared Microsoft connection (ADR-005) |
| [Architecture Decision Records](/architecture/adr/) | ADR-002 / ADR-004 amendments + ADR-007 |

## Future Integrations

| Document | Description |
|----------|-------------|
| [Lead Source Driver Architecture](./lead-source-driver-architecture) | Architectural standard for all future lead ingestion (not implemented) |
| [Meta Lead Ads](./meta-lead-ads-integration) | Planned blueprint — `MetaLeadAdsDriver` (first production driver) |
| [WhatsApp Cloud Integration](./whatsapp-cloud-integration) | Planned blueprint — Cloud API messaging beyond `wa.me` (not implemented) |
