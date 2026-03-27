# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

RUN npm ci --workspace=backend --workspace=shared --ignore-scripts

COPY shared/ ./shared/
COPY backend/ ./backend/

RUN npm run build --workspace=shared

RUN npm run db:generate --workspace=backend
RUN npm run build --workspace=backend

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Required for Prisma to connect over SSL on Alpine
RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

RUN npm ci --workspace=backend --workspace=shared --omit=dev --ignore-scripts

COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

COPY backend/prisma ./backend/prisma

EXPOSE 3001

CMD ["node", "backend/dist/backend/src/index.js"]