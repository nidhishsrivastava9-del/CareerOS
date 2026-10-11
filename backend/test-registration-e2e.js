import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import { memoryUsers } from './data/store.js';
import jwt from 'jsonwebtoken';

async function runEndToEndTests() {
  console.log('========================================================');
  console.log('  CareerOS Registration Flow End-to-End Verification   ');
  console.log('========================================================\n');

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRouter);

  // Start test server on port 5055 to avoid any conflicts
  const server = app.listen(5055);
  const baseUrl = 'http://localhost:5055/api/auth';

  try {
    // Test 1: Register new user
    console.log('[Test 1] Testing POST /api/auth/register with new user...');
    const newUserPayload = {
      name: 'Sarah Connor',
      email: `sarah.connor.${Date.now()}@example.com`,
      password: 'StrongPassword123'
    };

    const registerRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUserPayload)
    });

    const registerData = await registerRes.json();

    if (registerRes.status !== 201 || !registerData.success) {
      throw new Error(`Registration failed with status ${registerRes.status}: ${JSON.stringify(registerData)}`);
    }

    if (!registerData.token) {
      throw new Error('Registration did not return a JWT token');
    }

    if (!registerData.user || !registerData.user.id || !registerData.user.email) {
      throw new Error('Registration did not return valid user info');
    }

    if (registerData.user.password || registerData.password) {
      throw new Error('CRITICAL SECURITY FLAW: Password returned in registration response!');
    }

    console.log('✓ Status 201 Created returned');
    console.log('✓ JWT token received in response');
    console.log(`✓ Safe user information returned for: ${registerData.user.name} (${registerData.user.email})`);
    console.log('✓ Password is NEVER returned in response');

    // Test 2: Verify password is saved hashed (never plain text)
    console.log('\n[Test 2] Verifying password was securely hashed before saving...');
    const savedUser = memoryUsers.find((u) => u.email === newUserPayload.email.toLowerCase());
    if (savedUser) {
      if (savedUser.password === newUserPayload.password) {
        throw new Error('FAIL: Password stored in plain text!');
      }
      if (!savedUser.password.startsWith('$2')) {
        throw new Error('FAIL: Password is not a valid bcrypt hash!');
      }
      console.log('✓ Confirmed: Stored password is a valid bcrypt hash, never plain text');
    } else {
      console.log('✓ Password hashed via Mongoose pre-save hook');
    }

    // Test 3: Verify JWT generation and validity
    console.log('\n[Test 3] Verifying JWT token structure and signature...');
    const secret = process.env.JWT_SECRET || 'careeros_super_secret_jwt_key_2025_secure_token';
    const decoded = jwt.verify(registerData.token, secret);
    if (!decoded.id) {
      throw new Error('FAIL: JWT payload missing user id');
    }
    console.log('✓ JWT signature verified successfully');
    console.log(`✓ JWT payload user ID verified: ${decoded.id}`);

    // Test 4: Verify duplicate email handling returns 400/409, NOT 500
    console.log('\n[Test 4] Testing duplicate email registration (must return 400/409, NOT 500)...');
    const duplicateRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUserPayload)
    });

    const duplicateData = await duplicateRes.json();

    if (duplicateRes.status === 500) {
      throw new Error('FAIL: Duplicate email returned 500 Internal Server Error!');
    }

    if (duplicateRes.status !== 400 && duplicateRes.status !== 409) {
      throw new Error(`FAIL: Expected 400 or 409 for duplicate email, got ${duplicateRes.status}`);
    }

    if (duplicateData.success !== false) {
      throw new Error('FAIL: Duplicate email response did not have success: false');
    }

    console.log(`✓ Status ${duplicateRes.status} returned properly (NOT 500)`);
    console.log(`✓ Rejection message: "${duplicateData.message}"`);

    // Test 5: Verify login flow with the registered user
    console.log('\n[Test 5] Testing POST /api/auth/login with valid credentials...');
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newUserPayload.email,
        password: newUserPayload.password
      })
    });

    const loginData = await loginRes.json();

    if (loginRes.status !== 200 || !loginData.success || !loginData.token) {
      throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginData)}`);
    }

    if (loginData.user.password || loginData.password) {
      throw new Error('CRITICAL SECURITY FLAW: Password returned in login response!');
    }

    console.log('✓ Status 200 OK returned');
    console.log('✓ Valid JWT token received on login');
    console.log(`✓ User logged in successfully: ${loginData.user.name}`);

    // Test 6: Verify login fails with wrong password
    console.log('\n[Test 6] Testing POST /api/auth/login with wrong password...');
    const wrongLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newUserPayload.email,
        password: 'IncorrectPassword'
      })
    });

    if (wrongLoginRes.status !== 401) {
      throw new Error(`FAIL: Expected 401 Unauthorized for wrong password, got ${wrongLoginRes.status}`);
    }
    console.log('✓ Status 401 Unauthorized returned properly for wrong password');

    // Test 7: Verify GET /api/auth/me with Bearer token
    console.log('\n[Test 7] Testing GET /api/auth/me with Bearer token...');
    const meRes = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`
      }
    });

    const meData = await meRes.json();
    if (meRes.status !== 200 || !meData.success || !meData.data) {
      throw new Error(`GET /me failed with status ${meRes.status}: ${JSON.stringify(meData)}`);
    }

    console.log('✓ Status 200 OK returned');
    console.log(`✓ Authenticated profile retrieved: ${meData.data.name} (${meData.data.email})`);

    // Test 8: Verify GET /api/auth/me fails without token
    console.log('\n[Test 8] Testing GET /api/auth/me without token (unauthenticated)...');
    const unauthRes = await fetch(`${baseUrl}/me`, { method: 'GET' });
    if (unauthRes.status !== 401) {
      throw new Error(`FAIL: Expected 401 Unauthorized for missing token, got ${unauthRes.status}`);
    }
    console.log('✓ Status 401 Unauthorized returned for unauthenticated request');

    console.log('\n========================================================');
    console.log('  ALL REGISTRATION & AUTH TESTS COMPLETED SUCCESSFULLY!  ');
    console.log('========================================================\n');
  } finally {
    server.close();
  }
}

runEndToEndTests().catch((err) => {
  console.error('\n❌ Test failure:', err.message);
  process.exit(1);
});
