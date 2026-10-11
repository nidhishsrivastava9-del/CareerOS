import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['theory', 'article', 'notes', 'pdf', 'video', 'quiz', 'pyq', 'practice', 'project'],
      required: true
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    duration: { type: String, default: '15 mins' },
    difficulty: { type: String, default: 'Beginner' },
    url: { type: String, default: '' },
    content: { type: String, default: '' },
    order: { type: Number, default: 1 },
    status: { type: String, default: 'published' },
    tags: { type: [String], default: [] },
    // Specific metadata for Video resources (Future Video Architecture ready)
    videoMetadata: {
      platform: { type: String, default: 'youtube' },
      videoId: { type: String, default: '' },
      channel: { type: String, default: 'CareerOS Academy' },
      duration: { type: String, default: '15:00' },
      language: { type: String, default: 'English' },
      thumbnail: { type: String, default: '' },
      topic: { type: String, default: '' },
      difficulty: { type: String, default: 'Beginner' },
      approvalState: { type: String, default: 'published' },
      displayOrder: { type: Number, default: 1 }
    },
    // Specific metadata for Quiz resources
    quizQuestions: [
      {
        id: { type: String },
        question: { type: String, required: true },
        options: { type: [String], required: true },
        correctAnswer: { type: Number, required: true },
        explanation: { type: String, default: '' }
      }
    ],
    // Specific metadata for PYQs / Interview Questions
    pyqItems: [
      {
        company: { type: String, default: 'General' },
        role: { type: String, default: 'Software Engineer' },
        question: { type: String, required: true },
        answerSnippet: { type: String, default: '' },
        frequency: { type: String, default: 'High' }
      }
    ],
    // Specific metadata for Practice tasks
    practiceTask: {
      problemStatement: { type: String, default: '' },
      instructions: { type: [String], default: [] },
      hints: { type: [String], default: [] },
      starterCode: { type: String, default: '' },
      solutionCode: { type: String, default: '' }
    },
    // Specific metadata for Mini Project resources
    projectSpec: {
      title: { type: String, default: '' },
      overview: { type: String, default: '' },
      features: { type: [String], default: [] },
      techStack: { type: [String], default: [] }
    }
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    estimatedHours: { type: Number, default: 10 },
    difficulty: { type: String, default: 'Beginner' },
    order: { type: Number, default: 1 },
    learningObjectives: { type: [String], default: [] },
    resources: { type: [resourceSchema], default: [] }
  },
  { _id: false }
);

const subjectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    estimatedHours: { type: Number, default: 20 },
    icon: { type: String, default: 'BookOpen' },
    modules: { type: [moduleSchema], default: [] }
  },
  { _id: false }
);

const phaseSchema = new mongoose.Schema(
  {
    phaseNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    estimatedHours: { type: Number, default: 50 },
    subjects: { type: [subjectSchema], default: [] }
  },
  { _id: false }
);

const careerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Career title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Career slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Career description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    difficulty: {
      type: String,
      default: 'Beginner to Advanced',
      trim: true
    },
    estimatedHours: {
      type: Number,
      default: 200
    },
    skills: {
      type: [String],
      default: []
    },
    prerequisites: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      default: 'Active',
      trim: true
    },
    icon: {
      type: String,
      default: 'Code'
    },
    featured: {
      type: Boolean,
      default: false
    },
    roadmapPhases: {
      type: [phaseSchema],
      default: []
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

// Helpful index on category and featured
careerSchema.index({ category: 1, featured: -1 });

const Career = mongoose.model('Career', careerSchema);

export default Career;
