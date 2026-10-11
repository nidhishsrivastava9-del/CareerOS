import mongoose from 'mongoose';

export const DEFAULT_DSA_TOPICS = [
  { topic: 'Arrays', solved: 0, total: 25, progress: 0 },
  { topic: 'Strings', solved: 0, total: 20, progress: 0 },
  { topic: 'Linked List', solved: 0, total: 15, progress: 0 },
  { topic: 'Stack', solved: 0, total: 12, progress: 0 },
  { topic: 'Queue', solved: 0, total: 10, progress: 0 },
  { topic: 'Trees', solved: 0, total: 20, progress: 0 },
  { topic: 'Graphs', solved: 0, total: 18, progress: 0 },
  { topic: 'Dynamic Programming', solved: 0, total: 25, progress: 0 }
];

const dsaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'DSA topic must belong to an authenticated user'],
      index: true
    },
    topic: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true
    },
    solved: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    easy: {
      type: Number,
      default: 0,
      min: 0
    },
    medium: {
      type: Number,
      default: 0,
      min: 0
    },
    hard: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Auto calculate progress before save
dsaSchema.pre('save', function (next) {
  if (this.total > 0) {
    this.progress = Math.min(100, Math.round((this.solved / this.total) * 100));
  } else {
    this.progress = 0;
  }
  if (typeof next === 'function') next();
});

const Dsa = mongoose.model('Dsa', dsaSchema);

export default Dsa;
