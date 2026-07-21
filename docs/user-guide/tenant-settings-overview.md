# Tenant Application Settings

Workspace-scoped branding and configuration with automatic fallback to Central Application defaults.

```text
Tenant Setting (if configured)
  ↓
Central Application Default
  ↓
System Default (fallback)
```

## Guides

| Audience | Document |
|----------|----------|
| Workspace admins | [tenant-settings-user.md](/user-guide/tenant-settings) |
| Engineers | [tenant-settings-developer.md](/developer-guide/tenant-settings) |
| Production / ops | [tenant-settings-production.md](/deployment/tenant-settings) |
| Object storage (Wasabi / S3) | [object-storage.md](/developer-guide/object-storage) |

Also see Central [settings.md](/user-guide/central-settings-overview) for platform-wide defaults.

## What tenants can configure

| Group | Fields |
|-------|--------|
| **General** | Workspace Name, Application Name (optional override), Company Name, Timezone, Locale, Currency |
| **Branding** | Logo, Favicon, Button Color, Support Email |
| **Mail** | SMTP host/port/user/password/encryption, From name/address |

Tenants **cannot** change platform registration, maintenance mode, password policy, billing flags, or Central branding.

## Resolution examples

| Value | Resolution |
|-------|------------|
| Application title | Tenant `app_name` → Workspace Name → Central `app_name` |
| Logo | Tenant logo → Central logo → system default |
| Button color | Tenant → Central → `#111827` |
| Support email | Tenant → Central |
| SMTP | Tenant host configured? → Tenant SMTP : Central SMTP |

The SPA applies workspace branding after public settings load (and again after you sign in so the session can resolve your workspace). Until then the browser tab may show **SaleOS**; sidebar and login brand text stay blank rather than showing a placeholder product name.

## Asset storage

Uploads use Laravel Storage (`FileUploadService`). Locally they live under `storage/app/public/`; in production they live on the S3-compatible bucket. Relative keys are identical in both environments:

```text
branding/logos/…          # Central
branding/favicons/…       # Central
tenants/{workspace_uuid}/
  branding/logos/…
  branding/favicons/…
```

See [architecture/object-storage.md](/developer-guide/object-storage).
