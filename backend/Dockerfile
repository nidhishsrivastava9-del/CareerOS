# ==============================================================================
# CareerOS Backend — Production Multi-Stage Dockerfile (Day 12)
# Multi-stage lightweight Node.js LTS Alpine container with non-root execution
# ==============================================================================

# Stage 1: Build & Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app

# Install build essentials if native modules needed
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install curl for container health checks
RUN apk add --no-cache curl

# Copy production node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

# Ensure secure non-root permissions
RUN chown -R node:node /app
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
