# Architecture Patterns

> Shared patterns across all R7/Wayfinder apps. Synced from repo-template.

---

## n8n as Orchestration Layer

n8n is the backend for all R7/Wayfinder apps. It handles routing, webhooks, and light data operations. It is **not** a data processing engine.

### What n8n handles well

| Use Case | Example |
|----------|---------|
| Webhook routing | Single endpoint, action-based switch (`POST /webhook/app/api`) |
| Simple CRUD | Single-row inserts, updates, deletes via Code node + Postgres |
| Cron scheduling | Email send queues, polling, cleanup jobs |
| External API calls | Resend, Frame.io, GitHub, Telegram |
| Workflow logic | If/then branching, error handling, notifications |
| Light transforms | Small JSON reshaping in Code nodes |

### What n8n does NOT handle well

| Use Case | Why | Workaround |
|----------|-----|------------|
| Bulk data inserts (100+ rows) | Code node task runner has ~200KB payload ceiling, crashes after accumulated load | Direct DB pattern (see below) |
| Large SQL string building | V8 sandbox memory limit (512MB old space) doesn't recover between rapid executions | Build SQL client-side, send to dedicated webhook |
| Heavy computation | Task runner is single-threaded, blocks other executions | Offload to external script or PG function |
| File processing | Binary data handling is fragile, memory-intensive | Use Gotenberg, ffmpeg, or native tools on host |

### Key n8n limits (discovered empirically)

- **~200KB payload per Code node execution** — larger payloads cause silent failures
- **~12 rapid sequential webhook executions** — task runner accumulates state and stops responding
- **Task runner memory: 512MB V8 heap** — set via `N8N_RUNNERS_MAX_OLD_SPACE_SIZE`
- **Task runner can't be disabled** on n8n 2.10.x+ (runs regardless of `N8N_RUNNERS_DISABLED`)
- **Webhook secrets regenerate on import** — Telegram webhooks break after workflow import (delete + re-register)

---

## Direct DB Pattern

When n8n's Code node can't handle the data volume, bypass it entirely.

### The pattern

```
SPA builds SQL client-side → Dedicated webhook (no Code node) → Postgres node → Respond
```

### When to use

- Bulk imports (100+ rows)
- Any operation that builds SQL strings > 100KB
- Batch operations that would require many sequential webhook calls

### How to implement

1. **SPA**: Build the INSERT/UPDATE SQL in JavaScript (with proper escaping)
2. **Dedicated n8n workflow**: Webhook → Postgres (executeQuery: `{{ $json.body.sql }}`) → Respond
3. **No Code node** in the pipeline — the SQL goes straight from webhook body to Postgres

### Example (from LoopBack)

```javascript
// SPA builds SQL
var sql = "WITH inserted AS (INSERT INTO customers (...) VALUES "
    + vals.join(',')
    + " ON CONFLICT (email) DO NOTHING RETURNING id) SELECT COUNT(*) FROM inserted";

// Send to dedicated webhook
fetch('/webhook/app/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql: sql })
});
```

### Security note

The SPA sends raw SQL to the webhook. This is acceptable because:
- The app runs on a Tailscale network (no public access)
- There is no untrusted user input — the SPA controls the SQL construction
- The webhook endpoint is separate from the main API (can be restricted or removed)

For public-facing apps, use parameterized queries or a server-side import endpoint instead.

---

## Webhook Conventions

### URL structure

```
/webhook/{app}/api        — Main CRUD API (action-based routing)
/webhook/{app}/import     — Bulk import (direct DB, no Code node)
/webhook/{app}/img        — Image serving (if using DB-stored images)
/webhook/{app}/bounce     — External webhook receiver (e.g., Resend bounces)
```

### Action-based routing

All CRUD goes through a single webhook. The request body contains `{ action, data }`. A Code node switches on `action` and builds the SQL query.

```javascript
// Request
{ "action": "customers.list", "data": {} }
{ "action": "customers.create", "data": { "first_name": "John", ... } }

// Code node
switch (action) {
    case 'customers.list': query = 'SELECT * FROM customers'; break;
    case 'customers.create': query = 'INSERT INTO ...'; break;
}
```

### Response format

All API responses are JSON arrays. Even single-row responses return `[{ ... }]`. Empty results return `[]`.

---

## PG Functions for Complex Logic

When business logic is too complex for a Code node but needs to run atomically, use a PostgreSQL function.

### When to use

- Multi-step calculations that depend on current DB state
- Operations that need to query + update in one transaction
- Logic that would require multiple sequential queries in n8n

### Example (from LoopBack — send throttling)

```sql
CREATE FUNCTION calculate_send_after(p_customer_id UUID, p_requested_time TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
    -- Weekend skip, per-customer stacking, rate limiting
    -- All in one atomic function call
$$ LANGUAGE plpgsql;
```

Called from the Code node: `calculate_send_after(customer_id, now())`

---

## SPA Architecture

### No build step

All R7/Wayfinder SPAs use Preact + htm + Tailwind Play CDN. No webpack, no bundler, no transpiler. Files are served directly by Caddy.

### File structure

```
public/
├── index.html          — Entry point, CDN imports
├── app.js              — Root component, routing, global state
├── config/
│   └── urls.js         — API helper, base URL
├── lib/
│   ├── preact.js       — Preact/htm re-exports
│   └── [shared].js     — Shared utilities
├── components/
│   └── [Component].js  — Reusable UI components
└── views/
    └── [View].js       — Page-level views
```

### State management

- Global state lives in `app.js` (session, shared data like senders/templates/tags)
- View state lives in each view component
- Persistence: `localStorage` for session, route, and view preferences
- No state library — `useState` and prop passing is sufficient for 3-user tools

### Code style

- ES5 (`var`, `function(){}`) in view components for consistency
- Modern (`const`, `=>`) acceptable in `app.js` and utilities
- No `let` — use `var` or `const`

---

## Separation of Concerns

From PROJECT_PROTOCOL.md — every component must answer YES to:

1. **Can it function by itself?**
2. **Can it stand by itself?** (no hidden dependencies)
3. **Can it fail by itself?** (failure doesn't cascade)

### In practice

- **Views**: Each view loads its own data and manages its own state
- **Components**: Receive all data via props, never call APIs directly (except modals that create inline)
- **Modals**: Extracted into standalone component files, not inlined in views
- **Shared logic**: Extracted to `lib/` (e.g., `email-render.js`, `tag-colors.js`)
- **n8n workflows**: One workflow per concern (API, email send, image serve, bounce handler, import)
