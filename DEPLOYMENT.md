# CareerOS — Production Deployment & Operations Guide (Day 12)

This guide documents the production deployment architecture, security hardening, containerization, and operations procedures for **CareerOS**.

---

## 1. System Architecture & Container Topology

```text
               Internet HTTPS (Port 443) / HTTP (Port 80)
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │               Nginx Reverse Proxy & Static             │
       │               Web Server (careeros-frontend)           │
       │                                                        │
       │  • Serves minified React/Vite SPA bundle (/usr/share/…) │
       │  • Gzip compression (level 6) for fast asset delivery  │
       │  • 1-Year immutable caching for /assets/* bundles      │
       │  • SPA fallback routing: try_files $uri /index.html    │
       │  • Reverse proxies /api/* to backend service           │
       │  • Security headers (X-Frame-Options, X-Content-Type)  │
       └────────────────────────────┬───────────────────────────┘
                                    │ Reverse Proxy (Internal Bridge)
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │             Node.js REST API (careeros-backend)        │
       │                                                        │
       │  • Port 5000 (Internal non-root user: node)            │
       │  • Express 4.x runtime on Node.js 20 LTS Alpine        │
       │  • Helmet.js Content Security Policy & XSS guards      │
       │  • Rate Limiting: General (600/15m), Auth (30/15m),    │
       │    AI generation (60/1m)                               │
       │  • Health check: GET /api/health (exempt from limits)  │
       └────────────────────────────┬───────────────────────────┘
                                    │ Mongoose (Replica Set / TLS)
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │            Database: MongoDB Atlas / Container         │
       │                                                        │
       │  • Production: MongoDB Atlas M10+ Cloud Replica Set    │
       │  • Local Staging: mongo:7.0 container with data volume │
       │  • Automated compound indexing on user-scoped records  │
       └────────────────────────────────────────────────────────┘
```

---

## 2. Environment Variables Configuration

Create a production `.env` file inside `backend/.env`. **Never commit `.env` to source control.**

| Variable | Description | Example / Recommendation |
|---|---|---|
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Backend listener port | `5000` |
| `MONGO_URI` | MongoDB connection URI | `mongodb+srv://user:pass@cluster.mongodb.net/careeros?retryWrites=true&w=majority` |
| `JWT_SECRET` | Cryptographic secret for signing JWTs | Strong 64-char random hex string (`openssl rand -hex 32`) |
| `FRONTEND_URL` | Canonical frontend domain for links | `https://careeros.yourdomain.com` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `https://careeros.yourdomain.com,https://api.careeros.yourdomain.com` |
| `AI_PROVIDER` | AI mentoring engine provider | `gemini` (or `mock` for local staging) |
| `AI_API_KEY` | Google Gemini API Key | Secret API key from Google AI Studio |
| `EMBEDDING_PROVIDER` | Vector embedding engine | `gemini` (or `mock` for local staging) |
| `RATE_LIMIT_WINDOW_MS` | General rate limit window | `900000` (15 minutes in ms) |
| `RATE_LIMIT_MAX` | Max requests per IP in window | `600` |

---

## 3. Quick Start: Deploying with Docker Compose

### Step 1: Clone Repository & Configure Environment
```bash
git clone https://github.com/your-org/careeros.git
cd careeros

# Copy backend environment template and populate credentials
cp backend/.env.example backend/.env
# Edit backend/.env with production credentials
nano backend/.env
```

### Step 2: Build & Start All Containers
```bash
docker compose up -d --build
```

### Step 3: Verify Container Health
```bash
docker compose ps
```
Both `careeros-frontend` and `careeros-backend` should report status `Up (healthy)`.

### Step 4: Verify Live System Endpoints
```bash
# Frontend health
curl -I http://localhost/

# Backend health
curl -s http://localhost:5000/api/health
```

---

## 4. Production Domain & SSL/TLS (Let's Encrypt) Setup

When deploying to a public VPS (e.g. AWS EC2, DigitalOcean Droplet, GCP Compute):

### Option A: Certbot on Host Reverse Proxy
```bash
# 1. Install Certbot and Nginx
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# 2. Configure host Nginx to proxy to Docker container (port 80 -> 8080 or directly)
# 3. Obtain free SSL certificate:
sudo certbot --nginx -d careeros.yourdomain.com -d api.careeros.yourdomain.com

# 4. Automatic renewal check:
sudo certbot renew --dry-run
```

---

## 5. Security & Hardening Checklist

- [x] **Helmet Security Headers**: Active with strict CSP allowing verified YouTube embeds (`youtube-nocookie.com`).
- [x] **Rate Limiting**:
  - General API: 600 requests per 15 minutes.
  - Authentication (`/api/auth/login`, `/api/auth/register`): 30 attempts per 15 minutes to block brute-force.
  - Helping AI (`/api/ai/chat`, `/api/ai/quick-action`): 60 requests per minute to prevent token exhaustion.
- [x] **CORS Whitelisting**: Strict origin validation rejecting unapproved origins.
- [x] **Non-Root Execution**: Docker containers run as unprivileged `node` user in backend and unprivileged `nginx` in frontend.
- [x] **Secrets Isolation**: No secrets committed to Git; checked by CI/CD secrets audit.
- [x] **User Isolation**: Every database query scoped strictly to `req.user._id` verified via JWT.

---

## 6. Zero-Downtime Rolling Updates

To deploy code updates without downtime:
```bash
# 1. Pull latest code
git pull origin master

# 2. Build new image versions in parallel
docker compose build

# 3. Roll out updated backend first
docker compose up -d --no-deps backend

# 4. Wait for health check confirmation
docker compose ps

# 5. Roll out updated frontend
docker compose up -d --no-deps frontend
```

---

## 7. Database Backup & Disaster Recovery

### Manual MongoDB Dump:
```bash
# Backup MongoDB Atlas directly to compressed archive
mongodump --uri="<MONGO_URI>" --gzip --archive=backup-careeros-$(date +%F).gz
```

### Restore MongoDB Backup:
```bash
mongorestore --uri="<MONGO_URI>" --gzip --archive=backup-careeros-2026-10-11.gz --drop
```

### Automated Nightly Backup Cron:
```bash
0 2 * * * mongodump --uri="$MONGO_URI" --gzip --archive=/backups/careeros-$(date +\%F).gz && find /backups -name "careeros-*.gz" -mtime +14 -delete
```

---

## 8. Monitoring & Maintenance

- **Health Endpoint**: `GET /api/health` monitors database connectivity and server status.
- **Log Inspection**:
  ```bash
  # View live tail of backend container
  docker compose logs -f backend

  # View live tail of frontend web server
  docker compose logs -f frontend
  ```
- **Container Resource Utilization**:
  ```bash
  docker stats careeros-frontend careeros-backend careeros-mongodb
  ```
