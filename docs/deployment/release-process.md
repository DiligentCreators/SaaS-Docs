# Release Process

How SaleOS cuts coordinated platform releases across Backend, Frontend, and Docs.

## Principles

1. **Three-repo sync** — Backend, Frontend, and Docs ship the same platform tag when the release is platform-scoped.
2. **Docs first for intent** — official release record lives under `docs/changelog/` before tags are created.
3. **CI green before tags** — Quality Gate (+ Tests on Backend) must pass on the release SHA in each repo.
4. **No production reseeding** — upgrades are migrate-only ([Upgrade Guide](./upgrade)).
5. **Freeze rules still apply** — do not redesign Authentication, Tenancy, RBAC licensing, Billing, Marketplace, Settings, or Gateway architecture ([Platform Freeze](/getting-started/platform-freeze)).

## Tag naming (Semantic Versioning)

Use **clean** SemVer tags only:

| Pattern | Example | Use |
|---------|---------|-----|
| `vMAJOR.MINOR.PATCH` | `v1.1.0` | Coordinated platform release |

**Do not** use suffixes such as `-platform`, `-stable`, `-release`, or `-rc` on production GA tags.

Version selection:

- If the intended version has **never been tagged** in git → use that version (e.g. first tag is `v1.1.0`).
- If `vX.Y.Z` **already exists** as a tag → bump appropriately (`vX.Y.Z+1` patch or next minor).

### Current line

| Tag | Meaning |
|-----|---------|
| `v1.1.0` | First official platform release — see [v1.1.0](/changelog/v1.1.0) |

## Branch protection (repository admins)

Do not automate branch protection from CI. After Quality Gates exist on `main`, require:

| Repository | Required status checks |
|------------|------------------------|
| **SaaS-Backend** | `Quality Gate (PHP 8.4)`, `Pest (PHP 8.4)` |
| **SaaS-Frontend** | `Quality Gate (Node LTS)` |
| **SaaS-Docs** | `Quality Gate (VitePress)` |

Also recommended: require PRs, dismiss stale reviews, block force-push to `main`.

## Pre-release checklist

- [ ] Release notes page under `/changelog/vX.Y.Z`
- [ ] Delivery notes on [Changelog](/changelog/) updated
- [ ] Upgrade / runbook deltas documented
- [ ] Backend: Larastan 0, Pest green, Quality Gate green
- [ ] Frontend: lint, typecheck, unit, build green
- [ ] Docs: VitePress build green (dead links fail the build)
- [ ] Staging smoke: auth, mail test, one module path
- [ ] Package versions bumped where applicable (`package.json`)

## Cutting the release

```bash
# On each repo, on the agreed production SHA on main:
git checkout main
git pull
git tag -a v1.1.0 -m "Platform release v1.1.0"
# Only after CI is green on main:
git push origin v1.1.0
```

Then create a GitHub Release on each repo whose body links to the Docs release page.

Recommended order: **Backend → Frontend → Docs**.

## Post-release

1. Deploy Backend using [Production Runbook](./platform-production-runbook)
2. Deploy Frontend build-artifacts / Forge SPA per project norms
3. Deploy Docs build-artifacts
4. Run [Upgrade Guide](./upgrade) steps on existing environments
5. Verify `/up`, mail test, queue `emails,default`, Reverb if used

## Changelog ownership

| Source | Owner |
|--------|--------|
| VitePress `docs/changelog/` | Product / Docs — canonical narrative |
| Backend `.github/workflows/release.yml` | Optional auto-append to repo `CHANGELOG.md` on GitHub Release publish |

Every feature, fix, or ops change should update Docs in the **same PR** as code — see [Documentation Governance](/developer-guide/documentation-governance).

## What not to do

- Tag without green CI on `main`
- Tag only one repo for a platform-scoped release
- Claim a tag exists in Docs before `git push` of the tag
- Use suffix tags (`-platform`, etc.) for GA
- Run `db:seed` as part of a production upgrade
