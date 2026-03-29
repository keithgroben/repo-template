# Repo Template — Folder Structure Guide

> Updated 2026-03-25 — Preact+JSX+Vite+Tailwind + Hono API + Supabase/Postgres

```
├── PROJECT_PROTOCOL.md          ← Session rules for Claude Code (read first, always)
├── CLAUDE.md                    ← App-specific context for Claude Code (schema, APIs, conventions)
├── .env.example                 ← Template environment variables (copy to .env, fill in)
├── .gitignore                   ← node_modules, .env, dist/
├── Dockerfile                   ← Multi-stage build: Vite SPA + Hono server, runs as node user
├── docker-compose.yml           ← Single service on r7net (global Caddy handles routing)
├── package.json                 ← Dependencies + scripts (dev, build, start)
├── vite.config.js               ← Vite + Preact preset + Tailwind
├── index.html                   ← Vite HTML entry point
├── docs/
│   ├── overview.md              ← What this app is, why it exists, architecture
│   ├── decisions.md             ← Lessons learned, major fixes, rules going forward
│   ├── roadmap.md               ← Phases, features, versioning, pivots
│   ├── branching.md             ← How to work on branches and keep main safe
│   ├── versioning.md            ← How to number releases (MAJOR.MINOR.PATCH)
│   ├── secrets.md               ← Secret management, rotation procedures
│   ├── migration-checklist.md   ← Per-app migration steps
│   ├── migration-waves.md       ← Wave order, dependencies, blockers
│   └── handoffs/
│       ├── TEMPLATE.md          ← Copy this for each session handoff
│       └── 2026-03-16-notes.md  ← (example) Date-prefixed session notes
├── src/                         ← Frontend source (Preact + JSX + Tailwind)
│   ├── index.jsx                ← App entry point (mounts to #app)
│   ├── index.css                ← Tailwind base import
│   ├── components/
│   │   ├── Badge.jsx            ← Reusable UI components
│   │   ├── Toast.jsx
│   │   ├── DataTable.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── InfoCard.jsx
│   │   └── LoadingSkeleton.jsx
│   ├── views/                   ← One file per route/view
│   │   ├── Home.jsx
│   │   └── Settings.jsx
│   └── lib/
│       ├── supabase.js          ← Supabase client init + auth helpers
│       └── api.js               ← Fetch wrapper for Hono API calls
├── server/                      ← Hono API backend (Node.js)
│   ├── index.js                 ← App setup, middleware, server start
│   ├── routes/
│   │   ├── items.js             ← /api/items CRUD routes (example)
│   │   ├── webhooks.js          ← /webhook/* receivers
│   │   └── admin.js             ← /api/admin/* protected routes
│   ├── middleware/
│   │   └── auth.js              ← Supabase JWT or PIN auth
│   ├── jobs/
│   │   └── cron.js              ← node-cron scheduled jobs
│   └── lib/
│       └── supabase.js          ← Supabase client init (admin + user-scoped)
├── supabase/                    ← SQL migrations (numbered: 001_, 002_, etc.)
└── workflows/                   ← n8n workflow JSON exports (if migrating)
```

---

## Frontend Stack

| Layer | Tool | Why |
|-------|------|-----|
| Framework | Preact 10.x (3KB) | React-compatible API, tiny bundle. Swap to React if needed. |
| Markup | JSX | Standard component syntax, full IDE support |
| Build | Vite | Fast dev server, instant HMR, optimized production builds |
| Styling | Tailwind CSS | Utility-first, built by Vite plugin, tree-shaken in production |
| Data | Supabase JS v2 | Direct queries from SPA (RLS enforced) + auth |
| API calls | fetch → Hono | Service-role operations, external APIs, webhooks |

### Swapping to React

If an app needs React instead of Preact:

1. `npm install react react-dom` (remove `preact`)
2. Update `vite.config.js`: remove `@preact/preset-vite`, add `@vitejs/plugin-react`
3. Change imports: `preact/hooks` → `react`, `preact` → `react-dom/client`
4. Everything else stays the same — JSX, Tailwind, Vite, same component structure.

### API-only (mobile apps)

If the frontend is a mobile app (React Native, etc.):

1. Remove `src/`, `index.html`, `vite.config.js`, Caddy static file config
2. Keep `server/` — the Hono API is the entire backend
3. Caddy only reverse proxies `/api/*` and `/webhook/*` to Hono
4. Mobile app calls the same `/api/*` endpoints

---

## Backend Stack

| Layer | Tool | Why |
|-------|------|-----|
| API server | Hono | Lightweight (~14KB), Web Standards API, built-in middleware |
| Runtime | Node.js 20+ | `@hono/node-server` adapter |
| Database | Supabase (Postgres) | Managed Postgres, Auth, RLS, real-time |
| Cron | node-cron | Scheduled jobs, replaces external cron services |
| Email | Resend (via API) | Transactional email from Hono routes |
| Deploy | Docker Compose | Single Hono container on r7net, global Caddy routes to it |

---

## Component Convention

Components live in `src/components/` as JSX modules. Each file exports one component.

```jsx
// src/components/Badge.jsx
const COLORS = {
    Active:   { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    Inactive: { bg: 'bg-gray-100',   text: 'text-gray-500' },
};

export function Badge({ label, colorMap }) {
    const colors = colorMap || COLORS;
    const c = colors[label] || { bg: 'bg-gray-100', text: 'text-gray-600' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${c.bg} ${c.text}`}>
            {label}
        </span>
    );
}
```

---

## View Convention

Views live in `src/views/`. Each view is a component that represents one screen/route.

```jsx
// src/views/Home.jsx
import { useState, useEffect } from 'preact/hooks';
import { Badge } from '../components/Badge';
import { supabase } from '../lib/supabase';

export function HomeView() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.from('items').select('*').order('name')
            .then(({ data }) => { setItems(data || []); setLoading(false); });
    }, []);

    if (loading) return <div className="animate-pulse h-8 w-48 bg-gray-200 rounded-lg" />;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-5 mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                    <Badge label={item.status} />
                </div>
            ))}
        </div>
    );
}
```

---

## Routing

Hash-based routing in the app entry point:

```jsx
// src/index.jsx
import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { HomeView } from './views/Home';
import { SettingsView } from './views/Settings';

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
        case 'settings': return <SettingsView />;
        default:         return <HomeView />;
    }
}

render(<App />, document.getElementById('app'));
```

---

## Dev Workflow

```bash
# Terminal 1: Hono API server (backend on :3000)
npm run dev

# Terminal 2: Vite dev server (frontend on :5173, hot reload)
npm run dev:client
```

Vite's proxy config forwards `/api/*`, `/webhook/*`, and `/health` to the Hono server automatically during development. In production, Hono serves the built SPA from `dist/` and handles API routes — global Caddy routes traffic to the container.

## Production Deploy

```bash
npm run build                     # Vite builds SPA to dist/
docker compose up -d --build      # Builds image + starts container on r7net
```

- Container runs Hono on port 3000 (serves dist/ + API)
- Global Caddy routes `r7c.app/<appname>/*` to the container
- Caddy strips the path prefix — Hono receives `/`, not `/<appname>/`
- Set `VITE_BASE_PATH=/<appname>/` so asset URLs work through Caddy
- No per-app Caddyfile — TLS and routing are handled globally

## Role-Based Access

Admin and client views live in the same app, same URL. Auth determines what the user sees:

```
r7c.app/appname/ → Supabase auth checks role
  → owner/admin → sees all data, admin controls, management views
  → client      → sees only their assigned data, limited views
```

Do NOT create separate `/admin/` URL paths. Use the auth middleware's `isAdmin` flag to conditionally render views and restrict API routes.

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
| Add a new API route | `server/routes/` |
| Add a scheduled job | `server/jobs/cron.js` |
| Add a webhook receiver | `server/routes/webhooks.js` |
| Add a new reusable UI element | `src/components/` |
| Add a new page/screen | `src/views/` |
| Manage secrets | `docs/secrets.md` |
| Add a database migration | `supabase/` |
| Set up environment variables | `.env.example` → `.env` |
