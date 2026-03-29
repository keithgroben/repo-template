# ─── Build stage: Vite SPA ────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src/ ./src/
RUN npm run build

# ─── Production stage: Hono API server ────────────────────
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && chown -R node:node /app

COPY --chown=node:node server/ ./server/
COPY --from=build --chown=node:node /app/dist ./dist/

USER node
EXPOSE 3000
CMD ["node", "server/index.js"]
