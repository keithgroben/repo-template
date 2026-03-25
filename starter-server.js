// ─── Hono API Starter ────────────────────────────────────
// Copy this into server/index.js and customize for your app.
// Run: node server/index.js (or npm start)

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { createClient } from '@supabase/supabase-js';

// ─── Config ──────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

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
// Attaches authenticated user to c.get('user').
//
// Usage: app.use('/api/*', authMiddleware);
async function authMiddleware(c, next) {
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

    c.set('user', user);
    c.set('sbUser', sbUser); // RLS-scoped client for this request
    await next();
}

// ─── PIN Auth Middleware (alternative) ───────────────────
// For internal tools that use a shared PIN instead of Supabase Auth.
// Set APP_PIN in .env. SPA sends it as x-app-pin header.
//
// Usage: app.use('/api/*', pinAuthMiddleware);
async function pinAuthMiddleware(c, next) {
    const pin = c.req.header('x-app-pin');
    if (!pin || pin !== process.env.APP_PIN) {
        return c.json({ error: 'Invalid PIN' }, 401);
    }
    await next();
}

// ─── Health Check ────────────────────────────────────────
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Protected API Routes ────────────────────────────────
// Pick one auth middleware and apply it:
// app.use('/api/*', authMiddleware);      // Supabase JWT
// app.use('/api/*', pinAuthMiddleware);   // Shared PIN

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

// ─── Email Sending (Resend) ─────────────────────────────
//
// async function sendEmail({ to, subject, html }) {
//     const res = await fetch('https://api.resend.com/emails', {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             from: process.env.RESEND_FROM || 'noreply@example.com',
//             to, subject, html,
//         }),
//     });
//     if (!res.ok) {
//         const err = await res.json();
//         throw new Error(`Resend error: ${err.message}`);
//     }
//     return res.json();
// }

// ─── Multi-Step Transactions ────────────────────────────
// For operations that need to query, decide, then update.
//
// app.post('/api/process-order', async (c) => {
//     const { orderId } = await c.req.json();
//
//     const { data: order } = await sbAdmin
//         .from('orders').select('*').eq('id', orderId).single();
//
//     if (!order) return c.json({ error: 'Not found' }, 404);
//
//     const approved = order.total < 1000;
//     const { data: updated } = await sbAdmin
//         .from('orders')
//         .update({ status: approved ? 'approved' : 'review', processed_at: new Date().toISOString() })
//         .eq('id', orderId).select().single();
//
//     return c.json(updated);
// });
//
// For truly atomic operations, use a PG function:
// const { data } = await sbAdmin.rpc('process_order', { p_order_id: orderId });

// ─── Scheduled Jobs ─────────────────────────────────────
// npm install node-cron
//
// import cron from 'node-cron';
//
// cron.schedule('0 17 * * 5', async () => {  // Every Friday at 5pm
//     console.log('[cron] Friday job running');
//     try { /* your logic */ } catch (err) { console.error('[cron] Failed:', err.message); }
// });
//
// cron.schedule('* * * * *', async () => {  // Polling pattern (every 60s)
//     const { data: jobs } = await sbAdmin
//         .from('job_queue').select('*').eq('status', 'pending').limit(5);
//     for (const job of (jobs || [])) {
//         try {
//             // Process job...
//             await sbAdmin.from('job_queue').update({ status: 'done' }).eq('id', job.id);
//         } catch (err) {
//             await sbAdmin.from('job_queue').update({ status: 'failed', error: err.message }).eq('id', job.id);
//         }
//     }
// });

// ─── Error Handler ───────────────────────────────────────
app.onError((err, c) => {
    console.error(`[error] ${c.req.method} ${c.req.path}:`, err.message);
    return c.json({ error: 'Internal server error' }, 500);
});

// ─── 404 Handler ─────────────────────────────────────────
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// ─── Start Server ────────────────────────────────────────
const server = serve({ fetch: app.fetch, port: PORT }, () => {
    console.log(`[hono] API server running on port ${PORT}`);
});

// ─── Graceful Shutdown ──────────────────────────────────
function shutdown(signal) {
    console.log(`[hono] ${signal} received, shutting down gracefully...`);
    server.close(() => {
        console.log('[hono] Server closed.');
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
