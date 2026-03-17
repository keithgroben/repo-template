# Decisions & Lessons Learned

> This is the institutional memory of this project. Every time we burn hours on something and finally crack it, it goes here. Claude Code reads this at the start of every session so we never repeat the same mistakes.

---

## How to Write an Entry

```
### [Short title of what happened]
**Date**: YYYY-MM-DD
**Problem**: What went wrong or what we were trying to solve.
**What didn't work**: Approaches that failed and why.
**What fixed it**: The actual solution.
**Why**: The underlying reason — not just the fix, but the lesson.
**Rule going forward**: One sentence. What we always do (or never do) from now on.
```

---

## Log

### Preact changes nothing about the server, database, or orchestration layer
**Date**: 2026-03-16
**Problem**: Before committing to Preact + htm, needed to confirm it wouldn't require changes to the Ubuntu server, Caddy config, Docker setup, n8n workflows, or Supabase schema.
**What we confirmed**: Preact runs entirely in the browser. The server serves static files — same as vanilla JS. Supabase JS client works identically (same `sb.from()`, same `sb.schema()`, same RLS, same auth tokens). n8n webhooks are called via `fetch` — the webhook doesn't know what rendered the button. Caddy volume mounts, Authelia forward auth, Docker compose — all unchanged. ES modules (`import`/`export`) work natively in modern browsers and are served as static `.js` files by Caddy with no special config.
**One convention change**: New apps use modern JavaScript (`const`, `let`, arrow functions, `async/await`, destructuring). ES5 convention (`var`, `.then()`) stays in existing apps until they're migrated view-by-view. Don't write Preact components in ES5 — it defeats the purpose.
**Rule going forward**: Preact is a frontend-only change. If a Preact migration requires touching Caddy, Docker, n8n, or Supabase config, something is wrong — stop and reassess.

### Standardized on Preact + htm for all new SPAs
**Date**: 2026-03-16
**Problem**: Every SPA in the ecosystem was built with vanilla JS string concatenation (`html += '<div>...'`). The Switchboard admin alone is ~2,800 lines, with ~60% of that being `html +=` building, manual `addEventListener` wiring, and `classList.toggle` DOM management. New apps copied patterns from old apps and inherited the same problems.
**What didn't work**: React (requires build step, 40KB, fights the Caddy-serves-static-files architecture). Vue and Svelte (same build step problem). Alpine.js (designed for server-rendered HTML sprinkles, not full SPAs).
**What fixed it**: Preact (3KB, React-compatible API) + htm (tagged template JSX alternative that runs in the browser). Both load from CDN script tags. No webpack, no Vite, no node_modules, no build folder. Caddy still serves static files. Tailwind Play CDN still works.
**Why**: The problem was never "we need a framework." The problem was string concatenation for UI rendering — missed closing tags, XSS risk from un-escaped values, no component reuse, and massive single files. Preact + htm solves that specific problem without changing the deployment architecture.
**Rule going forward**: All new SPAs use Preact + htm. Existing apps migrate view-by-view when touched for feature work. Never add a build step.

### Do not replace Tailwind CDN with a static build
**Date**: 2026-02-25
**Problem**: Replacing Tailwind Play CDN with a Tailwind CLI static build broke all JS-rendered content across the admin dashboard and client portal.
**What didn't work**: Tailwind CLI static build. It scans source files for class names but misses classes inside complex JS string concatenation — especially arbitrary values like `text-[15px]`, `bg-[#F8F7F4]`, and opacity modifiers like `bg-amber-50/70`.
**What fixed it**: Reverted to Tailwind Play CDN. The in-browser JIT compiler watches the DOM in real time and generates classes on the fly — handling runtime-generated HTML automatically.
**Why**: ~70% of UI in these SPAs is rendered by JavaScript. The CDN's in-browser JIT is the correct tool for this architecture. A static build would only work if all templates were refactored to use a framework with extractable templates (which Preact + htm now provides — but the CDN still works fine and is simpler).
**Rule going forward**: Keep the Tailwind Play CDN. Do not attempt a static CSS build unless the entire app has been migrated to Preact components (and even then, test thoroughly before shipping).

---

<!-- Add new entries above this line, newest first -->
