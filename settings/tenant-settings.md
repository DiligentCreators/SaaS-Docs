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
| Workspace admins | [tenant-settings-user.md](tenant-settings-user.md) |
| Engineers | [tenant-settings-developer.md](tenant-settings-developer.md) |
| Production / ops | [tenant-settings-production.md](tenant-settings-production.md) |
| Object storage (Wasabi / S3) | [object-storage.md](../architecture/object-storage.md) |

Also see Central [settings.md](settings.md) for platform-wide defaults.

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

## Asset storage

Uploads use Laravel Storage (`FileUploadService`). Locally they live under `storage/app/public/`; in production they live on the S3-compatible bucket. Relative keys are identical in both environments:

```text
branding/logos/…          # Central
branding/favicons/…       # Central
tenants/{workspace_uuid}/
  branding/logos/…
  branding/favicons/…
```

See [architecture/object-storage.md](../architecture/object-storage.md).
