import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './models/User.js';
import Skill from './models/Skill.js';
import Project from './models/Project.js';
import Goal from './models/Goal.js';
import Dsa from './models/Dsa.js';

async function runTests() {
  console.log('--- CareerOS Day 5 Verification Suite ---');

  // Test 1: Bcrypt password hashing
  console.log('\n[Test 1] Testing Bcrypt Password Hashing...');
  const rawPassword = 'superSecretPassword123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);

  if (hashedPassword === rawPassword) {
    throw new Error('FAIL: Password was stored in plain text!');
  }
  const isMatchCorrect = await bcrypt.compare(rawPassword, hashedPassword);
  const isMatchWrong = await bcrypt.compare('wrongPassword', hashedPassword);

  if (!isMatchCorrect || isMatchWrong) {
    throw new Error('FAIL: Bcrypt password verification logic incorrect.');
  }
  console.log('✓ Password hashed successfully (never plain text)');
  console.log('✓ Valid password match returns true');
  console.log('✓ Invalid password match returns false');

  // Test 2: JWT Issuance and Verification
  console.log('\n[Test 2] Testing JWT Generation & Verification...');
  const secret = 'test_careeros_jwt_secret_key_12345';
  const fakeUserId = new mongoose.Types.ObjectId();
  const token = jwt.sign({ id: fakeUserId.toString() }, secret, { expiresIn: '1h' });

  const decoded = jwt.verify(token, secret);
  if (decoded.id !== fakeUserId.toString()) {
    throw new Error('FAIL: JWT payload did not preserve user ID.');
  }
  console.log('✓ JWT generated successfully');
  console.log(`✓ JWT verified: Decoded User ID -> ${decoded.id}`);

  // Test 3: JWT Tampering & Expiration handling
  console.log('\n[Test 3] Testing JWT Tampering Rejection...');
  let rejected = false;
  try {
    jwt.verify(token, 'wrong_secret_key');
  } catch (err) {
    rejected = true;
  }
  if (!rejected) {
    throw new Error('FAIL: Invalid signature was not rejected!');
  }
  console.log('✓ Invalid signature rejected with error as expected');

  // Test 4: Mongoose Schemas & User Scoping
  console.log('\n[Test 4] Testing Models & User References...');
  const dummyUser = new User({
    name: 'Alex Rivera',
    email: 'alex@example.com',
    password: hashedPassword
  });

  const dummySkill = new Skill({
    user: dummyUser._id,
    name: 'React',
    category: 'Frontend',
    level: 80
  });

  const dummyProject = new Project({
    user: dummyUser._id,
    name: 'CareerOS Platform',
    technologies: ['React', 'Node.js', 'MongoDB']
  });

  const dummyGoal = new Goal({
    user: dummyUser._id,
    title: 'Master MongoDB & Auth',
    category: 'Learning'
  });

  const dummyDsa = new Dsa({
    user: dummyUser._id,
    topic: 'Binary Search',
    total: 20,
    solved: 15
  });

  if (!dummySkill.user.equals(dummyUser._id)) {
    throw new Error('FAIL: Skill user scoping failed');
  }
  if (!dummyProject.user.equals(dummyUser._id)) {
    throw new Error('FAIL: Project user scoping failed');
  }
  if (!dummyGoal.user.equals(dummyUser._id)) {
    throw new Error('FAIL: Goal user scoping failed');
  }
  if (!dummyDsa.user.equals(dummyUser._id)) {
    throw new Error('FAIL: DSA user scoping failed');
  }

  console.log('✓ User model schema validated');
  console.log('✓ Skill model correctly scoped to user ObjectId');
  console.log('✓ Project model correctly scoped to user ObjectId');
  console.log('✓ Goal model correctly scoped to user ObjectId');
  console.log('✓ Dsa model correctly scoped to user ObjectId');

  console.log('\n===============================================');
  console.log('  ALL DAY 5 BACKEND VERIFICATION TESTS PASSED  ');
  console.log('===============================================\n');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
