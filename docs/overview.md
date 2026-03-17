# [App Name] — Overview

> Last updated: YYYY-MM-DD

## What It Is

[One to three sentences. What does this app do? Who is it for?]

## Why It Exists

[What problem does it solve? Why build it instead of using something off the shelf?]

## Core Architecture

- **Frontend**: Preact + htm SPA, Tailwind Play CDN, served by Caddy (no build step)
- **Database**: Supabase (PostgreSQL) — schema: `[your_schema]`
- **Auth**: Supabase Auth (email + password), RLS enforced
- **Orchestration**: n8n workflows (Docker)
- **Email**: Resend (via n8n webhooks, never called from SPA)
- **Hosting**: Static files on Caddy (Docker volume mount)

## Shared Modules

This app uses the following shared R7 ecosystem modules:

| Module | Source | Purpose |
|--------|--------|---------|
| `supabase-auth.js` | `switchboard.r7c.app/lib/` | Supabase client + auth helpers |
| `nav-shell.js` | `switchboard.r7c.app/lib/` | Sidebar navigation shell |

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
| Preact + htm over vanilla JS | Components reduce line count ~50%, auto-escaping, cleaner event handling. No build step required. |
| Preact over React | 3KB vs 40KB+. Same API. No build step. CDN-loaded. |
| Tailwind Play CDN (not static build) | ~70% of UI rendered by JS at runtime. Static Tailwind build misses classes in string templates. See Switchboard postmortem 2026-02-25. |
| Hash routing (not pushState) | No server config needed. Works with any static file host. SPA doesn't need SEO. |
| Supabase direct queries (not API wrapper) | RLS enforces access. Anon key + user JWT is sufficient. Only service_role operations go through n8n. |

## Related Docs

- `PROJECT_PROTOCOL.md` — Session rules and phase gates
- `CLAUDE.md` — App-specific context for Claude Code
- `docs/decisions.md` — Lessons learned and key fixes
- `docs/roadmap.md` — Milestones and feature tracking
