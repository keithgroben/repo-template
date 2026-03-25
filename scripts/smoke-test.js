// Smoke test — verifies the Hono API is responding correctly.
// Usage: npm run smoke (or: node scripts/smoke-test.js)
// Expects the API to be running on the port specified in .env or default 3001.

const BASE = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
let passed = 0;
let failed = 0;

async function test(name, fn) {
    try {
        await fn();
        console.log(`  PASS  ${name}`);
        passed++;
    } catch (err) {
        console.error(`  FAIL  ${name}: ${err.message}`);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

async function run() {
    console.log(`\nSmoke testing ${BASE}\n`);

    await test('GET /health returns 200', async () => {
        const res = await fetch(`${BASE}/health`);
        assert(res.ok, `Expected 200, got ${res.status}`);
        const body = await res.json();
        assert(body.status === 'ok', `Expected status "ok", got "${body.status}"`);
    });

    await test('GET /api/items returns array', async () => {
        const res = await fetch(`${BASE}/api/items`);
        assert(res.ok, `Expected 200, got ${res.status}`);
        const body = await res.json();
        assert(Array.isArray(body), `Expected array, got ${typeof body}`);
    });

    await test('GET unknown route returns 404', async () => {
        const res = await fetch(`${BASE}/nonexistent`);
        assert(res.status === 404, `Expected 404, got ${res.status}`);
    });

    // Add app-specific smoke tests below:
    // await test('POST /api/items creates item', async () => { ... });
    // await test('GET /api/admin/stats requires auth', async () => { ... });

    console.log(`\n${passed} passed, ${failed} failed\n`);
    process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
    console.error('Smoke test crashed:', err.message);
    process.exit(1);
});
