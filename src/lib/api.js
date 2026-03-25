// Fetch wrapper for Hono API calls.
// In dev, Vite proxies /api/* to localhost:3001.
// In production, Caddy proxies /api/* to the Hono container.

const API_BASE = '';  // Same origin — no need to specify host

export async function api(path, options = {}) {
    const { method = 'GET', body, token } = options;

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
    return data;
}

// Convenience methods
export const get    = (path, opts) => api(path, { ...opts, method: 'GET' });
export const post   = (path, body, opts) => api(path, { ...opts, method: 'POST', body });
export const put    = (path, body, opts) => api(path, { ...opts, method: 'PUT', body });
export const del    = (path, opts) => api(path, { ...opts, method: 'DELETE' });
