import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, default: '' }
  },
  { _id: false }
);

const pyqItemSchema = new mongoose.Schema(
  {
    company: { type: String, default: 'General' },
    role: { type: String, default: 'Software Engineer' },
    question: { type: String, required: true },
    answerSnippet: { type: String, default: '' },
    frequency: { type: String, default: 'High' }
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    expectedOutput: { type: String, default: '' }
  },
  { _id: false }
);

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Resource slug is required'],
      trim: true,
      lowercase: true
    },
    type: {
      type: String,
      enum: ['theory', 'video', 'notes', 'pdf', 'quiz', 'pyq', 'practice', 'project'],
      required: [true, 'Resource type is required'],
      index: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    content: {
      type: String,
      default: ''
    },
    career: {
      type: String,
      required: [true, 'Career reference slug is required'],
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
      required: [true, 'Module reference slug is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    topic: {
      type: String,
      default: '',
      trim: true
    },
    duration: {
      type: String,
      default: '15 mins',
      trim: true
    },
    durationMinutes: {
      type: Number,
      default: 15
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'beginner', 'intermediate', 'advanced', 'all levels'],
      default: 'Beginner',
      index: true
    },
    language: {
      type: String,
      default: 'English',
      trim: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    order: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'published', 'archived'],
      default: 'published',
      index: true
    },
    source: {
      type: String,
      default: 'CareerOS Academy',
      trim: true
    },
    sourceUrl: {
      type: String,
      default: '',
      trim: true
    },
    embedUrl: {
      type: String,
      default: '',
      trim: true
    },
    thumbnail: {
      type: String,
      default: '',
      trim: true
    },
    platform: {
      type: String,
      default: 'youtube'
    },
    videoId: {
      type: String,
      default: '',
      trim: true
    },
    provider: {
      type: String,
      default: 'CareerOS Academy',
      trim: true
    },
    channel: {
      type: String,
      default: 'CareerOS Academy',
      trim: true
    },
    // Video-specific structured metadata
    videoMetadata: {
      platform: {
        type: String,
        enum: ['youtube', 'vimeo', 'careeros', 'other'],
        default: 'youtube'
      },
      videoId: {
        type: String,
        default: '',
        trim: true
      },
      channel: {
        type: String,
        default: 'CareerOS Academy',
        trim: true
      },
      duration: {
        type: String,
        default: '15:00',
        trim: true
      },
      language: {
        type: String,
        default: 'English'
      },
      thumbnail: {
        type: String,
        default: ''
      },
      topic: {
        type: String,
        default: ''
      },
      difficulty: {
        type: String,
        default: 'Beginner'
      },
      approvalState: {
        type: String,
        enum: ['pending', 'approved', 'published', 'rejected'],
        default: 'published'
      },
      displayOrder: {
        type: Number,
        default: 1
      }
    },
    // Quiz-specific structured metadata
    quizMetadata: {
      questionCount: { type: Number, default: 0 },
      estimatedMinutes: { type: Number, default: 10 },
      questions: { type: [questionSchema], default: [] }
    },
    // PYQ-specific structured metadata
    pyqMetadata: {
      company: { type: String, default: 'General' },
      role: { type: String, default: 'Software Engineer' },
      examYear: { type: String, default: 'Recent' },
      frequency: { type: String, default: 'High' },
      items: { type: [pyqItemSchema], default: [] }
    },
    // Practice-specific structured metadata
    practiceMetadata: {
      problemStatement: { type: String, default: '' },
      instructions: { type: [String], default: [] },
      hints: { type: [String], default: [] },
      starterCode: { type: String, default: '' },
      solutionCode: { type: String, default: '' },
      testCases: { type: [testCaseSchema], default: [] }
    },
    // Project-specific structured metadata
    projectMetadata: {
      title: { type: String, default: '' },
      overview: { type: String, default: '' },
      features: { type: [String], default: [] },
      techStack: { type: [String], default: [] },
      difficulty: { type: String, default: 'Intermediate' },
      estimatedHours: { type: Number, default: 4 }
    },
    // Extensible unstructured metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.slug;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes for high performance querying & duplicate prevention
resourceSchema.index({ career: 1, module: 1, status: 1, order: 1 });
resourceSchema.index({ type: 1, status: 1 });
resourceSchema.index({ slug: 1, career: 1, module: 1 }, { unique: true });

// Pre-save hook: compute canonical embedUrl automatically if YouTube videoId is supplied
resourceSchema.pre('save', function (next) {
  const vidId = this.videoId || this.videoMetadata?.videoId;
  if (this.type === 'video' && vidId) {
    const cleanId = String(vidId).trim();
    if (!this.embedUrl || this.embedUrl.includes('watch?v=') || !this.embedUrl.includes('/embed/')) {
      this.embedUrl = `https://www.youtube-nocookie.com/embed/${cleanId}`;
    }
    if (!this.sourceUrl) {
      this.sourceUrl = `https://www.youtube.com/watch?v=${cleanId}`;
    }
    if (!this.thumbnail && this.videoMetadata?.thumbnail) {
      this.thumbnail = this.videoMetadata.thumbnail;
    } else if (!this.thumbnail) {
      this.thumbnail = `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`;
    }
  }
  if (typeof next === 'function') next();
});

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
