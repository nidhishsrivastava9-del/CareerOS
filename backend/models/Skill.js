import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Skill must belong to an authenticated user'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      default: 'Learning',
      trim: true
    },
    color: {
      type: String,
      default: '#6366F1',
      trim: true
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

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
