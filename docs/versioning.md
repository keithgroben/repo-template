# Versioning

> How we number releases so everyone knows what changed and how much.

---

## Format

`MAJOR.MINOR.PATCH` — example: `v1.3.2`

---

## When to Bump

| Change type | Bump | Example |
|-------------|------|---------|
| Bug fix, typo, small tweak | **PATCH** | `v1.3.1` → `v1.3.2` |
| New feature, new view, new integration | **MINOR** | `v1.3.2` → `v1.4.0` |
| Breaking change, major rewrite, architecture shift | **MAJOR** | `v1.4.0` → `v2.0.0` |

---

## Rules

1. **Start at `v0.1.0`** for new projects. The `0.x` range means "not yet stable."
2. **Bump in `package.json`** (or a `VERSION` file if there's no package.json).
3. **Tag the commit** when bumping: `git tag v1.3.2 && git push --tags`
4. **Reset MINOR and PATCH** when the higher number bumps. `v1.4.3` → MAJOR bump → `v2.0.0` (not `v2.4.3`).
5. **Don't overthink it.** If you're debating MINOR vs PATCH, it's probably PATCH.

---

## Dev Version Suffix

The dev branch always shows the **next** version with a `-dev` suffix:

- Main ships `v1.1.0` → dev immediately bumps to `v1.2.0-dev`
- At release time: drop `-dev`, merge to main, tag `v1.2.0`
- After release: dev bumps to `v1.3.0-dev`

Update both `package.json` and `R7NavShell.init({ version })` on dev after every release.

---

## Pre-1.0

While in `v0.x`, anything can change. MINOR bumps can include breaking changes. Once we tag `v1.0.0`, the contract above applies strictly.

---

## v2 Criteria

A MAJOR bump (`v1.x → v2.0.0`) happens when one of these occurs:

- **Preact migration** — ES5 vanilla JS → modern Preact + htm components
- **Auth model change** — switching auth providers or fundamentally changing how users authenticate
- **Schema redesign** — breaking changes to database tables that require migration of existing data
- **Breaking user-facing workflow** — users must relearn how to use a core feature

Features = MINOR. Bugs = PATCH. If you're unsure, it's MINOR.

---

## Release Checklist

Every version bump follows these steps:

1. **Verify changes tested on dev** — All changes tested at `dev<shortname>.r7c.app`
2. **Update CHANGELOG.md** — Add a new version section at the top (see format below)
3. **Bump version in `package.json`** — Update the `"version"` field
4. **Bump version in `R7NavShell.init()`** — SPA apps only: update the `version:` string in the nav shell config
5. **Commit on dev, merge to main** — `git checkout main && git merge dev/<shortname>`
6. **Tag and push** — `git tag v1.x.0 && git push && git push --tags`
7. **Sync dev branch** — `git checkout dev/<shortname> && git merge main`
8. **Create GitHub Release** — Title: `v1.x.0`, body: copy from CHANGELOG.md
9. **Verify production** — Check production URL, sidebar version, changelog view

---

## CHANGELOG.md Format

We follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/):

```markdown
# Changelog

## [Unreleased]

## [1.1.0] - 2026-03-17
### Added
- New feature description

### Changed
- What was modified

### Fixed
- What was broken and is now working

### Removed
- What was taken out
```

**Rules:**
- Newest version at the top
- `[Unreleased]` section for work in progress
- Date format: `YYYY-MM-DD`
- Group changes under: **Added**, **Changed**, **Fixed**, **Removed**
- Write for humans — describe the user-facing impact, not the code change

---

## In-App Changelog Convention

Every SPA app with a nav shell can display its changelog in-app:

1. **`CHANGELOG.md`** lives at repo root (GitHub renders it natively)
2. **`public/CHANGELOG.md`** is a copy of the root file (Caddy won't follow symlinks outside the served directory). Copy it at release time: `cp CHANGELOG.md public/CHANGELOG.md`
3. **Nav shell version label** links to `#changelog`
4. **`#changelog` route** fetches and renders CHANGELOG.md using the shared `changelog.js` parser

This gives users three ways to read release notes: GitHub, the SPA sidebar version link, or the direct `#changelog` URL.
