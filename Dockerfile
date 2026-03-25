# ─── Build stage: Vite SPA ────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src/ ./src/
RUN npm run build

# ─── Production stage: Hono API server ────────────────────
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY server/ ./server/

# Copy built SPA for Caddy to serve (mounted as volume in docker-compose)
COPY --from=build /app/dist ./dist/

EXPOSE 3001
CMD ["node", "server/index.js"]
