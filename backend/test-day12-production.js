import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:5000/api';

async function runDay12ProductionTestSuite() {
  console.log('================================================================');
  console.log('  CareerOS Day 12: Production Deployment & Polish Test Suite   ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // ========================================================================
    // Part 1: Security Headers Verification (Helmet.js)
    // ========================================================================
    console.log('[Part 1] Testing Production Security Headers (Helmet)...');

    const res = await fetch(`${BASE_URL}/health`);
    assert(res.status === 200, 'GET /api/health returns 200 OK');

    const csp = res.headers.get('content-security-policy');
    assert(Boolean(csp), 'Content-Security-Policy (CSP) header is present');
    assert(csp.includes("default-src 'self'"), "CSP contains default-src 'self'");
    assert(csp.includes('https://www.youtube-nocookie.com'), 'CSP allows privacy-enhanced YouTube embeds');
    assert(csp.includes('https://www.youtube.com'), 'CSP allows YouTube video embeds');

    const xContentType = res.headers.get('x-content-type-options');
    assert(xContentType === 'nosniff', 'X-Content-Type-Options is "nosniff"');

    const xFrameOptions = res.headers.get('x-frame-options');
    assert(xFrameOptions === 'SAMEORIGIN', 'X-Frame-Options is "SAMEORIGIN"');

    const referrerPolicy = res.headers.get('referrer-policy');
    assert(referrerPolicy === 'strict-origin-when-cross-origin', 'Referrer-Policy is strict-origin-when-cross-origin');

    const xPoweredBy = res.headers.get('x-powered-by');
    assert(!xPoweredBy, 'X-Powered-By header is safely suppressed');

    // ========================================================================
    // Part 2: CORS Hardening Verification
    // ========================================================================
    console.log('\n[Part 2] Testing CORS Hardening & Allowed Origins...');

    // Authorized origin (localhost:5173)
    const allowedRes = await fetch(`${BASE_URL}/careers`, {
      headers: {
        Origin: 'http://localhost:5173'
      }
    });
    assert(allowedRes.status === 200, 'GET /api/careers with allowed origin succeeds');
    const allowOriginHeader = allowedRes.headers.get('access-control-allow-origin');
    assert(allowOriginHeader === 'http://localhost:5173', 'Access-Control-Allow-Origin mirrors approved frontend origin');

    // Unauthorized origin rejected
    let rejectedCors = false;
    try {
      const unauthRes = await fetch(`${BASE_URL}/careers`, {
        headers: {
          Origin: 'http://malicious-untrusted-domain.com'
        }
      });
      // In Express CORS, unauthorized origin either returns 500 error or omits allow-origin header
      const corsHeader = unauthRes.headers.get('access-control-allow-origin');
      if (!corsHeader || unauthRes.status >= 400) {
        rejectedCors = true;
      }
    } catch {
      rejectedCors = true;
    }
    assert(rejectedCors, 'Untrusted origin does not receive Access-Control-Allow-Origin header');

    // ========================================================================
    // Part 3: Rate Limiting Verification
    // ========================================================================
    console.log('\n[Part 3] Testing Rate Limiting Configuration & Headers...');

    const rateLimitRes = await fetch(`${BASE_URL}/careers`);
    const rlPolicy = rateLimitRes.headers.get('ratelimit-policy');
    const rlLimit = rateLimitRes.headers.get('ratelimit-limit') || rateLimitRes.headers.get('x-ratelimit-limit');
    assert(Boolean(rlLimit || rlPolicy), 'RateLimit standard headers emitted on API routes');

    // ========================================================================
    // Part 4: Docker Configuration & Syntax Audit
    // ========================================================================
    console.log('\n[Part 4] Auditing Dockerfiles, Nginx, and Compose Artifacts...');

    // 4.1 Backend Dockerfile
    const backendDockerPath = path.join(__dirname, 'Dockerfile');
    assert(fs.existsSync(backendDockerPath), 'backend/Dockerfile exists');
    const backendDockerContent = fs.readFileSync(backendDockerPath, 'utf8');
    assert(backendDockerContent.includes('FROM node:20-alpine'), 'Backend Dockerfile uses node:20-alpine');
    assert(backendDockerContent.includes('USER node'), 'Backend Dockerfile enforces non-root USER node');
    assert(backendDockerContent.includes('HEALTHCHECK'), 'Backend Dockerfile includes HEALTHCHECK instruction');
    assert(backendDockerContent.includes('EXPOSE 5000'), 'Backend Dockerfile exposes port 5000');

    // 4.2 Frontend Dockerfile
    const frontendDockerPath = path.join(ROOT_DIR, 'Dockerfile');
    assert(fs.existsSync(frontendDockerPath), 'Root Dockerfile exists');
    const frontendDockerContent = fs.readFileSync(frontendDockerPath, 'utf8');
    assert(frontendDockerContent.includes('AS builder'), 'Frontend Dockerfile uses multi-stage build (AS builder)');
    assert(frontendDockerContent.includes('nginx'), 'Frontend Dockerfile deploys to Nginx');
    assert(frontendDockerContent.includes('EXPOSE 80'), 'Frontend Dockerfile exposes port 80');

    // 4.3 Nginx Configuration
    const nginxPath = path.join(ROOT_DIR, 'nginx.conf');
    assert(fs.existsSync(nginxPath), 'nginx.conf exists');
    const nginxContent = fs.readFileSync(nginxPath, 'utf8');
    assert(nginxContent.includes('try_files $uri $uri/ /index.html;'), 'nginx.conf contains SPA routing fallback');
    assert(nginxContent.includes('gzip on;'), 'nginx.conf enables gzip compression');
    assert(nginxContent.includes('proxy_pass http://backend:5000/api/;'), 'nginx.conf reverse proxies /api/ to backend');
    assert(nginxContent.includes('expires 1y;'), 'nginx.conf configures immutable asset caching');

    // 4.4 Docker Compose
    const composePath = path.join(ROOT_DIR, 'docker-compose.yml');
    assert(fs.existsSync(composePath), 'docker-compose.yml exists');
    const composeContent = fs.readFileSync(composePath, 'utf8');
    assert(composeContent.includes('services:'), 'docker-compose.yml contains services');
    assert(composeContent.includes('frontend:'), 'docker-compose.yml defines frontend service');
    assert(composeContent.includes('backend:'), 'docker-compose.yml defines backend service');
    assert(composeContent.includes('mongodb:'), 'docker-compose.yml defines mongodb service');
    assert(composeContent.includes('careeros-network:'), 'docker-compose.yml defines custom bridge network');

    // 4.5 .dockerignore files
    assert(fs.existsSync(path.join(ROOT_DIR, '.dockerignore')), 'Root .dockerignore exists');
    assert(fs.existsSync(path.join(__dirname, '.dockerignore')), 'backend/.dockerignore exists');

    // ========================================================================
    // Part 5: CI/CD Pipeline & Secrets Hygiene Audit
    // ========================================================================
    console.log('\n[Part 5] Auditing CI/CD Workflow & Repository Security...');

    const workflowPath = path.join(ROOT_DIR, '.github', 'workflows', 'ci-cd.yml');
    assert(fs.existsSync(workflowPath), '.github/workflows/ci-cd.yml exists');
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    assert(workflowContent.includes('test-backend:'), 'CI/CD pipeline includes test-backend job');
    assert(workflowContent.includes('build-frontend:'), 'CI/CD pipeline includes build-frontend job');
    assert(workflowContent.includes('security-audit:'), 'CI/CD pipeline includes security-audit job');

    // Check .gitignore covers sensitive credentials
    const gitignorePath = path.join(ROOT_DIR, '.gitignore');
    assert(fs.existsSync(gitignorePath), '.gitignore exists');
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    assert(gitignoreContent.includes('.env'), '.gitignore excludes .env files');
    assert(gitignoreContent.includes('node_modules'), '.gitignore excludes node_modules');

    // Check DEPLOYMENT.md
    const deploymentPath = path.join(ROOT_DIR, 'DEPLOYMENT.md');
    assert(fs.existsSync(deploymentPath), 'DEPLOYMENT.md production guide exists');

    console.log('\n================================================================');
    console.log(`  DAY 12 TEST RESULT: All ${passed} checks PASSED! (${failed} failed)`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n[Day 12 Test Failure]:', err.message);
    process.exit(1);
  }
}

runDay12ProductionTestSuite();
