# R7C Ecosystem Standards

> **This repo is the default implementation of the R7C ecosystem development standards.** It does not invent its own operating model — it implements ecosystem law.
>
> Source of truth lives in `r7c-context/standards/`. Read those documents directly when in doubt.

---

## Rule Hierarchy

1. **`r7c-context/standards/*`** — ecosystem law. Governs every coding agent (Anthropic, OpenAI, Google, future) and every R7C app repo regardless of vendor.
2. **`repo-template/*`** — default repo implementation of ecosystem law. What you're reading right now.
3. **Repo-local files** — app-specific context and explicitly documented exceptions only.

A repo-local file may add context. It may not silently override an ecosystem standard. Exceptions must be documented in the repo and, when meaningful, also recorded in `r7c-context/decisions/`.

---

## Standards That Apply Here

| Standard | What it covers | Where this template implements it |
|----------|----------------|------------------------------------|
| `agent-operating-standard.md` | Universal rules every coding agent must follow | `PROJECT_PROTOCOL.md` (Boot Sequence, Phase Gates, Rules, Changelog Release Gate) |
| `repo-compliance-standard.md` | Required files, structure, and compliance checks | Required files at repo root + `docs/` (see "Compliance" below) |
| `local-first-development.md` | Develop locally, deploy intentionally | `README.md` → *Local Development* section + `package.json` scripts |
| `scope-governance-standard.md` | How feature/scope changes enter the system | `PROJECT_PROTOCOL.md` Phase 0 (Brief) and Phase 0.5 (Milestones) |
| `template-propagation-standard.md` | How template changes flow into existing repos | `.github/sync-config.json` + `.github/workflows/sync-to-repos.yml` |
| `deploy-discipline-standard.md` | Canonical deploy path, no direct-to-prod | `docs/branching.md` + dev/prod env separation |
| `audit-standard.md` | What Cheetah is expected to audit and flag | Read by Cheetah; this template ships the structure that makes audits possible |
| `architecture-standard.md` | System design rules for apps and integrations | `docs/architecture-patterns.md` |
| `approved-stack.md` | Default technical stack | `package.json` + stack table in `README.md` |

---

## Compliance — Required Files

`repo-compliance-standard.md` requires the following files in every R7C repo. This template ships them all (modulo the divergence noted below):

| Required file | Present in template |
|---------------|---------------------|
| `PROJECT_PROTOCOL.md` | Yes |
| `CLAUDE.md` | Yes |
| `CHANGELOG.md` | Yes |
| `docs/roadmap.md` | Yes |
| `docs/overview.md` | Yes |
| `AI_HANDOFF.md` | **No — see Divergences** |

### Required Capabilities

- **Local development setup documented** — `README.md` → *Local Development* section
- **Clear versioning and release process** — `docs/versioning.md` + `CHANGELOG.md` + version release checklist in `CLAUDE.md`
- **Defined environment variables** — `.env.example`

---

## Current Divergences from Standards

When this template intentionally departs from `r7c-context/standards/`, the divergence is named here so it is auditable.

### `AI_HANDOFF.md` retired

- **What the standard says**: `repo-compliance-standard.md` lists `AI_HANDOFF.md` as a required file. `agent-operating-standard.md` references "Update handoff before ending any session".
- **What this template does**: `AI_HANDOFF.md` is removed. Cross-session state lives in `git log`, GitHub issues, and the roadmap entry's `**Status**` / `**Pass Count**` fields.
- **Why**: The handoff-file pattern was retired in `agent-gracie-law` after the file accumulated into a 350KB blob no agent read end-to-end. The git log is the source of truth for cross-session context.
- **Action required upstream**: `r7c-context/standards/repo-compliance-standard.md` and `r7c-context/standards/agent-operating-standard.md` should be updated to reflect the retirement.

---

## Reading Order

A new agent landing in this repo cold should read:

1. `PROJECT_PROTOCOL.md` (this repo's implementation)
2. `r7c-context/standards/agent-operating-standard.md` (the ecosystem rules behind the protocol)
3. `r7c-context/standards/scope-governance-standard.md` (why Phase 0 exists)
4. `r7c-context/standards/repo-compliance-standard.md` (what files this repo must contain)
5. `CLAUDE.md` (this app's specific context)

Reading the standards once gives durable context that doesn't need to be re-read every session — but the hierarchy must be honored on every change.
