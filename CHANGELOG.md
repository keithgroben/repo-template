# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]

## [1.0.0] - 2026-03-25
### Added
- **Frontend stack**: Preact + JSX + Vite + Tailwind CSS with full component library (Badge, ConfirmDialog, EmptyState, InfoCard, LoadingSkeleton, Toast)
- **Backend stack**: Hono API starter with JWT + PIN auth middleware, CRUD examples, webhook/cron/email/transaction patterns, graceful shutdown
- **Infrastructure**: Dockerfile (multi-stage Vite build + Hono), docker-compose.yml (Caddy + API), Caddyfile (static dist + reverse proxy), .env.example
- **Vite config**: Preact preset, Tailwind plugin, dev proxy to Hono API
- **SPA lib**: Supabase client + auth helpers (`src/lib/supabase.js`), API fetch wrapper (`src/lib/api.js`)
- **Smoke test**: `scripts/smoke-test.js` — health check + API route validation
- **Migration docs**: `docs/migration-waves.md` (6 waves, dependency graph, n8n sunset timeline), `docs/migration-checklist.md` (per-app step-by-step)
- **Secret management**: `docs/secrets.md` — where secrets live, key types, rotation procedures
- **Migration session rules**: `PROJECT_PROTOCOL.md` updated with boot sequence for migration sessions, one-workflow-at-a-time constraint, 48-hour bake rule
- **CLAUDE.md migration fields**: Wave number, target state, workflow mapping table, blocker tracking
- Synced `docs/secrets.md` to all 10 downstream repos via GitHub Action

### Changed
- **Stack standardized**: Preact+JSX+Vite+Tailwind (built) + Hono API + Supabase/Postgres is now the single standard
- **REPO-STRUCTURE-GUIDE.md**: Rewritten for `src/` (Vite JSX) + `server/` (Hono) structure, Preact-to-React swap guide, API-only mode for mobile
- **architecture-patterns.md**: Rewritten — Hono as API backend (when to use, auth patterns, middleware, response format, Caddy config), PG functions, SPA architecture, separation of concerns
- **decisions.md**: New entry documenting stack standardization rationale
- **overview.md**: Core architecture updated to Hono + Vite + Docker
- **README.md**: Stack, quick start (dev + production), full doc table
- **package.json**: v1.0.0, `type: module`, scripts (dev, dev:client, build, preview, start, smoke), all dependencies

### Removed
- `starter-index.html` — replaced by proper Vite project files (`index.html`, `src/index.jsx`, `src/index.css`)
- All references to no-build pattern, CDN loading, htm tagged templates, n8n as primary backend

## [0.3.0] - 2026-03-16
### Added
- Initial release — PROJECT_PROTOCOL.md, CLAUDE.md template, REPO-STRUCTURE-GUIDE, docs suite
- Preact + htm + Tailwind CDN starter (starter-index.html)
- GitHub Action sync workflow + sync.sh for distributing shared files
- Architecture patterns, branching, versioning, roadmap docs
- Mandatory version release checklist in CLAUDE.md
