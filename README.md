# repo-template

Opinionated full-stack app template for building internal tools and web apps with a consistent stack and an AI-assisted development workflow.

## What's included

**Stack**

| Layer | Tool |
|-------|------|
| Frontend | Preact + JSX + Vite + Tailwind CSS |
| API | Hono (Node.js) |
| Database | Supabase (Postgres + Auth + RLS) |
| Deploy | Docker + Caddy |

**AI workflow** — a Haiku → Sonnet → Human review pipeline built around Claude Code, with structured handoff docs, roadmap templates, and spec-writing guidelines that let a smaller model implement entire features from a well-written spec.

**Template sync** — a GitHub Action that propagates shared protocol files (`PROJECT_PROTOCOL.md`, `docs/branching.md`, etc.) to downstream repos via automated PRs.

## How to use this

1. **Clone or fork** this repo to start a new app
2. **Fill in** `CLAUDE.md` — app name, DB schema, API routes, known gotchas
3. **Fill in** `docs/overview.md` — what the app does and why
4. **Rename** `README-TEMPLATE.md` → `README.md` (replace this file)
5. **Update** `.github/sync-config.json` with your downstream repos
6. **Set** `REPO_SYNC_TOKEN` in GitHub Actions secrets (PAT with repo write access)

## Files

| File | Purpose | Syncs to apps? |
|------|---------|----------------|
| `PROJECT_PROTOCOL.md` | Claude Code session rules and phase gates | Yes |
| `CLAUDE.md` | App-specific context — fill in per project | No |
| `README-TEMPLATE.md` | README starter for app repos | No |
| `docs/overview.md` | App architecture and stack decisions | No |
| `docs/ai-collaboration.md` | Multi-model AI pipeline (Haiku → Sonnet → Opus) | No |
| `docs/architecture-patterns.md` | Hono + SPA coding patterns | Yes |
| `docs/branching.md` | Git workflow | Yes |
| `docs/versioning.md` | Semantic versioning rules + changelog format | Yes |
| `docs/roadmap.md` | Feature tracking template | No |
| `docs/spec-writing-guide.md` | How to write Haiku-ready feature specs | No |
| `docs/secrets.md` | Secret management and rotation procedures | Yes |
| `docs/migration-waves.md` | n8n → Hono migration planning template | No |
| `AI_HANDOFF.md` | Live cross-session state file for AI models | No |
| `.env.example` | Environment variable template | No |
| `.github/sync-config.json` | Sync targets — update with your repos | No |

## AI workflow overview

```
Cursor + Sonnet  →  write feature spec (roadmap entry)
       ↓
  Claude Haiku   →  implement entire feature in one session
       ↓
 Claude Sonnet   →  review, patch, iterate with human (max 5 passes)
       ↓
     Human       →  verify in browser
       ↓
     Done        →  Haiku picks up next feature
```

See `docs/ai-collaboration.md` for the full pipeline and escalation rules.

## Stack decisions

| Decision | Rationale |
|----------|-----------|
| Preact over React | 3KB vs 40KB+. Same JSX API. Swap to React if the app needs the broader ecosystem. |
| Hono over Express | Lightweight, Web Standards API, built-in middleware. |
| Vite | Fast dev server, instant HMR, optimized production builds. |
| Hash routing | No server config needed for SPAs. |
| Supabase direct reads | RLS enforces access. Anon key + JWT is sufficient for user-scoped reads. |
| Hono for writes/admin | Service-role key stays server-side. External API calls never go through the SPA. |
