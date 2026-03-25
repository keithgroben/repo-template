 Plan: Implement repo-template v1.0 across r7c + Nixie ecosystems

 Context

 repo-template v1.0 is committed on dev/v1.0 at ~/projects/keithgroben/repo-template. It
 standardizes the stack as Preact+JSX+Vite+Tailwind (built) + Hono API + Supabase/Postgres. Every
 app needs to migrate from the old patterns (ES5/htm/n8n) to the new template.

 This plan covers 12 apps across two servers (r7c.app + explorer-one) with different complexity
 levels. The goal is to migrate without breaking production, validate the pattern early on simple
 apps, and tackle complex apps last.

 Migration order

 Wave 1: Validate the pattern (low risk, fast wins)

 1a. LoopBack (~/projects/Wayfinder-Digital/ygraphics-loopback)
 - Why first: Already has Express + Preact+htm. Closest to the target. Client app on separate server
  (explorer-one), low blast radius.
 - What changes: htm → JSX (add Vite build), Express → Hono, add standardized docs, add
 .gitignore/.env.example
 - What stays: Own Postgres mode, PIN auth, all existing routes/services logic
 - Estimated scope: Frontend file renames (.js → .jsx) + Vite config, server framework swap (Express
  → Hono, mostly mechanical), doc cleanup
 - Secret rotation: Check git history for PG_PASSWORD, RESEND_API_KEY

 1b. Porkchop Express (~/projects/keithgroben/the-porkchop-express)
 - Why early: Admin SPA is live but simple. Currently hosted inside Switchboard's repo — needs to
 become its own standalone app anyway.
 - What changes: Extract from Switchboard repo into own repo with template structure. ES5 →
 Preact+JSX+Vite. Add Hono backend (currently reads Supabase directly, no backend).
 - What stays: Supabase schema porkchop, read-only client view pattern
 - Secret rotation: Supabase keys if any were committed

 Wave 2: Identity + Portal layer (everything depends on these)

 2a. Atom Bomb (~/projects/Wayfinder-Digital/r7capp-atom-bomb)
 - Why now: Owns public.profiles and public.clients. Every other app reads from these tables.
 Currently Preact+htm, pre-build stage. Getting this right sets the pattern for all portal-connected
  apps.
 - What changes: htm → JSX (Vite build), add Hono backend for user CRUD (currently goes through n8n
 admin-api-v2), standardized docs
 - What stays: Supabase Auth, PortalAuth shared lib, service gating via clients.services
 - n8n workflows to replace: User CRUD actions from admin-api-v2 → Hono routes
 - Critical: Portal at r7c.app root is served from this repo. Must keep working during migration.
 - Secret rotation: Supabase service role key, any tokens in git history

 2b. CB Forms (~/projects/keithgroben/cb-forms)
 - Why now: Already has Express backend. Frontend migration is the main work.
 - What changes: Vanilla JS frontend → Preact+JSX+Vite. Express → Hono (or keep Express if migration
  is too disruptive — it's already working). Standardized docs.
 - What stays: Form engine core, primitives, adapters, Express routes (can swap to Hono
 incrementally)
 - Decision: Swap Express → Hono. Full stack standardization.
 - Secret rotation: SUPABASE keys, CSRF_SECRET, TURNSTILE_SECRET_KEY

 Wave 3: Core production app

 3. The Switchboard (~/projects/keithgroben/the-switchboard)
 - Why last on r7c: Most complex app (376-line CLAUDE.md, 7 n8n workflows, Frame.io OAuth, email
 automation, weekly cron jobs). Highest risk.
 - What changes: ES5 admin SPA → Preact+JSX+Vite (view-by-view migration). n8n webhooks → Hono
 routes. Standardized docs. CLAUDE.md trimmed.
 - n8n workflows to replace:
   - admin-api-v2-001 → Hono routes (user CRUD, moveToCompleted)
   - TlXTrzGZ1KaNwVor (frameio-upload) → Hono route + Frame.io SDK
   - gBlZitHTjEKA8ERe (frameio-comment) → Hono route
   - V8xPEUrPuM55FMeH (status-notify) → Hono route + Resend
   - ZiUZgxtHaOZSGQvn (fri cutoff) → node-cron in Hono server
   - mt4LZR7DOCiX7A8C (wed auto-approval) → node-cron
   - wnUf7p4mnd2ejjnR (tue editor deadline) → node-cron
 - Migration strategy: Run Hono alongside n8n. Migrate one workflow at a time. Switch SPA to point
 at Hono route when ready. Deactivate n8n workflow after verified.
 - What stays: Supabase schema, RLS policies, Frame.io OAuth pattern, S3 upload with putChunk
 - Secret rotation: FRAMEIO_CLIENT_SECRET, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, JWT_SECRET

 Wave 4: Content pipeline apps

 4a. RobCo Atomizer (~/projects/keithgroben/robco-atomizer)
 - What changes: n8n pipeline → Hono server with async job processing. React SPA already uses Vite —
  keep it. Standardized docs.
 - n8n workflows to replace:
   - robco-atomizer-extract-001 (60s poller) → node-cron in Hono
   - Content generation pipeline (5 Claude calls) → async job runner in Hono
   - Telegram bot trigger → Hono webhook endpoint
 - What stays: Supabase schema robco, Whisper integration, React SPA (already Vite)
 - Secret rotation: ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN

 4b. Intake (~/projects/keithgroben/intake)
 - What changes: Preact+htm → Preact+JSX+Vite. n8n ingest pipeline → Hono routes.
 - n8n workflows to replace:
   - intake-ingest-001 → Hono route (upload → transcribe → metadata → batch write)
   - intake-error-log-001 → error handling in Hono
 - What stays: Supabase ingest_jobs, SPA polling pattern
 - Note: Runs on explorer-one. Coordinate with Nixie wave.

 Wave 5: Nixie ecosystem (explorer-one)

 5a. Nixie Engine (explorer-one:/home/explorer/projects/keithgroben/nixie-engine)
 - What changes: n8n sub-workflows → importable JS modules. The entire "engine" becomes a package
 that instances import. SPEC.md contract system becomes function signatures.
 - Modules to create:
   - engine/ingest.js — chunk + embed (replaces Ingest Pipeline sub-workflow)
   - engine/query.js — embed query + pgvector search + Claude generation (replaces RAG Query
 Pipeline)
   - engine/transcribe.js — Whisper integration (replaces Transcribe contract)
 - What stays: Universal schema, config-driven enrichment, per-instance credentials via env vars
 - Key benefit: No more __POSTGRES_CREDENTIAL_ID__ placeholder stamping. No more sub-workflow
 contracts. Just import { ingest } from './engine/ingest.js'.

 5b. Nixie Vision (explorer-one)
 - What changes: n8n workflows → Hono server that imports Nixie Engine modules. Telegram bot → Hono
 webhook route. Dashboard stays.
 - n8n workflows to replace: All instance workflows (Build Ingest Input, Telegram bot handler,
 Ingestion Queue processor, bot commands)
 - What stays: Postgres tables, Ollama embeddings, Gotenberg PDF conversion, Telegram bot UX
 - Secret rotation: ANTHROPIC_API_KEY_NIXIE_VISION, Telegram bot token

 5c. Holotape (explorer-one)
 - Depends on: Nixie Engine migration (5a)
 - What changes: Will be built on the new Nixie Engine modules from the start. No legacy n8n to
 migrate.

 Wave 6: Remaining apps (low priority)

 6a. Gracie Law (~/projects/Wayfinder-Digital/r7capp-gracie-law)
 - Data collection phase, not a running app. Apply template when it becomes an app.

 6b. YGraphics Timeclock (~/projects/Wayfinder-Digital/ygraphics-timeclock)
 - Separate client app. Migrate when convenient. Own Postgres mode.

 6c. Wayfinder Drafts (~/projects/www/drafts/)
 - Simple SPA. Low priority. Migrate when touched for feature work.

 Per-app migration checklist

 Apply to every app in the wave:

 Before starting

 - Read current CLAUDE.md and docs
 - Audit git history for secrets: git log --all -p -- '*.env' '*.json' '*.js' | grep -iE
 'key|secret|token|password' | head -50
 - List all n8n workflows that need to be replaced
 - Create dev branch: dev/v2.0 (this is a major version bump for every app)

 Frontend migration

 - Add Vite + Preact preset + Tailwind CSS plugin (package.json, vite.config.js)
 - Create src/ directory, move components/views from public/ to src/
 - Rename .js → .jsx for files with markup
 - Convert htm tagged templates to JSX syntax
 - Replace Tailwind CDN script tag with @import "tailwindcss" in index.css
 - Replace ES5 patterns (var, .then) with modern JS (const/let, async/await)
 - Update index.html to Vite entry (<script type="module" src="/src/index.jsx">)
 - Test: npm run dev — SPA loads, all views render, Supabase reads work

 Backend migration (if app has n8n workflows)

 - Create server/ directory with Hono entry point
 - Add auth middleware (Supabase JWT or PIN-based)
 - Convert each n8n webhook to a Hono route handler (one at a time)
 - Convert each n8n cron to node-cron or setInterval
 - Test each route against the running app
 - Switch SPA from n8n webhook URL to Hono /api URL
 - Verify end-to-end
 - Deactivate n8n workflow

 Docs + security

 - Rewrite CLAUDE.md (under 100 lines, code style rules, secrets policy)
 - Rewrite README.md (useful: run, deploy, structure)
 - Create docs/api.md, schema.md, security.md, deploy.md
 - Update docs/decisions.md with migration entry
 - Add .gitignore, .env.example
 - Move secrets from code/docs to .env
 - Rotate any secrets found in git history

 Ship

 - Dockerfile + docker-compose.yml
 - Test on dev preview URL
 - Merge to main, tag as v2.0.0
 - Update CHANGELOG.md
 - Deactivate replaced n8n workflows
 - Verify production

 Secret rotation schedule

 Run per-app during migration. After all apps are migrated:
 1. Rotate Supabase service role key (affects all apps — do this last, all at once)
 2. Rotate Resend API key
 3. Rotate Frame.io client secret + refresh token
 4. Rotate Cloudflare API token
 5. Rotate GitHub tokens (REPO_SYNC_TOKEN, GITHUB_TOKEN in n8n)
 6. Update all .env files on server, restart containers
 7. Verify all apps still work

 n8n sunset timeline

 - During migration: n8n stays running. New Hono routes go live one at a time. n8n workflows
 deactivated as replaced.
 - After Wave 3: All r7c.app workflows replaced. n8n container can be stopped on this server.
 - After Wave 5: All explorer-one workflows replaced. n8n container can be stopped on explorer-one.
 - Final: Remove n8n from docker-compose.yml, reclaim ~2GB RAM per server.

 Timeline estimate

 Not estimating dates — but the order matters:
 - Wave 1 (LoopBack + Porkchop): validates the migration pattern
 - Wave 2 (Atom Bomb + CB Forms): migrates the identity/portal layer
 - Wave 3 (Switchboard): biggest single effort, most n8n workflows
 - Wave 4 (Atomizer, Intake): content pipelines on r7c
 - r7c complete — then move to explorer-one:
 - Wave 5 (Nixie Engine → Vision → Holotape): explorer-one ecosystem
 - Wave 6 (Gracie Law, Timeclock, Drafts): whenever convenient

 Each wave can be a separate Claude Code session. Don't try to do multiple apps in one session.

 Verification

 After each app migration:
 1. npm run smoke — all API actions respond correctly
 2. Dev preview URL — SPA loads, all views render
 3. Production URL — end-to-end test (login, CRUD, scheduled jobs fire)
 4. Check n8n execution log — deactivated workflows show no new executions
 5. Monitor for 48 hours before moving to next app
