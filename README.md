# [App Name]

> [One-line description]

## Stack

Preact + htm · Tailwind CDN · Supabase · Caddy · n8n

## Quick Start

1. Copy `starter-index.html` into `public/index.html`
2. Update app name, Supabase credentials, and webhook URLs
3. Point Caddy at the `public/` directory
4. Split components into `public/components/` and views into `public/views/` as the app grows

## Docs

| Doc | Purpose | Syncs? |
|-----|---------|--------|
| `PROJECT_PROTOCOL.md` | Claude Code session rules | Yes |
| `docs/architecture-patterns.md` | n8n patterns, direct DB, conventions | Yes |
| `docs/branching.md` | Git workflow | Yes |
| `docs/versioning.md` | Semantic versioning rules | Yes |
| `CLAUDE.md` | App-specific context (schema, APIs, gotchas) | No |
| `docs/overview.md` | Architecture and stack decisions | No |
| `docs/decisions.md` | Lessons learned | No |
| `docs/roadmap.md` | Feature tracking | No |

## Template Sync

Files marked "Syncs" are automatically pushed to downstream repos via GitHub Action when updated here. The action opens a PR in each repo for review.

**Config**: `.github/sync-config.json` — lists target repos and synced files.

**Requires**: A GitHub PAT stored as `REPO_SYNC_TOKEN` secret with repo access to all target repos.

## Structure

See `REPO-STRUCTURE-GUIDE.md` for the full folder convention.
