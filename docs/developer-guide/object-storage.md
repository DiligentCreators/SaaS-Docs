# Object Storage (Wasabi / S3-Compatible)

Production file uploads use Laravel’s filesystem abstraction with an S3-compatible backend (Wasabi by default). Local development continues to use the `public` disk. Switching backends requires **environment variables only** — no code changes.

## Architecture

| Concern | Behavior |
|---------|----------|
| Default disk | `FILESYSTEM_DISK` (`public` locally, `s3` in production) |
| Upload entrypoint | `App\Services\Storage\FileUploadService` |
| DB values | Relative object keys only (e.g. `branding/logos/….png`) |
| Public URLs | Always via `FileUploadService::url()` / `Storage::disk(…).url()` |
| Private downloads | Prefer `temporaryUrl()` when the driver supports it |
| Tenant isolation | Key prefixes `tenants/{tenant_uuid}/…` on a shared disk |

Stancl’s `FilesystemTenancyBootstrapper` remaps only the private `local` disk. Uploads stay on the shared `public` / `s3` disk so object keys match across environments and after `storage:migrate-to-s3`.

## Object key layout

```text
branding/logos/
branding/favicons/
tenants/{tenant_uuid}/branding/logos/
tenants/{tenant_uuid}/branding/favicons/
tenants/{tenant_uuid}/leads/          # future modules
tenants/{tenant_uuid}/tasks/
tenants/{tenant_uuid}/attachments/
central/logos/
central/branding/
central/users/
exports/
imports/
temp/
```

Legacy `tenant-logos/` keys may still exist on disk until rewritten; new admin uploads use `tenants/{uuid}/branding/logos/`.

## Local development

```env
FILESYSTEM_DISK=public
```

```bash
php artisan storage:link
```

URLs resolve as `{APP_URL}/storage/{key}`.

Optional override (defaults to `FILESYSTEM_DISK`):

```env
FILESYSTEM_UPLOADS_DISK=public
```

## Production (Wasabi)

```env
FILESYSTEM_DISK=s3

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket
AWS_ENDPOINT=https://s3.us-east-1.wasabisys.com
AWS_URL=https://s3.us-east-1.wasabisys.com/your-bucket
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Never hardcode Wasabi hostnames in application code. Set `AWS_ENDPOINT` / `AWS_URL` per region and bucket.

The same `s3` disk works with AWS S3, Cloudflare R2, MinIO, and DigitalOcean Spaces — change endpoint/URL/credentials only.

### Bucket recommendations

| Topic | Guidance |
|-------|----------|
| Visibility | Public-read for branding assets (logos/favicons). Keep private modules/exports private and serve via temporary URLs. |
| Bucket policy | Allow `s3:GetObject` for public branding prefixes if objects are public; never grant public `PutObject` / `DeleteObject`. |
| CORS | Allow SPA origins (`FRONTEND_URL` + admin hosts) for `GET` (and `PUT` only if you later introduce direct browser uploads). |
| Credentials | IAM / Wasabi keys with least privilege on this bucket only; never expose in the SPA. |
| Versioning | Optional on the bucket for recoverability of branding assets. |

### `storage:link`

Not required in production when `FILESYSTEM_DISK=s3`. Keep the symlink for local/`public` disk usage only.

## Migrating existing local files

After pointing production at S3, copy existing `storage/app/public` objects:

```bash
# Preview
php artisan storage:migrate-to-s3 --dry-run

# Copy (idempotent — skips keys that already exist)
php artisan storage:migrate-to-s3

# Force re-upload
php artisan storage:migrate-to-s3 --force
```

Options: `--source=public` (default), `--destination=s3` (default).

Database paths are already relative keys and do **not** need rewriting when directory structure is preserved.

## Application usage

```php
use App\Services\Storage\FileUploadService;

$path = $uploads->store($file, FileUploadService::tenantBrandingDirectory($tenantId, 'logos'));
$url = $uploads->url($path);
$uploads->delete($path);
```

Controllers must not call `store()` / `Storage::disk('public')` directly for user uploads.

## Security

- Branding validation rejects SVG and non-image MIME types (`UploadBrandingAssetRequest` / tenant equivalent).
- Filenames are generated (`uuid_timestamp.ext`); client filenames are never trusted as object keys.
- Paths with `..` or absolute URLs are never deleted through `FileUploadService::delete()`.

## Deploy checklist

1. Create Wasabi (or other) bucket + access key.
2. Set `FILESYSTEM_DISK=s3` and `AWS_*` on the app server / secrets store.
3. Deploy code with `league/flysystem-aws-s3-v3`.
4. Run `php artisan storage:migrate-to-s3` once (or `--dry-run` first).
5. Smoke-test Central + tenant logo/favicon upload, replace, delete, and public bootstrap URLs.
6. Confirm SPA `img` tags receive absolute URLs from the API (no hardcoded `/storage` paths).

## Related

- `settings/settings-production.md`
- `settings/tenant-settings-production.md`
- `architecture/platform-production-runbook.md`
