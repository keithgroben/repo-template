import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        preact(),
        tailwindcss(),
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': { target: 'http://localhost:3001', changeOrigin: true },
            '/webhook': { target: 'http://localhost:3001', changeOrigin: true },
            '/health': { target: 'http://localhost:3001', changeOrigin: true },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
