# ==============================================================================
# CareerOS Frontend — Production Multi-Stage Dockerfile (Day 12)
# Stage 1: Vite production build
# Stage 2: High-performance Nginx Alpine static web server & reverse proxy
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:1.27-alpine AS runner

# Install curl for container health check
RUN apk add --no-cache curl

# Remove default Nginx welcome site
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy production build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
