// Fetch wrapper for Hono API calls.
// In dev, Vite proxies /api/* to localhost:3000.
// In production, Caddy proxies /api/* to the Hono container.

const API_BASE = '';  // Same origin — no need to specify host

interface ApiOptions {
    method?: string;
    body?: unknown;
    token?: string;
}

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, token } = options;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
    return data as T;
}

// Convenience methods
export const get    = <T = unknown>(path: string, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'GET' });
export const post   = <T = unknown>(path: string, body: unknown, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'POST', body });
export const put    = <T = unknown>(path: string, body: unknown, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'PUT', body });
export const del    = <T = unknown>(path: string, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'DELETE' });
