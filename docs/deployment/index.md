# Deployment Guide

Production runbooks and operational checklists for hosting SaleOS.

## Go-live

| Document | Description |
|----------|-------------|
| [Production Runbook](./platform-production-runbook) | Primary deploy / go-live checklist |
| [Notification System](./notifications) | Redis, workers, Reverb, rollout checklist, troubleshooting |
| [RC1 Production Readiness](./rc1-production-readiness) | Release candidate hardening notes |
| [Go-Live Hardening](./go-live-hardening-2026-07-15) | Hardening delivery notes |

## Domain ops guides

| Document | Description |
|----------|-------------|
| [Authentication](./authentication) | Mail, reset, session, security ops |
| [Tenant RBAC](./tenant-rbac) | RBAC production checklist |
| [Central Settings](./central-settings) | System settings ops |
| [Tenant Settings](./tenant-settings) | Workspace branding & mail ops |
| [Payment Gateways](./payment-gateways) | Stripe / Creem production ops |
| [Module Development](./module-development) | Shipping modules to production |
| [Leads](./leads) | Leads module ops |
| [Tasks](./tasks) | Tasks module ops |

## Related repos

- Backend: [SaaS-Backend](https://github.com/DiligentCreators/SaaS-Backend) (Laravel API)
- Frontend: [SaaS-Frontend](https://github.com/DiligentCreators/SaaS-Frontend) (React SPA)
