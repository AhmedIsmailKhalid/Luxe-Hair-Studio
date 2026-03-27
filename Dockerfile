# ─── Stage 1: Build ───────────────────────────────────────────────────────────
# Should be placed at the monorepo ROOT (same level as backend/, frontend/, shared/)
FROM node:22-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Install ALL workspace dependencies from root
# This resolves the backend → shared symlink correctly
RUN npm ci --workspace=backend --workspace=shared --ignore-scripts

# Copy source for the workspaces we need
COPY shared/ ./shared/
COPY backend/ ./backend/

# Build shared first (backend depends on it)
RUN npm run build --workspace=shared

# Generate Prisma client and build backend
RUN npm run db:generate --workspace=backend
RUN npm run build --workspace=backend

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Production deps only
RUN npm ci --workspace=backend --workspace=shared --omit=dev --ignore-scripts

# Copy built artifacts from builder
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema (needed at runtime for migrations)
COPY backend/prisma ./backend/prisma

# Cloud Run injects PORT at runtime — Express must bind to it
# Default 3001 for local docker run testing
EXPOSE 3001

# Run from backend dist entry point
# Adjust if your compiled entry is named differently (check backend/tsconfig.json outDir)
CMD ["node", "backend/dist/index.js"]