import mongoose from 'mongoose';

/**
 * CareerOS — Knowledge Chunk Model (Day 10)
 * 
 * Represents an indexed, searchable chunk of verified CareerOS learning material
 * used in the Retrieval-Augmented Generation (RAG) pipeline for Helping AI.
 */
const knowledgeChunkSchema = new mongoose.Schema(
  {
    chunkId: {
      type: String,
      required: [true, 'Chunk ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Chunk content is required']
    },
    sourceType: {
      type: String,
      enum: ['theory', 'video', 'notes', 'pdf', 'quiz', 'pyq', 'practice', 'project', 'article', 'faq'],
      required: [true, 'Source type is required'],
      index: true
    },
    resourceId: {
      type: String,
      required: [true, 'Source resource ID reference is required'],
      index: true
    },
    resourceSlug: {
      type: String,
      required: [true, 'Resource slug is required'],
      lowercase: true,
      trim: true
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
      trim: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    language: {
      type: String,
      default: 'English',
      trim: true
    },
    chunkIndex: {
      type: Number,
      required: true,
      default: 0
    },
    totalChunks: {
      type: Number,
      default: 1
    },
    embedding: {
      type: [Number],
      default: []
    },
    contentHash: {
      type: String,
      default: '',
      trim: true
    },
    version: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'published', 'archived'],
      default: 'published',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimal filtered vector/hybrid retrieval
knowledgeChunkSchema.index({ career: 1, module: 1, status: 1 });
knowledgeChunkSchema.index({ status: 1, sourceType: 1 });
knowledgeChunkSchema.index({ resourceId: 1, chunkIndex: 1 });

const KnowledgeChunk = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);

export default KnowledgeChunk;
