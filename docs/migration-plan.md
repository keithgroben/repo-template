# Migration Plan: repo-template v1.0 rollout

## Context

repo-template v1.0 standardizes the stack as Preact+JSX+Vite+Tailwind (built) + Hono API + Supabase/Postgres. Every app needs to migrate from the old patterns (ES5/htm/n8n) to the new template.

12 apps across two servers (r7c.app + explorer-one). Finish r7c first, then explorer-one.

## Migration order

### Wave 1: Validate the pattern (low risk, fast wins)

**1a. LoopBack** (`~/projects/Wayfinder-Digital/ygraphics-loopback`)
- Already has Express + Preact+htm. Closest to the target. Client app on separate server, low blast radius.
- htm → JSX (add Vite build), Express → Hono, add standardized docs, add .gitignore/.env.example
- Own Postgres mode stays. PIN auth stays. All existing routes/services logic carries over.
- Secret rotation: Check git history for PG_PASSWORD, RESEND_API_KEY

**1b. Porkchop Express** (`~/projects/keithgroben/the-porkchop-express`)
- Admin SPA is live but simple. Currently hosted inside Switchboard's repo — needs to become standalone.
- Extract from Switchboard repo into own repo with template structure. ES5 → Preact+JSX+Vite. Add Hono backend.
- Supabase schema `porkchop` stays. Read-only client view pattern stays.

### Wave 2: Identity + Portal layer (everything depends on these)

**2a. Atom Bomb** (`~/projects/Wayfinder-Digital/r7capp-atom-bomb`)
- Owns `public.profiles` and `public.clients`. Every other app reads from these.
- htm → JSX (Vite build), add Hono backend for user CRUD (replaces n8n admin-api-v2).
- Supabase Auth stays. PortalAuth shared lib stays. Service gating stays.
- n8n to replace: User CRUD actions from admin-api-v2 → Hono routes
- Critical: Portal at r7c.app root is served from this repo. Must keep working during migration.
- Secret rotation: Supabase service role key, any tokens in git history

**2b. CB Forms** (`~/projects/keithgroben/cb-forms`)
- Already has Express backend. Full swap to Hono (standardize the stack).
- Vanilla JS frontend → Preact+JSX+Vite. Express → Hono.
- Secret rotation: SUPABASE keys, CSRF_SECRET, TURNSTILE_SECRET_KEY

### Wave 3: Core production app

**3. The Switchboard** (`~/projects/keithgroben/the-switchboard`)
- Most complex app. 7 n8n workflows, Frame.io OAuth, email automation, weekly cron jobs. Highest risk.
- ES5 admin SPA → Preact+JSX+Vite (view-by-view migration). n8n webhooks → Hono routes.
- n8n workflows to replace:
  - `admin-api-v2-001` → Hono routes (user CRUD, moveToCompleted)
  - `TlXTrzGZ1KaNwVor` (frameio-upload) → Hono route + Frame.io SDK
  - `gBlZitHTjEKA8ERe` (frameio-comment) → Hono route
  - `V8xPEUrPuM55FMeH` (status-notify) → Hono route + Resend
  - `ZiUZgxtHaOZSGQvn` (fri cutoff) → node-cron in Hono server
  - `mt4LZR7DOCiX7A8C` (wed auto-approval) → node-cron
  - `wnUf7p4mnd2ejjnR` (tue editor deadline) → node-cron
- Migration strategy: Run Hono alongside n8n. Migrate one workflow at a time. Switch SPA to Hono route when ready. Deactivate n8n workflow after verified.
- Secret rotation: FRAMEIO_CLIENT_SECRET, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, JWT_SECRET

### Wave 4: Content pipeline apps

**4a. RobCo Atomizer** (`~/projects/keithgroben/robco-atomizer`)
- n8n pipeline → Hono server with async job processing. React SPA already uses Vite — keep it.
- n8n workflows to replace:
  - `robco-atomizer-extract-001` (60s poller) → node-cron in Hono
  - Content generation pipeline (5 Claude calls) → async job runner in Hono
  - Telegram bot trigger → Hono webhook endpoint
- Secret rotation: ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN

**4b. Intake** (`~/projects/keithgroben/intake`)
- Preact+htm → Preact+JSX+Vite. n8n ingest pipeline → Hono routes.
- n8n workflows to replace:
  - `intake-ingest-001` → Hono route (upload → transcribe → metadata → batch write)
  - `intake-error-log-001` → error handling in Hono

**r7c complete after Wave 4. Then move to explorer-one.**

### Wave 5: Nixie ecosystem (explorer-one)

**5a. Nixie Engine** (`explorer-one:/home/explorer/projects/keithgroben/nixie-engine`)
- n8n sub-workflows → importable JS modules. The entire "engine" becomes a package.
- Modules to create:
  - `engine/ingest.js` — chunk + embed (replaces Ingest Pipeline sub-workflow)
  - `engine/query.js` — embed query + pgvector search + Claude generation (replaces RAG Query Pipeline)
  - `engine/transcribe.js` — Whisper integration (replaces Transcribe contract)
- No more `__POSTGRES_CREDENTIAL_ID__` placeholders. No more sub-workflow contracts. Just imports.

**5b. Nixie Vision** (`explorer-one`)
- n8n workflows → Hono server that imports Nixie Engine modules.
- Telegram bot → Hono webhook route. Dashboard stays.
- Secret rotation: ANTHROPIC_API_KEY_NIXIE_VISION, Telegram bot token

**5c. Holotape** (`explorer-one`)
- Built on new Nixie Engine modules from the start. No legacy n8n to migrate.

### Wave 6: Remaining apps (low priority)

- **Gracie Law**: Apply template when it becomes a running app
- **YGraphics Timeclock**: Migrate when convenient. Own Postgres mode.
- **Wayfinder Drafts**: Migrate when touched for feature work

## Per-app migration checklist

### Before starting
- [ ] Read current CLAUDE.md and docs
- [ ] Audit git history for secrets: `git log --all -p -- '*.env' '*.json' '*.js' | grep -iE 'key|secret|token|password' | head -50`
- [ ] List all n8n workflows that need to be replaced
- [ ] Create dev branch: `dev/v2.0`

### Frontend migration
- [ ] Add Vite + Preact preset + Tailwind CSS plugin
- [ ] Create `src/`, move components/views from `public/`
- [ ] Rename `.js` → `.ts` and `.jsx` → `.tsx` for all source files
- [ ] Convert htm tagged templates to TSX syntax, add prop interfaces
- [ ] Replace Tailwind CDN with `@import "tailwindcss"` in index.css
- [ ] Replace ES5 (var, .then) with modern TS (const/let, async/await)
- [ ] Update `index.html` to Vite entry
- [ ] Test: `npm run dev` — SPA loads, all views render

### Backend migration (if app has n8n workflows)
- [ ] Create `server/` with Hono entry point
- [ ] Add auth middleware
- [ ] Convert each n8n webhook to a Hono route (one at a time)
- [ ] Convert each n8n cron to node-cron or setInterval
- [ ] Switch SPA from n8n webhook URL to Hono `/api` URL
- [ ] Verify end-to-end
- [ ] Deactivate n8n workflow

### Docs + security
- [ ] Rewrite CLAUDE.md (under 100 lines)
- [ ] Rewrite README.md (useful)
- [ ] Create docs/api.md, schema.md, security.md, deploy.md
- [ ] Add .gitignore, .env.example
- [ ] Rotate any secrets found in git history

### Ship
- [ ] Dockerfile + docker-compose.yml
- [ ] Test on dev preview URL
- [ ] Merge to main, tag v2.0.0
- [ ] Deactivate replaced n8n workflows
- [ ] Verify production

## Secret rotation schedule

After all apps migrated:
1. Rotate Supabase service role key (affects all apps — do last, all at once)
2. Rotate Resend API key
3. Rotate Frame.io client secret + refresh token
4. Rotate Cloudflare API token
5. Rotate GitHub tokens
6. Update all .env files, restart containers, verify

## n8n sunset

- During migration: n8n stays running. Workflows deactivated as replaced.
- After Wave 4: All r7c.app workflows replaced. Stop n8n on this server.
- After Wave 5: All explorer-one workflows replaced. Stop n8n on explorer-one.
- Final: Remove n8n from docker-compose.yml, reclaim ~2GB RAM per server.
