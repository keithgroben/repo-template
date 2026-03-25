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

1. **`CHANGELOG.md`** lives at repo root — single source of truth (GitHub renders it natively)
2. **Caddy bind mount** maps the root file into the changelogs volume (e.g. `CHANGELOG.md:/var/www/changelogs/my-app.md:ro`)
3. **Caddy rewrite** serves it at the app's path (e.g. `/admin/CHANGELOG.md` → `/changelogs/my-app.md`)
4. **Nav shell version label** links to `#changelog`
5. **`#changelog` route** fetches and renders `CHANGELOG.md` using the shared `changelog.js` parser

**No `public/CHANGELOG.md` copy.** The Caddy rewrite serves the root file directly via bind mount. One file, no sync issues.

This gives users three ways to read release notes: GitHub, the SPA sidebar version link, or the direct `#changelog` URL.

### Caddy Setup (LoopBack Pattern)

**1. Symlink directory** — changelogs are served via a shared symlink directory, not individual file mounts (individual file bind mounts go stale when the file inode changes on edit):

```
~/projects/www/changelogs/
├── atom-bomb.md → ~/projects/.../r7capp-atom-bomb/CHANGELOG.md
├── switchboard.md → ~/projects/.../the-switchboard/CHANGELOG.md
└── my-app.md → ~/projects/.../my-app/CHANGELOG.md
```

Create the symlink: `ln -sf /path/to/repo/CHANGELOG.md ~/projects/www/changelogs/my-app.md`

**2. Docker mounts** in `docker-compose.yml` — mount BOTH the symlink directory AND the projects root (so symlink targets resolve inside the container):

```yaml
volumes:
  - /home/rocketman7k/projects:/home/rocketman7k/projects:ro
  - /home/rocketman7k/projects/www/changelogs:/var/www/changelogs:ro
```

**3. Add rewrite + handler** in the Caddyfile (inside the `r7c.app` block, BEFORE `handle_path` blocks):

```caddy
# Changelogs — rewrite fires before handle_path
@cl_myapp path /myapp/CHANGELOG.md
rewrite @cl_myapp /changelogs/my-app.md

handle_path /changelogs/* {
    root * /var/www/changelogs
    file_server
}
```

The `rewrite` directive has higher priority than `handle_path` in Caddy's directive order, so it intercepts the request before the app's `handle_path /myapp/*` can catch it.

**4. Add `.md` to the dynamic cache matcher** so browsers don't cache stale changelogs:

```caddy
@dynamic {
    path *.html *.js *.md
}
header @dynamic Cache-Control "no-cache, must-revalidate"
```

**Why not individual file mounts?** Docker bind mounts point to inodes. When a tool replaces a file (new inode), the container keeps seeing the old content until restarted. The symlink + directory mount approach resolves the symlink at read time — edits are instantly visible, no restart needed.

### SPA Setup

**1. Add script tags** to your SPA's `<head>` (nav-shell and changelog are shared libs):

```html
<script src="https://r7c.app/lib/nav-shell.js"></script>
<script src="https://r7c.app/lib/changelog.js"></script>
```

**2. Pass `version` to `R7NavShell.init()`** — the version label becomes a clickable link to `#changelog`:

```javascript
var shell = R7NavShell.init({
    appName: 'My App',
    appSubtitle: 'ADMIN',
    version: 'v0.1.0',
    theme: 'amber',    // red | purple | violet | amber
    icon: '<path .../>',
    portalUrl: '/home.html',
    signOut: function() { /* sign out logic */ },
    navGroups: [ /* ... */ ]
});
```

**3. Add `#changelog` route** to your SPA router:

```javascript
case 'changelog': renderChangelog(); break;
```

**4. Add Changelog view** — Preact component (reference: `r7capp-atom-bomb/public/views/Changelog.js`):

```javascript
import { html, useState, useEffect } from '../lib/preact.js';

function parseChangelog(text) {
    const releases = [];
    let current = null;
    let currentSection = null;
    for (const line of text.split('\n')) {
        const releaseMatch = line.match(/^## \[(.+?)\](?: [-\u2013\u2014] (.+))?/);
        if (releaseMatch) {
            current = { version: releaseMatch[1], date: (releaseMatch[2] || '').trim(), sections: {} };
            releases.push(current);
            currentSection = null;
            continue;
        }
        const sectionMatch = line.match(/^### (.+)/);
        if (sectionMatch && current) { currentSection = sectionMatch[1].trim(); current.sections[currentSection] = []; continue; }
        const itemMatch = line.match(/^- (.+)/);
        if (itemMatch && current && currentSection) { current.sections[currentSection].push(itemMatch[1].trim()); }
    }
    return releases.filter(r => r.version !== 'Unreleased' || Object.keys(r.sections).length > 0);
}

const SECTION_COLORS = {
    'Added': 'bg-emerald-50 text-emerald-700', 'Changed': 'bg-blue-50 text-blue-700',
    'Fixed': 'bg-amber-50 text-amber-700', 'Removed': 'bg-red-50 text-red-700'
};

export default function Changelog() {
    const [releases, setReleases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('./CHANGELOG.md?v=' + Date.now())
            .then(r => r.text())
            .then(text => { setReleases(parseChangelog(text)); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return html`<div class="animate-pulse h-4 w-48 bg-gray-200 rounded"></div>`;

    return html`
        <div class="fade-up">
            <div class="mb-6">
                <h2 class="text-xl font-bold text-gray-900">Release Notes</h2>
                <p class="text-sm text-gray-500 mt-1">Version history for [App Name]</p>
            </div>
            <div class="space-y-4">
                ${releases.map((r, i) => html`
                    <div class="bg-white rounded-xl border border-gray-100 ${i === 0 ? 'shadow-sm' : ''} overflow-hidden">
                        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <span class="text-base font-bold text-gray-900">v${r.version}</span>
                                ${r.date && html`<span class="text-xs text-gray-400">${r.date}</span>`}
                            </div>
                            ${i === 0 && html`<span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700">Latest</span>`}
                        </div>
                        ${Object.entries(r.sections).length > 0 && html`
                            <div class="px-5 py-4 space-y-4">
                                ${Object.entries(r.sections).map(([section, items]) => html`
                                    <div>
                                        <span class="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${SECTION_COLORS[section] || 'bg-gray-100 text-gray-600'} mb-2">${section}</span>
                                        <ul class="space-y-1.5 ml-1">
                                            ${items.map(item => html`
                                                <li class="flex items-center gap-2 text-sm text-gray-600">
                                                    <span class="text-gray-300 text-[6px] shrink-0">${'\u25CF'}</span>
                                                    <span>${item}</span>
                                                </li>
                                            `)}
                                        </ul>
                                    </div>
                                `)}
                            </div>
                        `}
                    </div>
                `)}
            </div>
        </div>
    `;
}
```

**Key conventions:**
- `fetch('./CHANGELOG.md?v=' + Date.now())` for cache-busting
- Empty `[Unreleased]` sections filtered out
- Bullets vertically centered with `items-center` (not `items-start`)
- Section color badges: Added (emerald), Changed (blue), Fixed (amber), Removed (red)
- "Latest" badge on the first release card

**5. Create `CHANGELOG.md`** at repo root (copy the template from this repo).

**6. Create `package.json`** at repo root (if it doesn't exist):

```json
{
  "name": "app-name",
  "version": "0.1.0",
  "private": true,
  "description": "[What this app does]"
}
```
