import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Goal must belong to an authenticated user'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true
    },
    task: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    deadline: {
      type: String,
      default: 'Today',
      trim: true
    },
    category: {
      type: String,
      default: 'Learning',
      trim: true
    },
    priority: {
      type: String,
      default: 'Medium',
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
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

goalSchema.pre('save', function (next) {
  if (this.title && !this.task) {
    this.task = this.title;
  }
  if (this.task && !this.title) {
    this.title = this.task;
  }
  if (typeof next === 'function') next();
});

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
