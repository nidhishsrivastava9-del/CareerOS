import mongoose from 'mongoose';

const quizScoreSchema = new mongoose.Schema(
  {
    quizId: { type: String, required: true },
    moduleSlug: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const practiceCompletedSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true },
    moduleSlug: { type: String, required: true },
    completedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Progress must belong to an authenticated user'],
      index: true
    },
    careerSlug: {
      type: String,
      required: [true, 'Career slug is required'],
      lowercase: true,
      trim: true
    },
    completedLessons: {
      type: [String],
      default: []
    },
    completedModules: {
      type: [String],
      default: []
    },
    quizScores: {
      type: [quizScoreSchema],
      default: []
    },
    practiceCompleted: {
      type: [practiceCompletedSchema],
      default: []
    },
    overallPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastActiveModule: {
      type: String,
      default: ''
    },
    isCurrentActiveCareer: {
      type: Boolean,
      default: false
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Ensure only one progress document per user per career
progressSchema.index({ user: 1, careerSlug: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
