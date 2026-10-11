import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Career from './models/Career.js';
import AssessmentAttempt from './models/AssessmentAttempt.js';
import Progress from './models/Progress.js';
import SkillMastery from './models/SkillMastery.js';

dotenv.config();

async function checkMongo() {
  const mongoUri = process.env.MONGO_URI;
  console.log('Connecting to MongoDB...');
  if (!mongoUri) {
    console.log('No MONGO_URI');
    return;
  }
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB connected successfully!');

  const career = await Career.findOne({ slug: 'full-stack-developer' }).lean();
  console.log('Career found:', !!career);
  if (career) {
    console.log('Career title:', career.title);
    console.log('Phases count:', career.roadmapPhases?.length);
    if (career.roadmapPhases?.length > 0) {
      const p0 = career.roadmapPhases[0];
      console.log('Phase 0 title:', p0.title, 'subjects:', p0.subjects?.length);
      if (p0.subjects?.length > 0) {
        const s0 = p0.subjects[0];
        console.log('Subject 0 title:', s0.title, 'modules:', s0.modules?.length);
        if (s0.modules?.length > 0) {
          console.log('Module 0:', s0.modules[0]);
        }
      }
    }
  }

  const attempts = await AssessmentAttempt.find().sort({ createdAt: -1 }).limit(3).lean();
  console.log('\nRecent Assessment Attempts in DB:', attempts.length);
  attempts.forEach((a, idx) => {
    console.log(`\nAttempt ${idx + 1}:`);
    console.log('Assessment:', a.assessmentTitle, 'user:', a.user, 'score:', a.score, 'percentage:', a.percentage);
    console.log('Recommendations in DB:');
    console.log(JSON.stringify(a.recommendations, null, 2));
  });

  await mongoose.disconnect();
}

checkMongo().catch(err => {
  console.error('Mongo Error:', err.message);
  process.exit(0);
});
