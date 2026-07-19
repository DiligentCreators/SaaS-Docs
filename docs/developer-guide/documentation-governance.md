# Documentation Governance

SaleOS treats documentation as part of the product. A change is **not complete** until **code**, **tests**, and **documentation** are updated together.

Canonical site: [docs.saleos.app](https://docs.saleos.app). Source repository: **SaaS-Docs**.

---

## Same-PR rule

Every feature, bug fix, enhancement, refactor, architectural change, configuration change, deployment change, migration, permission update, API change, CI/CD update, and operational change **must** update the appropriate documentation **in the same Pull Request** as the code (or in a linked Docs PR merged in the same release window when the change spans three repos).

Do not open a follow-up “docs later” PR as the default path. If Docs must ship separately (Frontend/Backend-only repos), open the Docs PR in the **same milestone** and block release until it lands.

---

## Definition of done

| Layer | Required |
|-------|----------|
| Code | Merged implementation on the correct repo(s) |
| Tests | Pest and/or Playwright (or equivalent) covering the change |
| Documentation | Matching VitePress pages + [CHANGELOG](/changelog/) entry when user/operator/developer-visible |

Platform freeze still applies — docs must not invent parallel architecture. See [Platform Freeze](/getting-started/platform-freeze).

---

## What to update (matrix)

| Change type | Update these docs |
|-------------|-------------------|
| User-visible behavior | User Guide pages under `/user-guide/` |
| API request/response/routes | `/api/` references |
| Schema / migrations | [Database](/developer-guide/database) (+ module docs) |
| Permissions | RBAC / permissions references + module guides |
| Settings / env vars | Central/Tenant settings guides + deployment ops |
| Deploy / queue / scheduler | [Deployment](/deployment/) + [Upgrade](/deployment/upgrade) |
| CI/CD workflows | Repo README CI section + CHANGELOG if process changes |
| Architecture / module rules | `/architecture/` + developer guides |
| Releases / tags | [Release Process](/deployment/release-process) + `/changelog/vX.Y.Z-platform` |
| Roadmap status | [Product Roadmap](/getting-started/product-roadmap) |

Always add a dated note under [CHANGELOG](/changelog/) for shippable work.

---

## Three-repo coordination

| Repo | Role |
|------|------|
| **SaaS-Backend** | Implementation + Pest; link Docs paths in PR description |
| **SaaS-Frontend** | UI/E2E; keep user-facing copy aligned with Docs |
| **SaaS-Docs** | Canonical narrative, runbooks, changelog, release records |

Platform-scoped releases follow [Release Process](/deployment/release-process) (`vX.Y.Z-platform` on all three).

---

## PR checklist (authors)

- [ ] CHANGELOG delivery notes updated (or release page for platform tags)
- [ ] User Guide updated if operators/end users see a change
- [ ] Developer Guide / API / Database updated if engineers must implement or integrate
- [ ] Deployment / Upgrade / env notes updated if ops steps changed
- [ ] Roadmap status updated if a planned item shipped or was deferred
- [ ] No stale “tag exists” / test-count claims unless verified

---

## Reviewers

Reject or request changes on PRs that ship behavior without Docs when the matrix above requires an update. Prefer blocking merge over “fix docs tomorrow.”

---

## Related

- [Module Development Standard](/developer-guide/module-development)
- [Product Roadmap — Development Principles](/getting-started/product-roadmap#development-principles)
- [Release Process](/deployment/release-process)
- [Platform Freeze](/getting-started/platform-freeze)
- [CHANGELOG](/changelog/)
