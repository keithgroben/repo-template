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
