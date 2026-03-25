# Migration Waves — n8n → Hono

> Master reference for migration order, dependencies, and timeline. Each wave is one or more Claude Code sessions.

---

## Wave Order & Dependencies

```
Wave 1 ─── LoopBack (1a) + Porkchop Express (1b)
  │         ↳ Validates the migration pattern
  │
Wave 2 ─── Atom Bomb (2a) + CB Forms (2b)
  │         ↳ Migrates identity/portal layer (profiles, clients)
  │         ↳ Blocked by: Wave 1 verified
  │
Wave 3 ─── The Switchboard
  │         ↳ Biggest single effort (7 n8n workflows)
  │         ↳ Blocked by: Wave 2 verified (depends on Atom Bomb for user CRUD)
  │         ↳ After this: n8n can stop on r7c.app server
  │
Wave 4 ─── RobCo Atomizer (4a) + Intake (4b)
  │         ↳ Content pipeline apps
  │         ↳ Blocked by: Wave 3 verified
  │         ↳ Intake runs on explorer-one — coordinate with Wave 5
  │
Wave 5 ─── Nixie Engine (5a) → Nixie Vision (5b) → Holotape (5c)
  │         ↳ explorer-one ecosystem
  │         ↳ 5a must complete before 5b/5c (engine becomes shared modules)
  │         ↳ After this: n8n can stop on explorer-one server
  │
Wave 6 ─── Gracie Law (6a) + YGraphics Timeclock (6b) + Wayfinder Drafts (6c)
            ↳ Low priority — migrate when touched for feature work
```

---

## Per-Wave Detail

### Wave 1: Validate the Pattern

| App | Repo | Server | Risk | Key Change |
|-----|------|--------|------|------------|
| **1a. LoopBack** | `ygraphics-loopback` | explorer-one | Low | Express → Hono, htm → JSX+Vite |
| **1b. Porkchop Express** | `the-porkchop-express` | r7c.app | Low | Extract from Switchboard repo, ES5 → Preact+JSX+Vite, add Hono backend |

**Why first**: LoopBack is closest to the target (already has Express + Preact). Porkchop is simple and needs its own repo anyway. Both are low blast radius.

**Validates**: The full migration pattern — frontend conversion, Hono setup, Docker deployment, Caddy config. Every subsequent wave follows what's proven here.

### Wave 2: Identity + Portal Layer

| App | Repo | Server | Risk | Key Change |
|-----|------|--------|------|------------|
| **2a. Atom Bomb** | `r7capp-atom-bomb` | r7c.app | Medium | htm → JSX+Vite, n8n user CRUD → Hono routes |
| **2b. CB Forms** | `cb-forms` | r7c.app | Medium | Vanilla JS → Preact+JSX+Vite, Express → Hono |

**Why now**: Atom Bomb owns `public.profiles` and `public.clients` — every other app reads from these. Getting this right sets the pattern for all portal-connected apps.

**Critical**: Atom Bomb serves the portal at `r7c.app` root. Must keep working during migration.

### Wave 3: Core Production App

| App | Repo | Server | Risk | Key Change |
|-----|------|--------|------|------------|
| **3. The Switchboard** | `the-switchboard` | r7c.app | **High** | ES5 → Preact+JSX+Vite (view-by-view), 7 n8n workflows → Hono routes + node-cron |

**Why last on r7c**: Most complex app (376-line CLAUDE.md, Frame.io OAuth, email automation, weekly crons). Highest risk.

**n8n workflows to replace**:
- admin-api-v2-001 → Hono routes
- frameio-upload → Hono + Frame.io SDK
- frameio-comment → Hono route
- status-notify → Hono + Resend
- fri-cutoff → node-cron
- wed-auto-approval → node-cron
- tue-editor-deadline → node-cron

**After Wave 3**: All r7c.app n8n workflows replaced. n8n container can be stopped on this server (~2GB RAM reclaimed).

### Wave 4: Content Pipeline Apps

| App | Repo | Server | Risk | Key Change |
|-----|------|--------|------|------------|
| **4a. RobCo Atomizer** | `robco-atomizer` | r7c.app | Medium | n8n pipeline → Hono async jobs, React SPA stays (already Vite) |
| **4b. Intake** | `intake` | explorer-one | Medium | Preact+htm → JSX+Vite, n8n ingest → Hono routes |

### Wave 5: Nixie Ecosystem (explorer-one)

| App | Repo | Server | Risk | Key Change |
|-----|------|--------|------|------------|
| **5a. Nixie Engine** | `nixie-engine` | explorer-one | Medium | n8n sub-workflows → importable JS modules |
| **5b. Nixie Vision** | `nixie-vision` | explorer-one | Medium | n8n workflows → Hono + Engine modules, Telegram → Hono webhook |
| **5c. Holotape** | `holotape` | explorer-one | Low | Built on new Engine modules from scratch |

**5a is the foundation**: The engine becomes a package that instances import. No more `__POSTGRES_CREDENTIAL_ID__` placeholder stamping. Just `import { ingest } from './engine/ingest.js'`.

**Engine modules to create**:
- `engine/ingest.js` — chunk + embed (replaces Ingest Pipeline sub-workflow)
- `engine/query.js` — embed query + pgvector search + Claude generation (replaces RAG Query Pipeline)
- `engine/transcribe.js` — Whisper integration (replaces Transcribe contract)

**After Wave 5**: All explorer-one n8n workflows replaced. n8n container can be stopped (~2GB RAM reclaimed).

### Wave 6: Remaining Apps (Low Priority)

| App | Repo | Server | Risk | Key Change |
|-----|------|--------|------|------------|
| **6a. Gracie Law** | `r7capp-gracie-law` | r7c.app | None | Data collection phase — apply template when it becomes an app |
| **6b. YGraphics Timeclock** | `ygraphics-timeclock` | explorer-one | Low | Separate client app, migrate when convenient |
| **6c. Wayfinder Drafts** | `www/drafts` | r7c.app | Low | Simple SPA, migrate when touched |

---

## n8n Sunset Timeline

| Milestone | Trigger | Action |
|-----------|---------|--------|
| During migration | Per-workflow | Deactivate n8n workflow after Hono route is verified |
| After Wave 3 | All r7c.app workflows replaced | Stop n8n container on r7c.app server |
| After Wave 5 | All explorer-one workflows replaced | Stop n8n container on explorer-one |
| Final | Both servers n8n-free | Remove n8n from docker-compose.yml, reclaim ~2GB RAM per server |

---

## Deployment Patterns by Server

### r7c.app (Waves 1b, 2, 3, 4a, 6a, 6c)

- Caddy reverse proxy (static files + `/api/*` → Hono)
- Docker Compose: Caddy + Hono API
- Supabase cloud for database
- Authelia for forward auth (some apps)
- Standard `docker-compose.yml` from template

### explorer-one (Waves 1a, 4b, 5, 6b)

- Direct host deployment (or Docker)
- Shared services: Ollama, Gotenberg, Postgres+pgvector
- Telegram bot as shared interface
- Nixie Engine modules shared across instances
- Path: `/home/explorer/projects/keithgroben/`

---

## Session Guidance

- **One wave per focus period.** Don't try to do Wave 2 and Wave 3 in the same session.
- **One app at a time within a wave.** Finish 2a (Atom Bomb) before starting 2b (CB Forms).
- **48-hour bake between apps.** Monitor production before moving to the next app.
- **Each app ships as v2.0.0.** This is a major version bump — use `dev/v2.0` branch, tag `v2.0.0` on merge.
- **Secret rotation happens per-app during migration, then cross-cutting after all apps.** See `docs/secrets.md`.
