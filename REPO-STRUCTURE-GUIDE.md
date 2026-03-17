# Repo Template — Folder Structure Guide

> Updated 2026-03-16 — Now includes the R7 standard frontend stack (Preact + htm + Tailwind CDN)

```
├── PROJECT_PROTOCOL.md          ← Session rules for Claude Code (read first, always)
├── CLAUDE.md                    ← App-specific context for Claude Code (schema, APIs, conventions)
├── docs/
│   ├── overview.md              ← What this app is, why it exists, architecture
│   ├── decisions.md             ← Lessons learned, major fixes, rules going forward
│   ├── roadmap.md               ← Phases, features, versioning, pivots
│   ├── branching.md             ← How to work on branches and keep main safe
│   ├── versioning.md            ← How to number releases (MAJOR.MINOR.PATCH)
│   └── handoffs/
│       ├── TEMPLATE.md          ← Copy this for each session handoff
│       └── 2026-03-16-notes.md  ← (example) Date-prefixed session notes
├── public/                      ← Static files served by Caddy (deployed as-is, no build step)
│   ├── index.html               ← App entry point (SPA shell + Preact mount)
│   ├── config/
│   │   └── urls.js              ← Environment URLs (webhook, portal, API endpoints)
│   ├── components/
│   │   ├── Badge.js             ← Reusable UI components (Preact + htm)
│   │   ├── Toast.js
│   │   ├── DataTable.js
│   │   ├── ConfirmDialog.js
│   │   ├── InfoCard.js
│   │   └── LoadingSkeleton.js
│   ├── views/                   ← One file per route/view
│   │   ├── Home.js
│   │   └── Settings.js
│   ├── lib/
│   │   ├── preact.js            ← Preact/htm/hooks re-export shim (clean imports)
│   │   ├── supabase-auth.js     ← Shared Supabase client + auth helpers (from ecosystem)
│   │   ├── nav-shell.js         ← Shared sidebar nav (from ecosystem)
│   │   └── store.js             ← Simple state management (signals or useState patterns)
│   └── app.js                   ← Root component, router, app shell
├── workflows/                   ← n8n workflow JSON exports (if this app has any)
├── supabase/                    ← SQL migrations (numbered: 001_, 002_, etc.)
├── package.json                 ← Version number only (no build step, no node_modules)
└── README.md                    ← Standard project readme
```

---

## What Changed from the Base Template

The `src/` folder is now `public/` — because there is no build step. Caddy serves this folder directly. What's in the working tree is what's live.

The frontend stack is standardized:

| Layer | Tool | Loaded via | Why |
|-------|------|-----------|-----|
| Components | Preact 10.x (3KB) | CDN `<script>` tag | React-compatible API, no build step |
| Templates | htm | CDN `<script>` tag | JSX-like syntax in the browser, no compiler |
| Styling | Tailwind Play CDN | CDN `<script>` tag | JIT in browser — required for JS-rendered HTML |
| Data | Supabase JS v2 | CDN `<script>` tag | Direct queries from SPA, RLS enforced |
| Auth | Supabase Auth | Via supabase-auth.js | Shared across all R7 apps |
| Nav | R7NavShell | Via nav-shell.js | Sidebar navigation shell, theme-able per app |
| Email | Resend (via n8n) | Webhook | Never called from SPA directly |

**No webpack. No Vite. No node_modules. No build folder.** Caddy serves static files. Period.

---

## The Component Convention

Components live in `public/components/` as ES modules. Each file exports one Preact component using htm tagged templates.

```javascript
// public/components/Badge.js
import { html } from '../lib/preact.js';

const COLORS = {
    'Active':  { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    'Inactive': { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export function Badge({ label, colorMap }) {
    const colors = (colorMap || COLORS);
    const c = colors[label] || { bg: 'bg-gray-100', text: 'text-gray-600' };
    return html`
        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${c.bg} ${c.text}">
            ${label}
        </span>
    `;
}
```

Components are imported by views. Views are imported by app.js. App.js mounts to the DOM.

---

## The View Convention

Views live in `public/views/`. Each view is a Preact component that represents one screen/route.

```javascript
// public/views/Home.js
import { html, useState, useEffect } from '../lib/preact.js';
import { Badge } from '../components/Badge.js';

export function HomeView() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        sb.from('my_table').select('*').order('name')
            .then(res => { setItems(res.data || []); setLoading(false); });
    }, []);

    if (loading) return html`<div class="skeleton h-8 w-48 bg-gray-200 rounded-lg"></div>`;

    return html`
        <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            ${items.map(item => html`
                <div class="bg-white rounded-xl border border-gray-100 p-5 mb-3">
                    <h3 class="text-sm font-semibold text-gray-900">${item.name}</h3>
                    <${Badge} label=${item.status} />
                </div>
            `)}
        </div>
    `;
}
```

---

## The Preact Module Shim

To avoid import map complexity, use a single shim file that re-exports everything views and components need:

```javascript
// public/lib/preact.js
// Loaded after CDN scripts. Re-exports for clean imports.
const { h, render, Component } = window.preact;
const { useState, useEffect, useRef, useCallback, useMemo } = window.preactHooks;
const { html } = window.htmPreact;

export { h, render, Component, useState, useEffect, useRef, useCallback, useMemo, html };
```

This means every component just writes `import { html, useState } from '../lib/preact.js'` — clean, consistent, no CDN URLs scattered through your code.

---

## Routing

Hash-based routing, same as The Switchboard. The app.js file handles it:

```javascript
// public/app.js
import { html, render, useState, useEffect } from './lib/preact.js';
import { HomeView } from './views/Home.js';
import { SettingsView } from './views/Settings.js';

function App() {
    const [route, setRoute] = useState(location.hash.slice(1) || 'home');

    useEffect(() => {
        const handler = () => setRoute(location.hash.slice(1) || 'home');
        window.addEventListener('hashchange', handler);
        return () => window.removeEventListener('hashchange', handler);
    }, []);

    const [view, param] = route.includes('/')
        ? [route.split('/')[0], route.split('/')[1]]
        : [route, null];

    switch (view) {
        case 'settings': return html`<${SettingsView} />`;
        default:         return html`<${HomeView} />`;
    }
}

render(html`<${App} />`, document.getElementById('app'));
```

---

## Infrastructure Notes (What Doesn't Change)

Preact is a frontend-only decision. The following are **unaffected**:

| Layer | What stays the same |
|-------|-------------------|
| **Caddy** | Serves `public/` as static files. No new routes, no proxy rules, no config changes. Authelia forward auth unchanged. |
| **Docker** | Volume mounts point to `public/` directory. No new containers. No build step in the compose file. |
| **n8n** | Webhooks called via `fetch()` from the browser. n8n doesn't know or care what rendered the button. Workflow JSON files unchanged. |
| **Supabase** | JS client initialized the same way. `sb.from()`, `sb.schema()`, RLS, auth tokens — all identical. Schema and migrations unchanged. |
| **Ubuntu server** | Serves static files. Preact is 3KB delivered to the browser. Zero additional server load. |
| **ES modules** | Browser loads `.js` files as ES modules natively. Caddy serves them as static files — no special headers or config needed. Same-origin, so no CORS issues. |

**The one convention change:** New apps use modern JavaScript (`const`, `let`, arrow functions, `async/await`). Existing ES5 apps (`var`, `.then()`) stay as-is until migrated view-by-view. Don't mix conventions within a single file.

---

## Quick Reference

| I need to... | Go to... |
|--------------|----------|
| Start a Claude Code session | `PROJECT_PROTOCOL.md` |
| Understand what this app does | `docs/overview.md` |
| Understand the app-specific schema, APIs, conventions | `CLAUDE.md` |
| Check if we've solved this problem before | `docs/decisions.md` |
| See what's planned or track progress | `docs/roadmap.md` |
| Remember how to use branches | `docs/branching.md` |
| Know which version number to bump | `docs/versioning.md` |
| Pick up where I left off | Latest file in `docs/handoffs/` |
| Add a new reusable UI element | `public/components/` |
| Add a new page/screen | `public/views/` |
| Change environment URLs | `public/config/urls.js` |
| Add an n8n workflow | `workflows/` |
| Add a database migration | `supabase/` |
