import mongoose from 'mongoose';

/**
 * CareerOS — Question Model (Day 11)
 * 
 * Represents a reusable curriculum question in the Question Bank.
 * Supports multiple question types, skill mappings, curriculum placement,
 * and authoritative answer keys (never exposed to learners before submission).
 */
const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: [true, 'Question ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['single_choice', 'multiple_choice', 'true_false', 'code_reasoning', 'conceptual'],
      default: 'single_choice',
      index: true
    },
    options: {
      type: [String],
      required: [true, 'Question options are required'],
      validate: [opts => opts.length >= 2, 'Question must have at least 2 options']
    },
    // Array of zero-based option indices for single or multiple choice
    correctAnswers: {
      type: [Number],
      required: [true, 'Correct answers array is required'],
      validate: [ans => ans.length >= 1, 'At least one correct answer is required']
    },
    explanation: {
      type: String,
      default: '',
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
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
    skills: {
      type: [String],
      default: [],
      index: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    codeSnippet: {
      type: String,
      default: '',
      trim: true
    },
    resourceRef: {
      type: String,
      default: '',
      trim: true
    },
    points: {
      type: Number,
      default: 10,
      min: 1
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for Question Bank retrieval & filtering
questionSchema.index({ career: 1, module: 1, status: 1 });
questionSchema.index({ topic: 1, difficulty: 1, status: 1 });
questionSchema.index({ skills: 1, status: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;
