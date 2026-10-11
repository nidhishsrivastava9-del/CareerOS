import mongoose from 'mongoose';

/**
 * CareerOS — Assessment Model (Day 11)
 * 
 * Configurable assessment definition supporting quizzes, topic assessments,
 * module evaluations, and adaptive difficulty testing.
 */
const assessmentSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: String,
      required: [true, 'Assessment ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    type: {
      type: String,
      enum: ['quiz', 'topic_assessment', 'module_assessment', 'roadmap_assessment', 'practice_evaluation'],
      default: 'topic_assessment',
      index: true
    },
    career: {
      type: String,
      required: [true, 'Career reference is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    phase: {
      type: Number,
      default: 1
    },
    subject: {
      type: String,
      default: '',
      trim: true
    },
    module: {
      type: String,
      required: [true, 'Module reference is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    topic: {
      type: String,
      default: '',
      trim: true,
      index: true
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'adaptive'],
      default: 'intermediate',
      index: true
    },
    timeLimitMinutes: {
      type: Number,
      default: 15,
      min: 1
    },
    questionCount: {
      type: Number,
      default: 5,
      min: 1
    },
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    },
    adaptive: {
      type: Boolean,
      default: false
    },
    questionIds: {
      type: [String],
      default: []
    },
    skills: {
      type: [String],
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
      index: true
    }
  },
  {
    timestamps: true
  }
);

assessmentSchema.index({ career: 1, module: 1, status: 1 });
assessmentSchema.index({ topic: 1, status: 1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;
