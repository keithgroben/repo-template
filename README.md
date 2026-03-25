# [App Name]

> [One-line description]

## Stack

**Frontend**: Preact + JSX · Vite · Tailwind CSS
**Backend**: Hono API · Supabase (Postgres + Auth + RLS)
**Deploy**: Docker Compose · Caddy (static files + reverse proxy)

## Quick Start

### Prerequisites

- Node.js 20+
- Docker + Docker Compose (for deployment)

### Development

```bash
# Install dependencies
npm install

# Copy environment template and fill in credentials
cp .env.example .env

# Start Hono API server (port 3001)
npm run dev

# In another terminal: start Vite dev server (port 5173)
npm run dev:client
```

Vite proxies `/api/*` and `/webhook/*` to Hono during development.

### Production

```bash
# Build the SPA
npm run build

# Start with Docker Compose
docker compose up -d
```

## Docs

| Doc | Purpose | Syncs? |
|-----|---------|--------|
| `PROJECT_PROTOCOL.md` | Claude Code session rules | Yes |
| `docs/architecture-patterns.md` | Hono + SPA patterns, conventions | Yes |
| `docs/branching.md` | Git workflow | Yes |
| `docs/versioning.md` | Semantic versioning rules | Yes |
| `CLAUDE.md` | App-specific context (schema, APIs, gotchas) | No |
| `docs/overview.md` | Architecture and stack decisions | No |
| `docs/decisions.md` | Lessons learned | No |
| `docs/roadmap.md` | Feature tracking | No |
| `docs/secrets.md` | Secret management and rotation | No |
| `docs/migration-checklist.md` | Per-app migration steps | No |
| `docs/migration-waves.md` | Wave order, dependencies, blockers | No |

## Template Sync

Files marked "Syncs" are automatically pushed to downstream repos via GitHub Action when updated here. The action opens a PR in each repo for review.

**Config**: `.github/sync-config.json` — lists target repos and synced files.

**Requires**: A GitHub PAT stored as `REPO_SYNC_TOKEN` secret with repo access to all target repos.

## Structure

See `REPO-STRUCTURE-GUIDE.md` for the full folder convention.
