# Branching Strategy

> Persistent dev branch + worktree pattern. Main stays clean. Dev is always available.

---

## Branch Types

| Branch | Purpose | Lifetime |
|--------|---------|----------|
| `main` | Production-ready code. Always works. | Permanent |
| `dev/<shortname>` | Active development for this app. Never deleted. | Permanent |
| `feature/<name>` | New feature (branches from dev, merges to dev) | Short-lived |
| `fix/<name>` | Bug fix (branches from dev, merges to dev) | Short-lived |

---

## The Dev Branch Pattern

Every app with a web UI gets a long-lived `dev/<shortname>` branch:

1. **Branch**: `dev/<shortname>` — never deleted, always available
2. **Worktree**: `~/projects/keithgroben/<repo>-dev` (or `~/projects/Wayfinder-Digital/<repo>-dev`)
3. **Dev URL**: `dev<shortname>.r7c.app` — Caddy serves from the worktree directory
4. **Production URL**: `<app>.r7c.app` — Caddy serves from the main worktree

### App-to-Shortname Mapping

| App | Repo | Branch | Worktree | Dev URL |
|-----|------|--------|----------|---------|
| The Switchboard | the-switchboard | `dev/switchboard` | `the-switchboard-dev` | `devswitch.r7c.app` |
| Atom Bomb | atom-bomb | `dev/atom` | `atom-bomb-dev` | `devatom.r7c.app` |
| CB Forms | cb-forms | `dev/forms` | `cb-forms-dev` | `devforms.r7c.app` |
| RobCo Atomizer | robco-atomizer | `dev/atomizer` | `robco-atomizer-dev` | `devatomizer.r7c.app` |
| Intake | intake | `dev/intake` | `intake-dev` | `devin.r7c.app` |
| Porkchop Express | the-porkchop-express | `dev/porkchop` | `the-porkchop-express-dev` | `devpce.r7c.app` |

### Apps That Skip Worktree/Caddy

- **CLI tools** (Nintendo Power) — no web UI, no dev URL needed
- **Externally hosted apps** — dev preview depends on hosting provider (Netlify, etc.)
- **Wayfinder-Digital apps** — follow the same versioning/changelog conventions but dev preview setup depends on their hosting

---

## Workflow

### Daily Development

```
1. cd ~/projects/keithgroben/<repo>-dev     # worktree on dev/<shortname>
2. git pull                                  # sync with remote
3. ... do the work ...
4. git add <files> && git commit -m "..."
5. git push
6. Test at dev<shortname>.r7c.app
```

### Release (dev → main → tag)

```
1. Verify changes tested on dev URL
2. Update CHANGELOG.md at repo root
3. Bump version in package.json
4. Bump version in R7NavShell.init() call (SPA apps only)
5. Commit on dev
6. git checkout main && git merge dev/<shortname>
7. git tag v1.x.0 && git push && git push --tags
8. Create GitHub Release (notes from CHANGELOG)
9. git checkout dev/<shortname> && git merge main  # sync dev
```

### Feature/Fix Branches (optional, for larger work)

```
1. cd ~/projects/keithgroben/<repo>-dev
2. git checkout -b feature/my-feature       # branch from dev
3. ... do the work ...
4. git checkout dev/<shortname>
5. git merge feature/my-feature
6. git branch -d feature/my-feature         # delete after merge
```

---

## Setting Up a New Dev Worktree

```bash
cd ~/projects/keithgroben/<repo>
git checkout -b dev/<shortname>
git push -u origin dev/<shortname>
git worktree add ~/projects/keithgroben/<repo>-dev dev/<shortname>
```

Then add a Caddy block for `dev<shortname>.r7c.app` pointing to the worktree's `public/` directory.

---

## Rules

1. **Never commit directly to main.** Always work on dev or a feature/fix branch.
2. **The dev branch is never deleted.** It's a permanent parallel to main.
3. **Branch names are lowercase, hyphenated.** Example: `feature/admin-dashboard`, `fix/auth-redirect-loop`.
4. **Test before merging to main.** If it breaks on dev, it'll break on main.
5. **Delete feature/fix branches after merging to dev.** Keep the repo clean.
6. **After merging to main, sync dev.** `git checkout dev/<shortname> && git merge main` — keeps dev up to date.

---

## When Things Go Wrong

- **Accidentally committed to main?** `git reset --soft HEAD~1` to undo the commit but keep changes, then switch to dev.
- **Dev is behind main?** `git checkout dev/<shortname> && git merge main` — resolve conflicts, then continue.
- **Need to abandon a feature branch?** `git checkout dev/<shortname> && git branch -D bad-branch` — the `-D` force-deletes it.
