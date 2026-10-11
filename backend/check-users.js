import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config({ path: './backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find().select('name email createdAt').lean();
  console.log('Total users:', users.length);
  users.forEach(u => console.log(u));
  await mongoose.disconnect();
}

check();
