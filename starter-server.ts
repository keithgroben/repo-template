// ─── Hono API Starter ────────────────────────────────────
// Copy this into server/index.ts and customize for your app.
// Run: tsx server/index.ts (or npm start)
//
// In production, this server does TWO jobs:
// 1. Serves the Vite-built SPA from dist/
// 2. Handles /api/* and /webhook/* routes
//
// Global Caddy on r7net routes traffic to this container.
// This server does NOT handle TLS — Caddy does that.

import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from '@hono/node-server/serve-static';
import { serve } from '@hono/node-server';
import { createClient } from '@supabase/supabase-js';

// ─── Config ──────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

// Service-role client — for server-side operations that bypass RLS
const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── App Setup ───────────────────────────────────────────
const app = new Hono();

app.use('*', logger());
app.use('*', cors({
    origin: process.env.CORS_ORIGIN || '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Auth Middleware ─────────────────────────────────────
// Validates Supabase JWT from Authorization header.
// Attaches authenticated user to c.get('user') and a
// user-scoped Supabase client to c.get('sbUser').
//
// Usage: app.use('/api/*', authMiddleware);
async function authMiddleware(c: Context, next: Next) {
    const header = c.req.header('Authorization');
    if (!header?.startsWith('Bearer ')) {
        return c.json({ error: 'Missing or invalid Authorization header' }, 401);
    }

    const token = header.slice(7);

    // Create a client scoped to this user's JWT — respects RLS
    const sbUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error } = await sbUser.auth.getUser(token);
    if (error || !user) {
        return c.json({ error: 'Invalid or expired token' }, 401);
    }

    // Fetch profile for role-based access
    const { data: profile } = await sbAdmin
        .from('profiles')
        .select('id, role, name')
        .eq('id', user.id)
        .single();

    c.set('user', user);
    c.set('profile', profile);
    c.set('sbUser', sbUser); // RLS-scoped client for this request
    c.set('isAdmin', profile?.role === 'owner' || profile?.role === 'admin');
    await next();
}

// ─── PIN Auth Middleware (alternative) ───────────────────
// For internal tools that use a shared PIN instead of Supabase Auth.
// Set APP_PIN in .env. SPA sends it as x-app-pin header.
//
// Usage: app.use('/api/*', pinAuthMiddleware);
async function pinAuthMiddleware(c: Context, next: Next) {
    const pin = c.req.header('x-app-pin');
    if (!pin || pin !== process.env.APP_PIN) {
        return c.json({ error: 'Invalid PIN' }, 401);
    }
    await next();
}

// ─── Health Check ────────────────────────────────────────
app.get('/health', (c) => c.json({
    status: 'ok',
    app: 'app-name',  // ← Change to your app name
    timestamp: new Date().toISOString(),
}));

// ─── Protected API Routes ────────────────────────────────
// Pick one auth middleware and apply it:
app.use('/api/*', authMiddleware);
// app.use('/api/*', pinAuthMiddleware);   // Shared PIN (internal tools)

// Example: List items
app.get('/api/items', async (c) => {
    const { data, error } = await sbAdmin
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
});

// Example: Create item
app.post('/api/items', async (c) => {
    const body = await c.req.json();
    const { data, error } = await sbAdmin
        .from('items')
        .insert(body)
        .select()
        .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data, 201);
});

// Example: Update item
app.put('/api/items/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { data, error } = await sbAdmin
        .from('items')
        .update(body)
        .eq('id', id)
        .select()
        .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
});

// Example: Delete item
app.delete('/api/items/:id', async (c) => {
    const id = c.req.param('id');
    const { error } = await sbAdmin
        .from('items')
        .delete()
        .eq('id', id);

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ deleted: true });
});

// ─── Webhook Endpoints ──────────────────────────────────
// External services can POST to /webhook/* routes.
//
// app.post('/webhook/bounce', async (c) => {
//     const event = await c.req.json();
//     if (event.type === 'email.bounced') {
//         await sbAdmin.from('email_events').insert({
//             email: event.data.to,
//             event_type: 'bounce',
//             payload: event,
//         });
//     }
//     return c.json({ ok: true });
// });

// ─── Scheduled Jobs ─────────────────────────────────────
// npm install node-cron
//
// import cron from 'node-cron';
//
// cron.schedule('0 17 * * 5', async () => {  // Every Friday at 5pm
//     console.log('[cron] Friday job running');
//     try { /* your logic */ } catch (err) { console.error('[cron] Failed:', (err as Error).message); }
// });

// ─── Error Handler ───────────────────────────────────────
app.onError((err, c) => {
    console.error(`[error] ${c.req.method} ${c.req.path}:`, err.message);
    return c.json({ error: 'Internal server error' }, 500);
});

// ─── Static Files (Vite build) ───────────────────────────
// In production, Hono serves the built SPA from dist/.
// Caddy's handle_path strips the app's path prefix (e.g., /porkchop/),
// so Hono receives clean paths (e.g., /assets/index.js).
app.use('/assets/*', serveStatic({ root: './dist' }));

// SPA fallback — any non-API, non-asset request gets index.html
// This enables client-side hash routing (#/home, #/settings, etc.)
app.get('*', serveStatic({ root: './dist', path: 'index.html' }));

app.notFound((c) => c.json({ error: 'Not found' }, 404));

// ─── Start Server ────────────────────────────────────────
const server = serve({ fetch: app.fetch, port: PORT }, () => {
    console.log(`[hono] API server running on port ${PORT}`);
});

// ─── Graceful Shutdown ──────────────────────────────────
function shutdown(signal: string) {
    console.log(`[hono] ${signal} received, shutting down gracefully...`);
    server.close(() => {
        console.log('[hono] Server closed.');
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
