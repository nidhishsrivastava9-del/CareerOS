import dotenv from 'dotenv';
import mongoose from 'mongoose';
import AssessmentAttempt from './models/AssessmentAttempt.js';

dotenv.config({ path: './backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const attempts = await AssessmentAttempt.find().lean();
  console.log('Total attempts in DB:', attempts.length);
  attempts.forEach(a => {
    console.log('ID:', a.attemptId, 'User:', a.user, 'Career in attempt:', JSON.stringify(a.career), 'Module:', a.module);
  });
  await mongoose.disconnect();
}

check();
