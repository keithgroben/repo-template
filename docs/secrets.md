# Secret Management

> How secrets are stored, used, and rotated across R7/Wayfinder apps.

---

## Where Secrets Live

| Location | What goes here | Who reads it |
|---|---|---|
| `.env` (per-app, on server) | All runtime secrets | Hono server, Docker Compose |
| GitHub Secrets | `REPO_SYNC_TOKEN` (PAT for template sync) | GitHub Actions only |
| Supabase Dashboard | Project API keys, DB connection string | Reference only — copy to `.env` |
| n8n Credentials | API keys for n8n workflows (during migration) | n8n only |

### What NEVER goes in code or git

- Supabase service role key
- API keys (Resend, Anthropic, Frame.io, Telegram)
- Database passwords
- JWTs, session secrets, PINs

---

## Key Types & Boundaries

### Supabase anon key

- **Safe to expose**: Included in SPA JavaScript, sent to browsers
- **Purpose**: Identifies your Supabase project. All access goes through RLS.
- **Used in**: SPA (`createClient(url, anonKey)`), Hono user-scoped clients

### Supabase service role key

- **NEVER expose**: Bypasses all RLS. Full database access.
- **Used in**: Hono server only (`sbAdmin` client), n8n workflows (during migration)
- **Rule**: If this key appears in any file under `public/` or `src/`, stop and fix immediately.

### App-specific API keys

- **Resend**: Email sending. Used in Hono server or n8n. Never in SPA.
- **Anthropic**: LLM calls. Used in Hono server. Never in SPA.
- **Frame.io**: Media hosting. OAuth flow managed by Hono server.
- **Telegram bot token**: Webhook receiver in Hono. Never in SPA.

---

## .env Setup

1. Copy `.env.example` → `.env`
2. Fill in real values from Supabase Dashboard, API provider dashboards
3. Verify `.env` is in `.gitignore` (it should be — template includes it)
4. On the server: place `.env` next to `docker-compose.yml`

---

## Rotation Procedure

Run per-app during migration. After all apps are migrated, do the cross-cutting rotation.

### Per-app rotation (during migration)

1. **Audit**: `git log --all -p -- '*.env' '*.json' '*.js' | grep -iE 'key|secret|token|password' | head -50`
2. **Identify**: List every secret that was ever committed
3. **Rotate**: Generate new values from each provider's dashboard
4. **Update**: Replace in `.env` on server, restart container
5. **Verify**: App still works end-to-end

### Cross-cutting rotation (after all apps migrated)

Do these last — they affect multiple apps at once:

| Order | Secret | Provider | Affects |
|---|---|---|---|
| 1 | Supabase service role key | Supabase Dashboard → Settings → API | All apps with Hono backends |
| 2 | Resend API key | resend.com/api-keys | All apps that send email |
| 3 | Frame.io client secret | developer.frame.io | Switchboard |
| 4 | Cloudflare API token | dash.cloudflare.com/profile/api-tokens | DNS, deploy scripts |
| 5 | GitHub PAT (`REPO_SYNC_TOKEN`) | github.com/settings/tokens | Template sync action |

**Process for cross-cutting rotation:**

1. Generate new key/token from provider dashboard
2. Update `.env` on ALL affected servers
3. Update GitHub Secrets if applicable
4. Restart all affected containers: `docker compose restart api`
5. Verify every affected app works (hit each health check + one CRUD operation)
6. Invalidate / delete old key from provider dashboard

---

## Incident Response

If a secret is accidentally committed:

1. **Rotate immediately** — don't wait for the PR to merge
2. **Force-push** to remove the commit from history (or use `git filter-branch` / BFG Repo Cleaner)
3. **Check provider logs** — most API dashboards show recent key usage
4. **Document** in `docs/decisions.md` — what happened, what was exposed, what was rotated
