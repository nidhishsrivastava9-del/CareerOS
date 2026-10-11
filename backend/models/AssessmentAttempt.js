import mongoose from 'mongoose';

/**
 * CareerOS — Assessment Attempt Model (Day 11)
 * 
 * Persists authoritative student attempts, question answers, grading outcomes,
 * topic/skill diagnostic breakdowns, and personalized next-step recommendations.
 * Strictly scoped to the authenticated user.
 */
const answerItemSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selectedAnswers: { type: [Number], default: [] },
    isCorrect: { type: Boolean, required: true },
    pointsAwarded: { type: Number, default: 0 },
    maxPoints: { type: Number, default: 10 }
  },
  { _id: false }
);

const diagnosticItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    total: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    status: { type: String, enum: ['mastered', 'proficient', 'needs_review'], default: 'needs_review' }
  },
  { _id: false }
);

const recommendationItemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['review_topic', 'practice_challenge', 'next_module', 'project', 'retest'], required: true },
    title: { type: String, required: true },
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    reason: { type: String, default: '' },
    difficulty: { type: String, default: 'Intermediate' },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    action: { type: String, required: true },
    link: { type: String, default: '' },
    targetUrl: { type: String, default: '' },
    topic: { type: String, default: '' },
    module: { type: String, default: '' },
    resource: { type: String, default: '' }
  },
  { _id: false }
);

const assessmentAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Attempt must belong to an authenticated user'],
      index: true
    },
    attemptId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      default: () => `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    },
    assessmentId: {
      type: String,
      required: [true, 'Assessment ID is required'],
      index: true
    },
    assessmentTitle: {
      type: String,
      required: true
    },
    career: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    module: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    topic: {
      type: String,
      default: ''
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    timeTakenSeconds: {
      type: Number,
      default: 0
    },
    answers: {
      type: [answerItemSchema],
      default: []
    },
    score: {
      type: Number,
      required: true,
      default: 0
    },
    totalPoints: {
      type: Number,
      required: true,
      default: 0
    },
    percentage: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100
    },
    passed: {
      type: Boolean,
      required: true,
      default: false
    },
    correctCount: {
      type: Number,
      default: 0
    },
    incorrectCount: {
      type: Number,
      default: 0
    },
    skippedCount: {
      type: Number,
      default: 0
    },
    topicPerformance: {
      type: [diagnosticItemSchema],
      default: []
    },
    skillPerformance: {
      type: [diagnosticItemSchema],
      default: []
    },
    recommendations: {
      type: [recommendationItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Pre-validate hook to ensure recommendation aliases and properties are always in sync
assessmentAttemptSchema.pre('validate', function(next) {
  if (Array.isArray(this.recommendations)) {
    this.recommendations.forEach(r => {
      if (!r.name && r.title) r.name = r.title;
      if (!r.title && r.name) r.title = r.name;
      if (!r.description && r.reason) r.description = r.reason;
      if (!r.reason && r.description) r.reason = r.description;
      if (!r.targetUrl && r.link) r.targetUrl = r.link;
      if (!r.link && r.targetUrl) r.link = r.targetUrl;
      if (!r.difficulty) r.difficulty = r.priority === 'high' ? 'Intermediate' : 'Beginner';
      if (!r.priority) r.priority = 'medium';
    });
  }
  if (typeof next === 'function') next();
});

const AssessmentAttempt = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);

export default AssessmentAttempt;
