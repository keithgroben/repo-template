# ─── Build stage: Vite SPA ────────────────────────────────
FROM node:22-alpine AS build

# Vite inlines VITE_* vars at build time — pass them as build args.
# docker-compose.yml maps these from .env automatically.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_BASE_PATH=/

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ─── Production stage: Hono API server ────────────────────
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm install tsx && chown -R node:node /app

COPY --chown=node:node server/ ./server/
COPY --from=build --chown=node:node /app/dist ./dist/

USER node
EXPOSE 3000
CMD ["npx", "tsx", "server/index.ts"]
