# Authentication — Production Guide

## Mail configuration

Password reset and invite emails require a working mailer.

Configure via Central **Settings → Mail** (or env fallbacks):

- `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`
- From name/address (system settings override runtime config)

Send a test message from Settings before go-live.

## Password reset configuration

| Setting | Purpose |
|---------|---------|
| `FRONTEND_URL` | Absolute SPA URL used in reset/invite email links |
| `auth.passwords.users.expire` | Tenant reset token lifetime (minutes) |
| `auth.passwords.central_users.expire` | Central reset token lifetime (minutes) |

Tenant links: `{FRONTEND_URL}/reset-password/{token}?email=`  
Central links: `{FRONTEND_URL}/central/reset-password/{token}?email=`

## Password policy

Central Settings → Security:

- `password_min_length`
- `password_require_special`

Enforced by `App\Rules\PasswordRule` on registration, reset, and change-password flows. Do not duplicate validation in clients beyond UX hints.

## Authentication security

- Separate Sanctum guards: `central-api` / `tenant-api`
- Separate SPA token storage keys (central vs tenant)
- Tenant workspace resolution is hybrid: host/domain first, then token context, then an explicit Workspace value or `X-Tenant-Domain` header. This supports the shared `/login` today and future custom workspace domains without changing API paths.
- Do not persist a tenant/workspace selection in `localStorage`; the SPA resolves it from the active host or the current login/request.
- Login throttling (`auth-login`, 5/minute)
- Forgot/reset throttling (`6,1`)
- Soft-deleted and suspended users receive a generic credentials error
- Email verification is enforced for protected Central and tenant application endpoints; the SPA `VerifyEmailGate` **Sign out** action clears the session and navigates to the context login route
- CSRF: SPA uses Bearer tokens; stateful Sanctum cookie auth remains available when configured
- Registration gated by `registration_enabled`

## Session configuration

| Key | Notes |
|-----|-------|
| `SESSION_DRIVER` | Prefer `database` in production |
| `SESSION_LIFETIME` | Overridden at runtime by `session_lifetime_minutes` system setting |
| `SESSION_ENCRYPT` | Enable in production if cookies are used |
| `SESSION_DOMAIN` | Set for shared parent domain if using cookie SPA auth |

API auth for the React apps is primarily Bearer token based; remember-me stores the token in `localStorage` vs `sessionStorage`.

## Checklist

- [ ] `FRONTEND_URL` points at the production SPA
- [ ] Mail delivers reset emails to a real inbox
- [ ] Registration enabled/disabled matches business policy
- [ ] Password policy matches compliance requirements
- [ ] Rate limiters confirmed under load
- [ ] Central (`/central/login`) and tenant (`/login`, including Workspace entry) both verified
- [ ] Workspace host resolution verified for a platform subdomain and at least one custom-domain candidate
- [ ] Central and tenant email-verification gates verified
