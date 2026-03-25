# [App Name] — Overview

> Last updated: YYYY-MM-DD

## What It Is

[One to three sentences. What does this app do? Who is it for?]

## Why It Exists

[What problem does it solve? Why build it instead of using something off the shelf?]

## Core Architecture

- **Frontend**: Preact + JSX, built with Vite, styled with Tailwind CSS
- **API**: Hono (Node.js) — CRUD, webhooks, scheduled jobs
- **Database**: Supabase (PostgreSQL) — schema: `[your_schema]`
- **Auth**: Supabase Auth, RLS enforced. JWT validated in Hono middleware.
- **Email**: Resend (via Hono API, never called from SPA)
- **Deploy**: Docker Compose — Caddy (static files + reverse proxy) + Hono API container

## Shared Modules

| Module | Source | Purpose |
|--------|--------|---------|
| `supabase-auth.js` | Template | Supabase client + auth helpers |
| `api.js` | Template | Fetch wrapper for Hono API calls |

## Key Integrations

| Service | Purpose | Critical Path? |
|---------|---------|----------------|
| [e.g., Resend] | [Transactional email] | [Yes/No] |
| [e.g., Frame.io] | [Media hosting] | [Yes/No] |

## Current Version

`v0.1.0` — [Brief description of what this version includes]

## Stack Decisions

| Decision | Rationale |
|----------|-----------|
| Preact over React | 3KB vs 40KB+. Same API. Swap to React if the app needs the broader ecosystem. |
| Hono over Express | Lightweight (~14KB), Web Standards API, built-in middleware, modern. |
| Vite for builds | Fast dev server, instant HMR, optimized production bundles. |
| Tailwind CSS (built) | Utility-first, tree-shaken in production, full IDE support. |
| Hash routing (not pushState) | No server config needed. Works with any static file host. SPA doesn't need SEO. |
| Supabase direct reads from SPA | RLS enforces access. Anon key + user JWT is sufficient for user-scoped reads. |
| Hono API for writes/admin ops | Service-role key stays server-side. External API calls go through Hono, never SPA. |

## Related Docs

- `PROJECT_PROTOCOL.md` — Session rules and phase gates
- `CLAUDE.md` — App-specific context for Claude Code
- `docs/decisions.md` — Lessons learned and key fixes
- `docs/roadmap.md` — Milestones and feature tracking
