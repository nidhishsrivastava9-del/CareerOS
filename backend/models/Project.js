import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project must belong to an authenticated user'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    technologies: {
      type: [String],
      default: []
    },
    techStack: {
      type: [String],
      default: []
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true
    },
    liveUrl: {
      type: String,
      default: '',
      trim: true
    },
    demoUrl: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      default: 'In Progress',
      trim: true
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
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

// Keep title/name and demoUrl/liveUrl in sync
projectSchema.pre('save', function (next) {
  if (this.name && !this.title) {
    this.title = this.name;
  }
  if (this.title && !this.name) {
    this.name = this.title;
  }
  if (this.technologies && (!this.techStack || this.techStack.length === 0)) {
    this.techStack = this.technologies;
  }
  if (this.techStack && (!this.technologies || this.technologies.length === 0)) {
    this.technologies = this.techStack;
  }
  if (this.liveUrl && !this.demoUrl) {
    this.demoUrl = this.liveUrl;
  }
  if (typeof next === 'function') next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
