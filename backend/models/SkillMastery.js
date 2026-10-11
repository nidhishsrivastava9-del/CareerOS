import mongoose from 'mongoose';

/**
 * CareerOS — Skill Mastery Model (Day 11)
 * 
 * Tracks system-calculated, evidence-based student mastery per skill and topic.
 * Separates system-verified mastery from self-declared learner skill level.
 */
const masteryEvidenceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['assessment', 'quiz', 'practice', 'project'], required: true },
    referenceId: { type: String, required: true },
    title: { type: String, default: '' },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
    recordedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const skillMasterySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mastery record must belong to an authenticated user'],
      index: true
    },
    skillName: {
      type: String,
      required: [true, 'Skill or topic name is required'],
      trim: true,
      index: true
    },
    career: {
      type: String,
      required: [true, 'Career reference is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    masteryPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    assessmentCount: {
      type: Number,
      default: 0
    },
    practiceCount: {
      type: Number,
      default: 0
    },
    lastScore: {
      type: Number,
      default: 0
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      default: 'stable'
    },
    evidence: {
      type: [masteryEvidenceSchema],
      default: []
    },
    lastAssessedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index per user, skill, and career
skillMasterySchema.index({ user: 1, skillName: 1, career: 1 }, { unique: true });
skillMasterySchema.index({ user: 1, masteryPercentage: 1 });

const SkillMastery = mongoose.model('SkillMastery', skillMasterySchema);

export default SkillMastery;
