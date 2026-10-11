import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['system', 'user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    }
  },
  { _id: true }
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required for conversation ownership'],
      index: true
    },
    conversationId: {
      type: String,
      required: true,
      trim: true,
      index: true,
      default: () => `conv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    },
    title: {
      type: String,
      default: 'New Learning Discussion',
      trim: true
    },
    careerSlug: {
      type: String,
      default: '',
      trim: true
    },
    moduleSlug: {
      type: String,
      default: '',
      trim: true
    },
    topic: {
      type: String,
      default: '',
      trim: true
    },
    messages: {
      type: [messageSchema],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.conversationId;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound indexes for user-isolated queries and fast retrieval
conversationSchema.index({ user: 1, conversationId: 1 }, { unique: true });
conversationSchema.index({ user: 1, updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
