# Career Guidant Database Implementation

This document outlines the database implementation plan for the Career Guidant platform, particularly focusing on the Blog, Forums, and Q&A features.

## Technology Stack

The following technologies are recommended for implementing the database layer:

- **Database**: MongoDB (document-based NoSQL database)
- **ORM/ODM**: Mongoose (Object Data Modeling for MongoDB)
- **Backend**: Node.js with Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Storage**: AWS S3 for media files (images, videos)

## Data Models

The main data models are defined in `DatabaseSchemas.js` and include:

1. **Blog** - For storing blog posts and their metadata
2. **Forum Topic** - For forum discussions
3. **Forum Category** - For organizing forum topics
4. **Question** - For Q&A functionality
5. **QA Category** - For organizing questions

## Implementation Approach

### Backend API Endpoints

The following API endpoints should be implemented:

#### Blog Feature
- `GET /api/blogs` - List all published blogs (with pagination)
- `GET /api/blogs/:id` - Get a specific blog post
- `POST /api/blogs` - Create a new blog post (authenticated users only)
- `PUT /api/blogs/:id` - Update a blog post (author or admin only)
- `DELETE /api/blogs/:id` - Delete a blog post (author or admin only)
- `POST /api/blogs/:id/comments` - Add a comment to a blog post
- `GET /api/blogs/categories` - List all blog categories
- `GET /api/blogs/tags` - List all blog tags

#### Forums Feature
- `GET /api/forums/categories` - List all forum categories
- `GET /api/forums/topics` - List all forum topics (with pagination and filtering)
- `GET /api/forums/topics/:id` - Get a specific forum topic with its comments
- `POST /api/forums/topics` - Create a new forum topic (authenticated users only)
- `PUT /api/forums/topics/:id` - Update a forum topic (author or admin only)
- `DELETE /api/forums/topics/:id` - Delete a forum topic (author or admin only)
- `POST /api/forums/topics/:id/comments` - Add a comment to a forum topic
- `POST /api/forums/topics/:id/comments/:commentId/replies` - Add a reply to a comment

#### Q&A Feature
- `GET /api/questions` - List all questions (with pagination and filtering)
- `GET /api/questions/:id` - Get a specific question with its answers
- `POST /api/questions` - Create a new question (authenticated users only)
- `PUT /api/questions/:id` - Update a question (author or admin only)
- `DELETE /api/questions/:id` - Delete a question (author or admin only)
- `POST /api/questions/:id/answers` - Add an answer to a question
- `PUT /api/questions/:id/answers/:answerId` - Update an answer
- `POST /api/questions/:id/answers/:answerId/accept` - Accept an answer (question author only)
- `POST /api/questions/:id/upvote` - Upvote a question
- `POST /api/questions/:id/downvote` - Downvote a question

### Database Connection

The MongoDB connection should be set up in a central location such as `src/config/database.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Schema Implementation

Each schema defined in `DatabaseSchemas.js` should be implemented as a Mongoose model. For example:

```javascript
const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  date: { type: Date, default: Date.now },
  author: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    avatar: { type: String },
    bio: { type: String }
  },
  // Other fields as defined in DatabaseSchemas.js
});

module.exports = mongoose.model('Blog', BlogSchema);
```

## Data Migration Strategy

Until the database implementation is complete, the application will continue to use the static data defined in the React components. Once the backend is ready:

1. The static data will be migrated to the MongoDB database
2. Frontend components will be updated to fetch data from the API endpoints
3. Forms will be updated to submit data to the appropriate API endpoints
4. Authentication will be enforced for protected operations

## Search Functionality

For efficient text search across blog posts, forum topics, and questions, MongoDB's text search capabilities should be utilized:

```javascript
// Example: Creating a text index on the Blog model
BlogSchema.index({ title: 'text', subtitle: 'text', content: 'text', tags: 'text' });
```

## Caching Strategy

To improve performance, implement caching for frequently accessed data:

1. Use Redis for caching frequently accessed data like blog lists and forum categories
2. Implement client-side caching with proper cache invalidation strategies
3. Consider using a CDN for static assets and images

## Data Validation

All data should be validated before being stored in the database:

1. Use Mongoose's built-in validation capabilities
2. Implement additional validation at the API level using libraries like Joi or express-validator
3. Sanitize user input to prevent XSS attacks and injection vulnerabilities 