/**
 * Career Guidant Database Schemas
 * 
 * This file contains the proposed database schemas for the Blog, Forums, and Q&A features.
 * These schemas are designed for MongoDB and can be implemented using Mongoose in a Node.js environment.
 */

/**
 * Blog Schema
 */
const BlogSchema = {
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  date: { type: Date, default: Date.now },
  author: {
    id: { type: String, required: true, ref: 'User' },
    name: { type: String, required: true },
    avatar: { type: String },
    bio: { type: String }
  },
  category: { type: String, required: true },
  tags: [{ type: String }],
  source: { type: String },
  sourceLink: { type: String },
  isPublished: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  comments: [{
    userId: { type: String, ref: 'User' },
    userName: { type: String },
    userAvatar: { type: String },
    content: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
};

/**
 * Forum Topic Schema
 */
const ForumTopicSchema = {
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  author: {
    id: { type: String, required: true, ref: 'User' },
    name: { type: String, required: true },
    avatar: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  isHot: { type: Boolean, default: false },
  tags: [{ type: String }],
  comments: [{
    id: { type: String, required: true },
    userId: { type: String, required: true, ref: 'User' },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    replies: [{
      userId: { type: String, required: true, ref: 'User' },
      userName: { type: String, required: true },
      userAvatar: { type: String },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      likes: { type: Number, default: 0 }
    }]
  }]
};

/**
 * Forum Category Schema
 */
const ForumCategorySchema = {
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  topicCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
};

/**
 * Q&A Question Schema
 */
const QuestionSchema = {
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    id: { type: String, required: true, ref: 'User' },
    name: { type: String, required: true },
    avatar: { type: String },
    isMentor: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  category: { type: String, required: true },
  tags: [{ type: String }],
  views: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  isAnswered: { type: Boolean, default: false },
  answers: [{
    id: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      id: { type: String, required: true, ref: 'User' },
      name: { type: String, required: true },
      avatar: { type: String },
      isMentor: { type: Boolean, default: false }
    },
    createdAt: { type: Date, default: Date.now },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    isAccepted: { type: Boolean, default: false },
    comments: [{
      author: {
        id: { type: String, required: true, ref: 'User' },
        name: { type: String, required: true },
        avatar: { type: String }
      },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }]
  }]
};

/**
 * Q&A Category Schema
 */
const QaCategorySchema = {
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  questionCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
};

export { 
  BlogSchema, 
  ForumTopicSchema, 
  ForumCategorySchema, 
  QuestionSchema, 
  QaCategorySchema 
}; 