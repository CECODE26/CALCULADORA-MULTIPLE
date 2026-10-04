# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────
# Imagen de producción multi-etapa (Next.js standalone).
# Las variables NEXT_PUBLIC_* se incrustan en el build: se pasan
# como build args desde docker-compose (que las lee de .env).
# ─────────────────────────────────────────────────────────────
ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_NAME
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SITE_DESCRIPTION
ARG NEXT_PUBLIC_DEFAULT_LOCALE
ARG NEXT_PUBLIC_DEFAULT_CURRENCY
ARG NEXT_PUBLIC_CONTACT_EMAIL
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_ADSENSE_CLIENT_ID
ARG NEXT_PUBLIC_ADS_ENABLED
ARG NEXT_PUBLIC_AD_SLOT_TOOL_IN_CONTENT
ARG NEXT_PUBLIC_AD_SLOT_TOOL_BOTTOM
ARG NEXT_PUBLIC_AD_SLOT_LISTING
ARG NEXT_PUBLIC_REQUIRE_CONSENT
ARG NEXT_PUBLIC_CONSENT_PROVIDER
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Los tests matemáticos se ejecutan también al construir la imagen:
# si una fórmula se rompe, no se despliega.
RUN npm test && npm run build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
