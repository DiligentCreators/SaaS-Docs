# Frontend production build artifacts

Production CI/CD for the **SaaS-Frontend** React + Vite SPA.

- Source of truth: **`main`** (source code only — never commit `dist/`)
- Deployment branch: **`build-artifacts`** (compiled assets only)
- Workflow: `SaaS-Frontend/.github/workflows/frontend-build.yml`
- Frontend-local mirror: `SaaS-Frontend/docs/ci-cd/frontend-build-artifacts.md`

## Purpose

After every merge into `main`, GitHub Actions builds production assets, validates them, uploads a GitHub Actions artifact, and updates the `build-artifacts` branch so ops can deploy without running Node on the production host (optional) and without polluting `main`.

## Triggers

Runs **only** when:

- Code is pushed to `main` (covers PR merges into `main`)
- Manual **Run workflow** (`workflow_dispatch`) for recovery / rebuild

Does **not** run for `feature/*`, `bugfix/*`, `develop`, `release/*`, tags, or unmerged pull requests.

## Build process

1. Checkout repository (`main`)
2. Setup Node.js (latest LTS) + restore npm cache
3. Require `VITE_API_URL` repository variable
4. `npm ci`
5. Lint
6. Typecheck
7. Unit tests if a `test` script exists (`npm run test --if-present`)
8. `npx vite build`
9. Generate `build-info.json`
10. Validate `dist/`, `index.html`, Vite manifest, `build-info.json`
11. Secret scan (fail on `.env*`, PEMs, common secret patterns)
12. Upload GitHub artifact **`frontend-build`** (retention **30 days**)
13. Publish to **`build-artifacts`** (replace obsolete files; normal push, no force-push)

Failure at lint, typecheck, tests, build, validation, or publish fails the workflow. Publish failures leave the GitHub artifact intact for recovery.

Playwright E2E is **out of scope** for this job (requires a live API). See [testing/playwright.md](../testing/playwright.md).

## `build-artifacts` branch

| Property | Value |
|----------|--------|
| Contents | Deployment-ready SPA files only |
| Includes | `index.html`, hashed `assets/`, `.vite/manifest.json`, `build-info.json` |
| Excludes | `src/`, `node_modules/`, tests, docs, configs, `.env` |
| Commit message | `build(frontend): update production artifacts from <commit_sha>` |
| Creation | Automatic on first successful publish |

Suitable for Nginx, Apache, Laravel `public/build`, CDN, Wasabi, CloudFront, and Cloudflare. Vite uses default `base: '/'` (no host-specific filesystem paths).

## `build-info.json`

Written into the artifact root so deployments can identify provenance:

- commit SHA
- branch
- build timestamp (UTC)
- build number (`github.run_number`)
- GitHub Actions run ID
- application version
- Node version
- Vite version

## Repository configuration

### Actions variables (SaaS-Frontend repo)

| Variable | Required | Notes |
|----------|----------|--------|
| `VITE_API_URL` | **Yes** | Production API origin (baked in at build time) |
| `VITE_APP_NAME` | No | Default `DC SaaS` |
| `VITE_API_MODE` | No | Default `central` |
| `APP_VERSION` | No | Overrides `package.json` version in metadata |

### Permissions / branch protection

- Workflow `permissions.contents: write` so `GITHUB_TOKEN` can push `build-artifacts`.
- Protect `main` normally; this job does not push to `main`.
- Allow `github-actions[bot]` to push `build-artifacts`, or leave that branch unprotected.
- Force-push is not used.

## Security

- Never place AWS / Wasabi / Stripe / Creem / SMTP secrets in frontend CI.
- Only `VITE_*` (public, client-visible) values belong in the SPA build.
- Post-build scan rejects secret-like filenames and common secret material in text assets.

## Recovery procedure

1. Open the failed/successful Actions run → download **`frontend-build`** (30-day retention).
2. Or **Actions → Frontend production build → Run workflow** after fixing variables or code on `main`.
3. To roll forward after a bad publish: merge a fix to `main` (or re-run on the known-good commit via workflow_dispatch if that commit is still `main` HEAD / you temporary reset — prefer forward fix).

## Manual rebuild (operator)

```bash
cd SaaS-Frontend
export VITE_APP_NAME="DC SaaS"
export VITE_API_URL="https://api.example.com"
export VITE_API_MODE=central
npm ci
npm run lint
npm run typecheck
npx vite build
```

Do **not** commit `dist/` to `main`. Prefer the GitHub workflow so `build-artifacts` stays authoritative.

## Related

- [platform-production-runbook.md](platform-production-runbook.md) — SPA deploy checklist
- [object-storage.md](object-storage.md) — Wasabi / S3 for **uploads** (not SPA hosting)
