import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    // Set base to '/<appname>/' for apps served at a subpath via Caddy handle_path.
    // Caddy strips the prefix, but the browser needs correct asset URLs.
    // Leave as '/' for apps served at the root domain.
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [
        preact(),
        tailwindcss(),
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': { target: 'http://localhost:3000', changeOrigin: true },
            '/webhook': { target: 'http://localhost:3000', changeOrigin: true },
            '/health': { target: 'http://localhost:3000', changeOrigin: true },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
