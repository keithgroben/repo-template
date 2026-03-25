# CLAUDE.md — App Context for Claude Code

> This file gives Claude Code the app-specific context it needs to work effectively. Updated per-project. Read at session start alongside PROJECT_PROTOCOL.md and docs/overview.md.

---

## App Name

[Your app name here]

## One-Liner

[What this app does in one sentence]

---

## Database Schema

**Supabase project**: [project name or URL]
**Schema**: `[schema_name]`

### Key Tables

| Table | Purpose | Key columns |
|-------|---------|-------------|
| [table_name] | [What it stores] | [Important columns] |

### RLS Notes

- [e.g., "Users can only read their own org's data"]
- [e.g., "Service role key used only in n8n, never in SPA"]

---

## API Endpoints & Webhooks

| Endpoint | Method | Purpose | Called from |
|----------|--------|---------|------------|
| [e.g., /webhook/abc123] | POST | [What it does] | [SPA / n8n / external] |

---

## Auth Flow

[How does auth work in this specific app? Which Supabase Auth method? Any Authelia specifics?]

---

## Environment & URLs

| Environment | URL | Notes |
|-------------|-----|-------|
| Production | [e.g., app.r7c.app] | Caddy reverse proxy |
| Dev/Local | [e.g., localhost:3000] | [How to run locally if applicable] |

---

## App-Specific Conventions

[Anything unique to this app that differs from the standard stack. Custom component patterns, non-standard data flows, third-party integrations, etc.]

---

## Known Gotchas

- [e.g., "The status field uses 'Active'/'Inactive' strings, not booleans"]
- [e.g., "Webhook X requires a specific header for auth"]
- [e.g., "Don't touch the legacy_users table — it's synced from an external system"]

---

## Defensive Defaults

These apply to every feature unless explicitly overridden:

- **Error handling**: Never show a blank screen or raw error. Every failed fetch, timeout, and edge case gets a user-facing message. Use Toast for transient errors, EmptyState for "no data" states, and a fallback UI for unexpected crashes.
- **Data protection**: Row-level security or equivalent access control on every table. Service-role credentials stay in n8n — never in the SPA. Never log emails, tokens, or payment info. Never paste secrets into chat.
- **Scale expectation**: [State it here — e.g., "10-50 internal users" or "500+ public signups". This tells Claude Code whether to optimize for simplicity or durability.]
- **Separation of concerns**: Every component, workflow, and integration must function by itself, stand by itself, and fail by itself. If a failure in one system cascades to another, refactor before building further.

---

## n8n Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [workflow_name] | [e.g., webhook / cron / manual] | [What it does] |

---

## Related Apps

| App | Relationship |
|-----|-------------|
| [e.g., The Switchboard] | [e.g., "Shares auth system, nav shell"] |
| [e.g., RobCo Atomizer] | [e.g., "Receives content via webhook"] |

---

## Roadmap

The project roadmap lives at `docs/roadmap.md`. Keep it organized in this order:

1. **Up Next** — Versioned features queued for development, in priority order
2. **Bug Fixes** — Known bugs to investigate/fix, no version number
3. **Unsolved** — Problems without a solution yet. Write the problem, not a feature spec. Include possible angles if any.
4. **Backlog** — Lower-priority items with ownership tags (`[ME]`, `[CLAUDE]`, `[TOGETHER]`)
5. **Completed** — Shipped versions, newest first. Each version lists items with `[x]` checkboxes.

Rules:
- When a version ships, move it from "Up Next" to the top of "Completed" and check off all items.
- New features go in "Up Next" with the next available version number.
- Bug reports go in "Bug Fixes" unless they're tied to a specific version.
- If the user describes a problem they don't know how to solve, put it in "Unsolved" — not "Up Next".
- Keep "Up Next" in priority order. Don't renumber versions unless the user asks.
- Commit roadmap changes with the code they relate to, or standalone if it's just a roadmap update.

---

## Version Release Checklist

**MANDATORY: When the user approves/signs off on a version, perform ALL of these steps before moving on to the next feature:**

1. Update the version constant in the SPA entry point (e.g. `app.js`, `package.json`, or wherever VERSION is defined)
2. Update `CHANGELOG.md` with the new version entry (date, what was added/changed/fixed)
3. Update `docs/roadmap.md` — move the version from "Up Next" to "Completed" with `[x]` checkboxes
4. If applicable: update cache-bust param in `index.html` (increment `?v=` value)
5. Commit all changes together in one commit
6. Push to GitHub
7. Deploy to production if applicable

**Do NOT move on to the next feature until all steps are done. This is non-negotiable.**
