# Frontend production build artifacts

Production CI/CD for the **SaaS-Frontend** React + Vite SPA.

- Source of truth: **`main`** (source code only — never commit `dist/`)
- Deployment branch: **`build-artifacts`** (compiled assets only)
- Workflow: `SaaS-Frontend/.github/workflows/frontend-build.yml`
- Frontend-local mirror: `SaaS-Frontend/docs/ci-cd/frontend-build-artifacts.md`

## Purpose

After every merge into `main`, GitHub Actions builds production assets, validates them, uploads a GitHub Actions artifact, and updates the `build-artifacts` branch.

The same artifact is **multi-client ready**: each Laravel Forge site generates `/config.js` (`window.env`) from that site’s `.env` during deploy. No API URL is baked into CI.

## Triggers

- Push to `main` or manual `workflow_dispatch`
- Does **not** run for feature branches, tags, or unmerged PRs

## Build process

1. Checkout `main`
2. Node LTS + `npm ci`
3. Lint / typecheck / optional unit tests
4. `npx vite build` (without `VITE_API_URL`)
5. `build-info.json`
6. Validate (including `index.html` loads `/config.js`)
7. Secret scan
8. Upload artifact `frontend-build` (30 days)
9. Publish to `build-artifacts`

## Runtime configuration (Laravel Forge)

`index.html` loads `/config.js` before the React app. Forge deploy script (adapted from the platform’s existing pattern):

```bash
$CREATE_RELEASE()
cd $FORGE_RELEASE_DIRECTORY

if [ -f ../../.env ]; then
  set -a
  source ../../.env
  set +a
fi

echo "window.env = {" > "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_API_URL: \"$VITE_API_URL\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_APP_NAME: \"${VITE_APP_NAME:-DC SaaS}\"," >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "  VITE_API_MODE: \"${VITE_API_MODE:-central}\"" >> "$FORGE_RELEASE_DIRECTORY/config.js"
echo "};" >> "$FORGE_RELEASE_DIRECTORY/config.js"

$ACTIVATE_RELEASE()
```

| Site `.env` key | Used as |
|-----------------|---------|
| `VITE_API_URL` | API origin (required in production) |
| `VITE_APP_NAME` | Display name (optional; `VITE_CLIENT_NAME` also accepted) |
| `VITE_API_MODE` | `central` (default) or `tenant` |

Local Vite uses `.env` / `import.meta.env` when `window.env` is absent.

## `build-artifacts` branch

| Property | Value |
|----------|--------|
| Includes | `index.html`, hashed `assets/`, `.vite/manifest.json`, `build-info.json` |
| Excludes | `src/`, `config.js` (host-generated), `.env`, tooling |

## Actions variables

| Variable | Required | Notes |
|----------|----------|--------|
| `VITE_APP_NAME` | No | Build-time fallback only |
| `VITE_API_MODE` | No | Default `central` |
| `APP_VERSION` | No | Metadata override |

`VITE_API_URL` is **not** required in GitHub Actions.

## Security

- No cloud/payment secrets in frontend CI
- SPA API URL is public; keep it on Forge `.env` per site

## Related

- [platform-production-runbook.md](platform-production-runbook.md)
- [object-storage.md](object-storage.md)
