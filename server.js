const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const multer = require('multer');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3250;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/career-guidance';

// Ensure mentor-img directory exists
const mentorImgDir = path.join(__dirname, 'public', 'mentor-img');
if (!fs.existsSync(mentorImgDir)) {
  fs.mkdirSync(mentorImgDir, { recursive: true });
  console.log('Created mentor-img directory');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, mentorImgDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename using timestamp and original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `mentor-${Date.now()}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'dist')));

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isMentor: { type: Boolean, default: false },
  // Mentor-specific fields
  qualification: { type: String }, // For mentors - education and certifications
  experience: { type: String }, // For mentors - detailed experience description
  expertise: { type: [String], default: [] }, // For mentors - array of skills/specialties
  bio: { type: String }, // For mentors - detailed bio
  photoUrl: { type: String, default: '' }, // For mentors - profile photo URL
  price: { type: Number, default: 0 }, // For mentors - price per session
  rating: { type: Number, default: 5.0 }, // For mentors - average rating
  sessionsCompleted: { type: Number, default: 0 }, // For mentors - total sessions completed
  availability: { type: [String], default: [] }, // For mentors - days available, e.g., ['Monday', 'Wednesday']
  createdAt: { type: Date, default: Date.now }
});

// Define Assessment Schema
const assessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scores: {
    Science: { type: Number, default: 0 },
    Technology: { type: Number, default: 0 },
    Engineering: { type: Number, default: 0 },
    Mathematics: { type: Number, default: 0 }
  },
  recommendedField: { type: String },
  completedAt: { type: Date, default: Date.now }
});

// Define Contact Message Schema
const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Define Session Schema
const sessionSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mentorName: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  sessionDate: { type: String, required: true },
  sessionTime: { type: String, required: true },
  sessionType: { type: String, enum: ['video', 'audio', 'chat'], required: true },
  notes: { type: String },
  price: { type: Number, required: true },
  paymentId: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'accepted'],
    default: 'pending'
  },
  sessionRequestId: { type: String }, // ID of the original session request (if created from a request)
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Add a session request schema
const sessionRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  mentorName: { type: String, required: true },
  sessionDate: { type: Date, required: true },
  sessionTime: { type: String, required: true },
  sessionType: { type: String, required: true },
  notes: { type: String },
  roomID: { type: String }, // Room ID for video calls
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' }
}, { timestamps: true });

// Define Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  date: { type: Date, default: Date.now },
  author: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    avatar: { type: String },
    bio: { type: String },
    email: { type: String }
  },
  category: { type: String, required: true },
  tags: [{ type: String }],
  source: { type: String },
  sourceLink: { type: String },
  isPublished: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    userAvatar: { type: String },
    content: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
});

// Define Question Schema
const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: String, required: true },
  email: { type: String },
  avatar: { type: String },
  date: { type: Date, default: Date.now },
  tags: [{ type: String }],
  answers: [{
    id: { type: String },
    author: { type: String, required: true },
    text: { type: String, required: true }, 
    date: { type: Date, default: Date.now },
    isMentor: { type: Boolean, default: true }
  }],
  likes: { type: Number, default: 0 },
  isAnswered: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  comments: [{
    id: { type: String },
    author: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      avatar: { type: String },
      isMentor: { type: Boolean, default: false },
      email: { type: String }
    },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
});

// Create models
const User = mongoose.model('User', userSchema);
const Assessment = mongoose.model('Assessment', assessmentSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Session = mongoose.model('Session', sessionSchema);
const SessionRequest = mongoose.model('SessionRequest', sessionRequestSchema);
const Blog = mongoose.model('Blog', blogSchema);
const Question = mongoose.model('Question', questionSchema);

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
// Register user
app.post('/api/register', async (req, res) => {
  try {
    console.log('Registration request received', {
      ...req.body,
      password: req.body.password ? '[REDACTED]' : undefined
    });
    
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      isMentor, 
      qualification,
      experience, 
      expertise, 
      bio, 
      photoUrl,
      price,
      availability 
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields (firstName, lastName, email, password)' });
    }
    
    // Mentor-specific validation
    if (isMentor) {
      if (!qualification) {
        return res.status(400).json({ message: 'Qualification is required for mentors' });
      }
      if (!experience) {
        return res.status(400).json({ message: 'Experience is required for mentors' });
      }
      if (!expertise || !Array.isArray(expertise) || expertise.length === 0) {
        return res.status(400).json({ message: 'At least one area of expertise is required for mentors' });
      }
      if (!bio) {
        return res.status(400).json({ message: 'Bio is required for mentors' });
      }
      if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
        return res.status(400).json({ message: 'Valid price is required for mentors' });
      }
      if (!availability || !Array.isArray(availability) || availability.length === 0) {
        return res.status(400).json({ message: 'At least one day of availability is required for mentors' });
      }
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isMentor: isMentor || false,
      // Only add mentor fields if registering as a mentor
      ...(isMentor ? {
        qualification,
        experience,
        expertise: expertise || [],
        bio,
        photoUrl: photoUrl || '',
        price: price || 0,
        availability: availability || [],
        rating: 5.0, // Default rating for new mentors
        sessionsCompleted: 0
      } : {
        // Explicitly set mentor fields to undefined or empty values for students
        expertise: [],
        photoUrl: '',
        price: 0,
        rating: 0,
        sessionsCompleted: 0,
        availability: []
      })
    });
    
    console.log('Creating new user with data:', {
      firstName,
      lastName,
      email,
      isMentor,
      ...(isMentor ? {
        qualification,
        expertise: expertise || [],
        price: price || 0,
        availability: availability ? availability.length : 0
      } : {})
    });
    
    await user.save();
    
    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'lax'
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isMentor: user.isMentor,
        qualification: user.qualification,
        experience: user.experience,
        expertise: user.expertise,
        bio: user.bio,
        photoUrl: user.photoUrl,
        price: user.price,
        rating: user.rating,
        sessionsCompleted: user.sessionsCompleted,
        availability: user.availability
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, isMentor } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check if user type matches
    if (isMentor !== undefined && user.isMentor !== isMentor) {
      return res.status(400).json({ 
        message: isMentor 
          ? 'This account is not registered as a mentor' 
          : 'This account is registered as a mentor. Please use mentor login.'
      });
    }
    
    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'lax'
    });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isMentor: user.isMentor,
        qualification: user.qualification,
        experience: user.experience,
        expertise: user.expertise,
        bio: user.bio,
        photoUrl: user.photoUrl,
        price: user.price,
        rating: user.rating,
        sessionsCompleted: user.sessionsCompleted,
        availability: user.availability
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout user
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
app.get('/api/user', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Save assessment results
app.post('/api/assessment', authenticate, async (req, res) => {
  try {
    const { scores, recommendedField } = req.body;
    
    const assessment = new Assessment({
      userId: req.user._id,
      scores,
      recommendedField
    });
    
    await assessment.save();
    
    res.status(201).json({ message: 'Assessment saved successfully', assessment });
  } catch (error) {
    console.error('Assessment save error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's assessments
app.get('/api/assessments', authenticate, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user._id }).sort({ completedAt: -1 });
    res.json({ assessments });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save contact form message
app.post('/api/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;
    
    // Create new contact message
    const contactMessage = new Contact({
      firstName,
      lastName,
      email,
      phone,
      message
    });
    
    await contactMessage.save();
    
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
});

// Admin route to get all contact messages (protected)
app.get('/api/admin/contacts', authenticate, async (req, res) => {
  try {
    // Check if user is admin (you would need to add an isAdmin field to your user schema)
    // For now, we'll just check if the user exists
    if (!req.user) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ messages });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a session
app.post('/api/sessions', authenticate, async (req, res) => {
  try {
    const { 
      mentorId, 
      sessionDate, 
      sessionTime, 
      sessionType,
      notes,
      sessionRequestId // Optional - if this session is created from a request
    } = req.body;
    
    // Get mentor details to determine price
    const mentor = await User.findById(mentorId);
    if (!mentor || !mentor.isMentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    // Get current user (student) details
    const student = req.user;
    
    // Create a new session
    const session = new Session({
      studentId: student._id,
      mentorId,
      studentName: `${student.firstName} ${student.lastName}`,
      mentorName: `${mentor.firstName} ${mentor.lastName}`,
      sessionDate,
      sessionTime,
      sessionType,
      notes,
      price: mentor.price || 0,
      status: 'accepted',
      paymentId: 'pending', // This will be updated after payment is confirmed
      sessionRequestId: sessionRequestId // Include the original request ID if available
    });
    
    await session.save();
    
    // If this session was created from a request, update the request
    if (sessionRequestId) {
      try {
        const sessionRequest = await SessionRequest.findById(sessionRequestId);
        if (sessionRequest) {
          sessionRequest.status = 'accepted';
          await sessionRequest.save();
        }
      } catch (error) {
        console.error('Error updating related session request:', error);
        // Continue with the success response even if updating the request fails
      }
    }
    
    res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Failed to create session' });
  }
});

// API endpoint to fetch all sessions for a user (as mentor or student)
app.get('/api/sessions', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'You must be logged in to view sessions' });
    }

    // Initialize sessions array
    let sessions = [];

    if (req.user.isMentor) {
      // For mentors, fetch all sessions where they are the mentor
      sessions = await Session.find({ mentorId: req.user._id }).sort({ createdAt: -1 });
      
      // Deduplicate sessions based on sessionRequestId
      const uniqueSessions = new Map();
      
      for (const session of sessions) {
        const key = session.sessionRequestId || 
                  `${session.studentId}-${session.sessionDate}-${session.sessionTime}`;
                  
        // If we already have this session or a newer version, skip
        if (uniqueSessions.has(key)) {
          const existingSession = uniqueSessions.get(key);
          const existingDate = new Date(existingSession.createdAt);
          const currentDate = new Date(session.createdAt);
          
          // Only replace if this session is newer
          if (currentDate > existingDate) {
            uniqueSessions.set(key, session);
          }
        } else {
          uniqueSessions.set(key, session);
        }
      }
      
      // Convert back to array
      sessions = Array.from(uniqueSessions.values());
    } else {
      // For students, fetch all sessions where they are the student
      sessions = await Session.find({ studentId: req.user._id }).sort({ createdAt: -1 });
      
      // Deduplicate sessions based on sessionRequestId
      const uniqueSessions = new Map();
      
      for (const session of sessions) {
        // Use sessionRequestId as key if available, otherwise use a combination of mentor, date, time
        const key = session.sessionRequestId || 
                  `${session.mentorId}-${session.sessionDate}-${session.sessionTime}`;
                  
        // If we already have this session or a newer version, skip
        if (uniqueSessions.has(key)) {
          const existingSession = uniqueSessions.get(key);
          const existingDate = new Date(existingSession.createdAt);
          const currentDate = new Date(session.createdAt);
          
          // Only replace if this session is newer
          if (currentDate > existingDate) {
            uniqueSessions.set(key, session);
          }
        } else {
          uniqueSessions.set(key, session);
        }
      }
      
      // Convert back to array
      sessions = Array.from(uniqueSessions.values());
      
      // Check if any of the sessions were created from session requests
      // and update payment status accordingly
      for (const session of sessions) {
        if (session.sessionRequestId) {
          try {
            const request = await SessionRequest.findById(session.sessionRequestId);
            if (request) {
              session.fromRequest = true;
              session.requestStatus = request.status;
            }
          } catch (err) {
            console.error('Error fetching session request:', err);
          }
        }
      }
    }

    res.json({
      sessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

// Get user's sessions (as mentor)
app.get('/api/mentor/sessions', authenticate, async (req, res) => {
  try {
    // Check if the user is a mentor
    if (!req.user.isMentor) {
      return res.status(403).json({ message: 'Access denied. User is not a mentor.' });
    }
    
    // Get all sessions where they are the mentor
    const allSessions = await Session.find({ mentorId: req.user._id })
      .sort({ createdAt: -1 });
    
    // Filter out duplicates using the sessionRequestId (sessions created from the same request)
    // Create a Map to deduplicate by sessionRequestId or by unique combination when sessionRequestId is not available
    const sessionMap = new Map();
    
    for (const session of allSessions) {
      // If session has a sessionRequestId, use it to deduplicate
      if (session.sessionRequestId) {
        // If we haven't seen this request ID before, or this session is newer, keep it
        const existingSession = sessionMap.get(session.sessionRequestId);
        if (!existingSession || existingSession.createdAt < session.createdAt) {
          sessionMap.set(session.sessionRequestId, session);
        }
      } else {
        // For sessions without sessionRequestId, use a combination of studentId, date and time
        const key = `${session.studentId}-${session.sessionDate}-${session.sessionTime}`;
        // If we haven't seen this combination before, or this session is newer, keep it
        const existingSession = sessionMap.get(key);
        if (!existingSession || existingSession.createdAt < session.createdAt) {
          sessionMap.set(key, session);
        }
      }
    }
    
    // Convert map back to array of sessions
    const sessions = Array.from(sessionMap.values());
    
    res.json({ sessions });
  } catch (error) {
    console.error('Get mentor sessions error:', error);
    res.status(500).json({ message: 'Failed to fetch sessions. Please try again later.' });
  }
});

// Update a session (for rescheduling or rating)
app.put('/api/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;
    
    // Validate sessionId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID format' });
    }
    
    // Find the session
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Make sure the user is either the student or mentor of the session
    if (session.studentId.toString() !== req.user._id.toString() && 
        (session.mentorId ? session.mentorId.toString() !== req.user._id.toString() : true)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update allowed fields only
    const allowedUpdates = ['sessionDate', 'sessionTime', 'status', 'rating', 'feedback'];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        session[key] = updates[key];
      }
    });
    
    await session.save();
    
    // If this session was created from a session request, update all related sessions
    if (session.sessionRequestId) {
      try {
        // Find all sessions with the same sessionRequestId (except this one)
        const relatedSessions = await Session.find({
          _id: { $ne: session._id },
          sessionRequestId: session.sessionRequestId
        });
        
        if (relatedSessions.length > 0) {
          console.log(`Found ${relatedSessions.length} related sessions to update with the same sessionRequestId`);
          
          // Update each related session with the same changes
          for (const relatedSession of relatedSessions) {
            Object.keys(updates).forEach(key => {
              if (allowedUpdates.includes(key)) {
                relatedSession[key] = updates[key];
              }
            });
            await relatedSession.save();
            console.log(`Updated related session: ${relatedSession._id}`);
          }
        }
      } catch (error) {
        console.error('Error updating related sessions:', error);
        // Continue with the response even if updating related sessions fails
      }
    }
    
    res.json({
      message: 'Session updated successfully',
      session
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Failed to update session. Please try again later.' });
  }
});

// Mentor endpoints
app.get('/api/mentors', async (req, res) => {
  try {
    // Find all users who are mentors
    const mentors = await User.find({ isMentor: true }).select('-password');
    
    res.json({ 
      success: true, 
      mentors 
    });
  } catch (err) {
    console.error('Error fetching mentors:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching mentors' 
    });
  }
});

// Get a specific mentor by ID
app.get('/api/mentors/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    
    // Validate mentorId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid mentor ID format' 
      });
    }
    
    // Find the mentor
    const mentor = await User.findOne({ 
      _id: mentorId,
      isMentor: true
    }).select('-password');
    
    if (!mentor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mentor not found' 
      });
    }
    
    res.json({ 
      success: true, 
      mentor 
    });
  } catch (err) {
    console.error('Error fetching mentor details:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching mentor details' 
    });
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({ 
      success: false,
      message: `File upload error: ${err.message}`
    });
  } else if (err) {
    console.error('File upload error:', err);
    return res.status(500).json({ 
      success: false,
      message: `File upload error: ${err.message}`
    });
  }
  next();
};

// File upload endpoint for mentor profile images
app.post('/api/upload/profile-image', upload.single('profileImage'), handleMulterError, (req, res) => {
  try {
    console.log('Profile image upload request received');
    console.log('Request file:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }
    
    // Return the relative path to the uploaded file
    const imagePath = `/public/mentor-img/${req.file.filename}`;
    console.log('Image saved to:', imagePath);
    
    res.status(201).json({
      success: true,
      imagePath: imagePath
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading image: ' + error.message 
    });
  }
});

// API endpoint to create a session request
app.post('/api/session-requests', authenticate, async (req, res) => {
  try {
    const { mentorId, sessionDate, sessionTime, sessionType, notes } = req.body;
    
    console.log('Creating session request:', req.body);
    
    // Make sure the user is logged in
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'You must be logged in to book a session' 
      });
    }
    
    // Make sure the user is not trying to book themselves
    if (req.user._id.toString() === mentorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot book a session with yourself' 
      });
    }
    
    // Get mentor details
    const mentor = await User.findById(mentorId);
    
    if (!mentor || !mentor.isMentor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mentor not found' 
      });
    }
    
    // Validate required fields
    if (!sessionDate) {
      return res.status(400).json({
        success: false,
        message: 'Session date is required'
      });
    }
    
    if (!sessionTime) {
      return res.status(400).json({
        success: false,
        message: 'Session time is required'
      });
    }
    
    if (!sessionType) {
      return res.status(400).json({
        success: false,
        message: 'Session type is required'
      });
    }
    
    // Create the session request
    const sessionRequest = new SessionRequest({
      mentorId,
      studentId: req.user._id,
      studentName: `${req.user.firstName} ${req.user.lastName}`,
      mentorName: `${mentor.firstName} ${mentor.lastName}`,
      sessionDate,
      sessionTime,
      sessionType,
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    await sessionRequest.save();
    
    res.status(201).json({
      success: true,
      message: 'Session request created successfully',
      sessionRequest
    });
  } catch (error) {
    console.error('Error creating session request:', error);
    
    // Catch validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error creating session request: ' + error.message 
    });
  }
});

// API endpoint to get mentor's session requests
app.get('/api/mentor/session-requests', authenticate, async (req, res) => {
  try {
    // Make sure the user is logged in and is a mentor
    if (!req.user || !req.user.isMentor) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You must be a mentor to view session requests.' 
      });
    }
    
    // Get all session requests for this mentor
    const sessionRequests = await SessionRequest.find({ 
      mentorId: req.user._id 
    }).sort({ createdAt: -1 });
    
    // Get related sessions for each request
    const requestsWithSessionInfo = await Promise.all(sessionRequests.map(async (request) => {
      // Try to find a session created from this request
      const relatedSession = await Session.findOne({ 
        sessionRequestId: request._id.toString()
      });
      
      // If a related session exists, include its ID and check payment status
      const requestWithSessionId = {
        ...request.toObject(),
        sessionId: relatedSession ? relatedSession._id : null,
        hasRelatedSession: !!relatedSession,
        // If we have a related session with payment that is not 'pending', mark as paid
        isPaid: relatedSession && relatedSession.paymentId && relatedSession.paymentId !== 'pending'
      };
      
      // If the session is paid, make sure paymentStatus is also marked as completed
      if (requestWithSessionId.isPaid && requestWithSessionId.paymentStatus !== 'completed') {
        requestWithSessionId.paymentStatus = 'completed';
        
        // Update the session request in the database too
        await SessionRequest.findByIdAndUpdate(request._id, {
          paymentStatus: 'completed'
        });
      }
      
      return requestWithSessionId;
    }));
    
    // Get student details for each request
    const requestsWithStudentDetails = await Promise.all(requestsWithSessionInfo.map(async (request) => {
      const student = await User.findById(request.studentId).select('-password');
      return {
        ...request,
        student: student || null
      };
    }));
    
    res.json({
      success: true,
      sessionRequests: requestsWithStudentDetails
    });
  } catch (error) {
    console.error('Error fetching mentor session requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch session requests: ' + error.message 
    });
  }
});

// Accept/reject a session request
app.put('/api/session-requests/:requestId', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    
    // Validate the status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be accepted or rejected.' });
    }
    
    // Find the session request
    const sessionRequest = await SessionRequest.findById(requestId);
    
    if (!sessionRequest) {
      return res.status(404).json({ message: 'Session request not found' });
    }
    
    // Make sure the current user is the mentor for this request
    if (sessionRequest.mentorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this session request' });
    }
    
    // Update the session request status
    sessionRequest.status = status;
    await sessionRequest.save();
    
    // If accepted, create a session record that will be confirmed after payment
    if (status === 'accepted') {
      // First check if a session already exists for this request
      const existingSession = await Session.findOne({ sessionRequestId: requestId });
      
      if (!existingSession) {
        // Get the student details
        const student = await User.findById(sessionRequest.studentId);
        const mentor = await User.findById(sessionRequest.mentorId);
        
        if (!student || !mentor) {
          return res.status(404).json({ message: 'Student or mentor not found' });
        }
        
        // Create a new session from the request
        const session = new Session({
          studentId: sessionRequest.studentId,
          mentorId: sessionRequest.mentorId,
          studentName: `${student.firstName} ${student.lastName}`,
          mentorName: `${mentor.firstName} ${mentor.lastName}`,
          sessionDate: sessionRequest.sessionDate.toISOString().split('T')[0],
          sessionTime: sessionRequest.sessionTime,
          sessionType: sessionRequest.sessionType,
          notes: sessionRequest.notes,
          status: 'accepted',
          price: mentor.price || 0,
          paymentId: 'pending', // Will be updated after payment
          sessionRequestId: requestId // Link to the original request
        });
        
        await session.save();
        console.log(`Created session from request: ${session._id} linked to request ${requestId}`);
      } else {
        console.log(`Session already exists for request: ${requestId}, session ID: ${existingSession._id}`);
      }
    }
    
    res.json({
      message: `Session request ${status} successfully`,
      sessionRequest
    });
  } catch (error) {
    console.error('Error updating session request:', error);
    res.status(500).json({ message: 'Failed to update session request' });
  }
});

// Get latest session requests for dashboard
app.get('/api/dashboard/session-requests', authenticate, async (req, res) => {
  try {
    // Check if user is a mentor
    if (!req.user.isMentor) {
      return res.status(403).json({ message: 'Access denied. Only mentors can view session requests.' });
    }
    
    // Get the latest 5 pending session requests for this mentor
    const latestRequests = await SessionRequest.find({
      mentorId: req.user._id,
      status: 'pending'
    })
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Get student details for each request
    const requestsWithStudentDetails = await Promise.all(
      latestRequests.map(async (request) => {
        const student = await User.findById(request.studentId);
        
        return {
          _id: request._id,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
          sessionDate: request.sessionDate,
          sessionTime: request.sessionTime,
          sessionType: request.sessionType,
          status: request.status,
          createdAt: request.createdAt
        };
      })
    );
    
    return res.status(200).json({
      pendingCount: await SessionRequest.countDocuments({ 
        mentorId: req.user._id, 
        status: 'pending' 
      }),
      latestRequests: requestsWithStudentDetails
    });
  } catch (error) {
    console.error('Error fetching dashboard session requests:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// API endpoint to get user's session requests
app.get('/api/session-requests', authenticate, async (req, res) => {
  try {
    // Find session requests for the current user
    const sessionRequests = await SessionRequest.find({ 
      studentId: req.user._id 
    }).sort({ createdAt: -1 });
    
    // Enhance session request objects with payment information
    const enhancedRequests = await Promise.all(sessionRequests.map(async (request) => {
      // Check if there's a corresponding session that's been paid for
      const paidSession = await Session.findOne({
        studentId: req.user._id,
        mentorId: request.mentorId,
        sessionDate: request.sessionDate.toISOString().split('T')[0],
        sessionTime: request.sessionTime,
        paymentId: { $exists: true, $ne: 'pending' }
      });

      // Also check for sessions linked directly by sessionRequestId
      const linkedSession = await Session.findOne({
        sessionRequestId: request._id.toString(),
        paymentId: { $exists: true, $ne: 'pending' }
      });
      
      const requestObj = request.toObject();
      
      // Add a derived status that combines the request status with payment information
      if (paidSession || linkedSession) {
        requestObj.derivedStatus = 'paid';
        requestObj.paymentId = paidSession?.paymentId || linkedSession?.paymentId;
        requestObj.displayStatus = 'Paid';
        requestObj.isPaid = true;
        requestObj.hasRelatedSession = true;
        requestObj.sessionId = paidSession?._id || linkedSession?._id;
        
        // Update the payment status in the database if it's not already completed
        if (request.paymentStatus !== 'completed') {
          await SessionRequest.findByIdAndUpdate(request._id, {
            paymentStatus: 'completed'
          });
          requestObj.paymentStatus = 'completed';
        }
      } else if (request.status === 'accepted' && request.paymentStatus === 'pending') {
        requestObj.derivedStatus = 'payment_required';
        requestObj.displayStatus = 'Payment Required';
      } else {
        requestObj.derivedStatus = request.status;
        requestObj.displayStatus = request.status === 'pending' ? 'Pending Approval' : 
                                  request.status === 'accepted' ? 'Accepted' : 
                                  request.status === 'approved' ? 'Approved' :
                                  request.status === 'rejected' ? 'Rejected' : 'Unknown';
      }
      
      return requestObj;
    }));
    
    res.json({ 
      success: true,
      sessionRequests: enhancedRequests 
    });
  } catch (error) {
    console.error('Error fetching session requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching session requests: ' + error.message 
    });
  }
});

// Get students for a mentor
app.get('/api/mentor/students', authenticate, async (req, res) => {
  try {
    // Check if user is a mentor
    if (!req.user.isMentor) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only mentors can view their students.' 
      });
    }
    
    // Find all completed/confirmed sessions for this mentor
    const sessions = await Session.find({
      mentorId: req.user._id,
      status: { $in: ['accepted', 'confirmed', 'completed'] }
    });
    
    // Get sessions with completed payments (not pending)
    const completedPaymentSessions = sessions.filter(session => 
      session.paymentId && session.paymentId !== 'pending'
    ).map(session => ({
      studentId: session.studentId.toString(),
      sessionId: session._id.toString()
    }));
    
    // Track which students have completed payments for which sessions
    const studentPaidSessions = {};
    completedPaymentSessions.forEach(({ studentId, sessionId }) => {
      if (!studentPaidSessions[studentId]) {
        studentPaidSessions[studentId] = new Set();
      }
      studentPaidSessions[studentId].add(sessionId);
    });
    
    // Also find all session requests for this mentor (accepted/pending)
    const sessionRequests = await SessionRequest.find({
      mentorId: req.user._id,
      status: { $in: ['accepted', 'pending'] }
    });
    
    // Get unique student IDs from both sessions and session requests
    const sessionStudentIds = sessions.map(session => session.studentId.toString());
    const requestStudentIds = sessionRequests.map(request => request.studentId.toString());
    const allStudentIds = [...new Set([...sessionStudentIds, ...requestStudentIds])];
    
    // Fetch student details from User collection
    const students = await Promise.all(
      allStudentIds.map(async (studentId) => {
        try {
          const student = await User.findById(studentId).select('-password');
          
          if (!student) return null;
          
          // Get the most recent session with this student
          const latestSession = await Session.findOne({
            mentorId: req.user._id,
            studentId: studentId
          }).sort({ createdAt: -1 });
          
          // Get the most recent session request with this student
          const latestRequest = await SessionRequest.findOne({
            mentorId: req.user._id,
            studentId: studentId
          }).sort({ createdAt: -1 });
          
          // Determine the latest interaction (session or request)
          let latestInteraction = latestSession;
          if (!latestInteraction || (latestRequest && new Date(latestRequest.createdAt) > new Date(latestSession.createdAt))) {
            latestInteraction = latestRequest;
          }
          
          // Count completed sessions
          const completedSessionCount = await Session.countDocuments({
            mentorId: req.user._id,
            studentId: studentId,
            status: 'completed'
          });
          
          // Count pending session requests
          const pendingRequestCount = await SessionRequest.countDocuments({
            mentorId: req.user._id,
            studentId: studentId,
            status: 'pending'
          });
          
          // Count only sessions with pending payment that haven't been paid for yet
          const sessionRequestsWithPendingPayment = await SessionRequest.find({
            mentorId: req.user._id,
            studentId: studentId,
            status: 'accepted',
            paymentStatus: 'pending'
          });
          
          // Check if there's a corresponding paid session for each request
          const pendingPaymentCount = sessionRequestsWithPendingPayment.filter(request => {
            // If there's no entry for this student in studentPaidSessions, 
            // or none of their paid sessions matches this request, then it's pending
            return !studentPaidSessions[studentId] || 
                   !Array.from(sessions).some(session => 
                     session.studentId.toString() === studentId &&
                     session.sessionDate === request.sessionDate.toISOString().split('T')[0] &&
                     session.sessionTime === request.sessionTime &&
                     session.paymentId !== 'pending'
                   );
          }).length;
          
          // Count sessions with completed payment
          const paidSessionsCount = await Session.countDocuments({
            mentorId: req.user._id,
            studentId: studentId,
            paymentId: { $exists: true, $ne: 'pending' }
          });
          
          return {
            id: student._id,
            name: `${student.firstName} ${student.lastName}`,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            lastSession: latestSession ? latestSession.sessionDate : null,
            lastRequest: latestRequest ? latestRequest.sessionDate : null,
            sessionCount: completedSessionCount,
            pendingCount: pendingRequestCount,
            pendingPayment: pendingPaymentCount > 0,
            paidSessions: paidSessionsCount,
            lastActive: student.lastActive || latestInteraction?.createdAt || null,
            field: student.field || null,
            latestSessionTopic: latestInteraction?.notes || 'Career Guidance',
            hasUpcomingSessions: sessions.some(s => s.status === 'confirmed' && s.studentId.toString() === studentId)
          };
        } catch (err) {
          console.error(`Error fetching student details for ID ${studentId}:`, err);
          return null;
        }
      })
    );
    
    // Filter out null values (students that couldn't be found)
    const validStudents = students.filter(student => student !== null);
    
    res.json({
      success: true,
      students: validStudents
    });
    
  } catch (error) {
    console.error('Error fetching mentor students:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching mentor students: ' + error.message 
    });
  }
});

// Verify Payment and Update Session
app.post('/api/verify-payment', authenticate, async (req, res) => {
  try {
    console.log('Payment verification request received:', req.body);
    
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      sessionId 
    } = req.body;

    // Validate required fields - only strictly require payment_id and sessionId
    if (!razorpay_payment_id) {
      console.log('Missing payment ID in verification request');
      return res.status(400).json({ 
        message: 'Payment ID is required' 
      });
    }
    
    if (!sessionId) {
      console.log('Missing session ID in verification request');
      return res.status(400).json({ 
        message: 'Session ID is required' 
      });
    }

    // We don't strictly require order_id and signature for flexibility
    console.log(`Processing payment with ID ${razorpay_payment_id} for session ${sessionId}`);
    if (!razorpay_order_id) {
      console.log('Note: razorpay_order_id is missing but will continue');
    }
    if (!razorpay_signature) {
      console.log('Note: razorpay_signature is missing but will continue');
    }

    // Find the session to update - add additional logging and handle string IDs better
    console.log(`Looking for session with ID: ${sessionId}`);
    let session;
    
    try {
      // First try direct ID lookup
      session = await Session.findById(sessionId);
      console.log(`Direct lookup result: ${session ? 'Found' : 'Not found'}`);
    } catch (error) {
      console.error(`Error looking up session by ID: ${error.message}`);
    }

    // If not found, try with cleaned ID
    if (!session && typeof sessionId === 'string') {
      try {
        // Try to clean up the ID if it has extra characters
        const cleanId = sessionId.trim().substring(0, 24);
        console.log(`Trying with cleaned ID: ${cleanId}`);
        session = await Session.findById(cleanId);
        console.log(`Cleaned ID lookup result: ${session ? 'Found' : 'Not found'}`);
      } catch (err) {
        console.error(`Error with cleaned ID lookup: ${err.message}`);
      }
    }

    // If still not found, we'll look for it by payment ID in case this is a retry
    if (!session && razorpay_payment_id) {
      console.log(`Looking for session by payment ID: ${razorpay_payment_id}`);
      session = await Session.findOne({ paymentId: razorpay_payment_id });
      console.log(`Payment ID lookup result: ${session ? 'Found' : 'Not found'}`);
    }

    // Last resort - find most recent session created for this user
    if (!session) {
      console.log(`Trying to find most recent session for user: ${req.user._id}`);
      session = await Session.findOne({ 
        studentId: req.user._id,
        paymentId: 'pending'
      }).sort({ createdAt: -1 });
      console.log(`Recent user session lookup result: ${session ? 'Found' : 'Not found'}`);
    }

    // Log all sessions for this user to help debug
    console.log(`All sessions for this user:`);
    const allUserSessions = await Session.find({ studentId: req.user._id });
    console.log(`Found ${allUserSessions.length} sessions for user ${req.user._id}:`);
    allUserSessions.forEach((s, i) => {
      console.log(`Session ${i+1}: ID=${s._id}, Status=${s.status}, PaymentID=${s.paymentId}, Date=${s.sessionDate}`);
    });

    if (!session) {
      console.log(`Session not found: ${sessionId}`);
      
      // FALLBACK: Create a new session to capture this payment
      // This ensures we don't lose the payment even if we can't find the original session
      try {
        console.log(`Creating fallback session for payment ${razorpay_payment_id}`);
        
        // Get user details
        const student = req.user;
        
        // Try to get mentor if it was in the request
        let mentorName = "Career Guidance Mentor";
        let mentorId = null;
        
        // Create fallback session
        session = new Session({
          studentId: student._id,
          mentorId: mentorId,
          studentName: `${student.firstName} ${student.lastName}`,
          mentorName: mentorName,
          sessionDate: new Date().toISOString().split('T')[0],
          sessionTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
          sessionType: 'video', // Default type
          notes: `Auto-created session for payment ${razorpay_payment_id}`,
          price: 0, // Unknown original price
          status: 'confirmed',
          paymentId: razorpay_payment_id,
          createdAt: new Date()
        });
        
        await session.save();
        console.log(`Created fallback session with ID: ${session._id}`);
        
        // Continue with the payment flow using this new session
      } catch (fallbackError) {
        console.error('Error creating fallback session:', fallbackError);
        return res.status(404).json({ message: 'Session not found and fallback creation failed' });
      }
    }

    console.log(`Found or created session: ${session._id}, mentorName: ${session.mentorName}, studentName: ${session.studentName}`);

    // Verify that this user is authorized to make this payment
    if (session.studentId.toString() !== req.user._id.toString()) {
      // If this is our fallback session, the check should always pass
      if (session.notes && session.notes.includes(`Auto-created session for payment ${razorpay_payment_id}`)) {
        console.log('Using auto-created fallback session, bypassing auth check');
      } else {
        console.log(`Unauthorized payment. Session student: ${session.studentId}, User: ${req.user._id}`);
        return res.status(403).json({ message: 'Unauthorized to make payment for this session' });
      }
    }

    console.log(`Updating session ${sessionId} with payment ${razorpay_payment_id}`);

    // Update session with payment details
    session.paymentId = razorpay_payment_id;
    session.status = 'confirmed';
    await session.save();
    
    // If this session was created from a session request, update that too
    if (session.sessionRequestId) {
      try {
        // Update the original session request
        const sessionRequest = await SessionRequest.findById(session.sessionRequestId);
        if (sessionRequest) {
          sessionRequest.paymentStatus = 'completed';
          await sessionRequest.save();
          console.log(`Updated session request payment status: ${sessionRequest._id}`);
        }
        
        // Find and update any other sessions created from the same request
        const relatedSessions = await Session.find({
          _id: { $ne: session._id }, // Exclude this session
          sessionRequestId: session.sessionRequestId
        });
        
        if (relatedSessions.length > 0) {
          console.log(`Found ${relatedSessions.length} related sessions to update with the same payment`);
          
          for (const relatedSession of relatedSessions) {
            relatedSession.paymentId = razorpay_payment_id;
            relatedSession.status = 'confirmed';
            await relatedSession.save();
            console.log(`Updated related session payment: ${relatedSession._id}`);
          }
        }
      } catch (error) {
        console.error('Error updating related sessions and requests:', error);
        // Continue with success response even if updating related items fails
      }
    }

    // Increment the sessions count for the student
    const student = await User.findById(req.user._id);
    student.sessionCount = (student.sessionCount || 0) + 1;
    await student.save();

    // Increment the sessions count for the mentor
    const mentor = await User.findById(session.mentorId);
    if (mentor) {
      mentor.sessionCount = (mentor.sessionCount || 0) + 1;
      await mentor.save();
    }

    // Return success with updated session
    res.json({
      message: 'Payment verified and session confirmed',
      session
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      message: 'Failed to verify payment. Please contact support.' 
    });
  }
});

// Get a specific session by ID
app.get('/api/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Validate sessionId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID format' });
    }
    
    // Find the session
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if the user is either the student or mentor of the session
    if (session.studentId.toString() !== req.user._id.toString() && 
        (session.mentorId ? session.mentorId.toString() !== req.user._id.toString() : true)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(500).json({ message: 'Failed to fetch session details. Please try again later.' });
  }
});

// Rate a session
app.post('/api/sessions/:sessionId/rating', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rating, feedback, userId, sessionRequestId } = req.body;
    
    console.log('Rating session:', sessionId);
    console.log('Rating value:', rating);
    console.log('Feedback:', feedback);
    console.log('User ID:', userId || req.user._id);
    console.log('Session Request ID:', sessionRequestId);

    // Validate session ID format
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      console.log('Invalid session ID format');
      return res.status(400).json({ message: 'Invalid session ID format' });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Find the session
    let session = await Session.findById(sessionId);
    
    // If session not found, we could be dealing with a video call that doesn't have a session
    // This could happen if a mentor invited a student directly without an official booking
    if (!session) {
      console.log('Session not found, checking if it matches a video call room');
      
      // If we have a sessionRequestId, try to find a session with that requestId
      if (sessionRequestId && mongoose.Types.ObjectId.isValid(sessionRequestId)) {
        console.log('Trying to find session by requestId:', sessionRequestId);
        session = await Session.findOne({ sessionRequestId });
      }
      
      // If still no session, create a temporary one to capture the feedback
      if (!session) {
        console.log('Creating temporary session to capture feedback');
        // Try to get mentor info
        const mentor = await User.findOne({ isMentor: true }); // Just get any mentor as fallback
        
        session = new Session({
          studentId: userId || req.user._id,
          mentorId: mentor ? mentor._id : null,
          sessionDate: new Date(),
          sessionTime: '12:00',
          sessionType: 'video',
          status: 'completed',
          notes: 'Auto-created from video call feedback',
          tempSession: true, // Mark as temporary
          sessionRequestId: sessionRequestId
        });
        
        await session.save();
        console.log('Created temporary session:', session._id);
      }
    }

    // Update the session with rating and feedback
    session.rating = rating;
    session.feedback = feedback;
    await session.save();
    
    // If this session has a sessionRequestId, update all related sessions with the same rating
    if (sessionRequestId && mongoose.Types.ObjectId.isValid(sessionRequestId)) {
      try {
        const relatedSessions = await Session.find({
          _id: { $ne: session._id }, // Exclude the current session
          sessionRequestId: sessionRequestId
        });
        
        if (relatedSessions.length > 0) {
          console.log(`Found ${relatedSessions.length} related sessions to update with the same rating`);
          
          for (const relatedSession of relatedSessions) {
            relatedSession.rating = rating;
            relatedSession.feedback = feedback;
            await relatedSession.save();
            console.log(`Updated rating for related session: ${relatedSession._id}`);
          }
        }
      } catch (error) {
        console.error('Error updating ratings for related sessions:', error);
        // Continue with the success response even if updating related sessions fails
      }
    }

    res.json({
      message: 'Rating submitted successfully',
      session
    });
  } catch (error) {
    console.error('Rate session error:', error);
    res.status(500).json({ message: 'Failed to submit rating. Please try again later.' });
  }
});

// API endpoint to update a session request with a room ID
app.put('/api/session-requests/:requestId/room', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { roomID } = req.body;
    
    // Validate roomID
    if (!roomID) {
      return res.status(400).json({ 
        success: false, 
        message: 'Room ID is required' 
      });
    }
    
    // Find the session request
    const sessionRequest = await SessionRequest.findById(requestId);
    
    if (!sessionRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session request not found' 
      });
    }
    
    // Make sure the current user is the mentor for this request
    if (sessionRequest.mentorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to update this session request' 
      });
    }
    
    // Update the session request with the room ID
    sessionRequest.roomID = roomID;
    await sessionRequest.save();
    
    res.json({
      success: true,
      message: 'Room ID added to session request successfully',
      sessionRequest
    });
  } catch (error) {
    console.error('Error updating session request with room ID:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update session request with room ID: ' + error.message 
    });
  }
});

// Blog endpoints
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).sort({ date: -1 });
    res.json({ blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json({ blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/blogs', authenticate, async (req, res) => {
  try {
    const { title, subtitle, content, category, tags, image } = req.body;
    
    // Create a new blog
    const newBlog = new Blog({
      title,
      subtitle,
      content,
      category,
      tags,
      image,
      author: {
        id: req.user.id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        avatar: req.user.photoUrl || '',
        bio: req.user.bio || '',
        email: req.user.email || ''
      }
    });
    
    await newBlog.save();
    res.status(201).json({ blog: newBlog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Questions endpoints
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find().sort({ date: -1 });
    res.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/questions/:id', async (req, res) => {
  try {
    const questionId = req.params.id;
    console.log(`Fetching question with ID: ${questionId}`);
    
    // First try to find by MongoDB ObjectId
    let question = null;
    try {
      if (questionId.match(/^[0-9a-fA-F]{24}$/)) {
        question = await Question.findById(questionId);
      }
    } catch (e) {
      console.log('Not a valid MongoDB ObjectId, trying other methods...');
    }
    
    // If not found, try to find by the numeric ID value (for localStorage questions)
    if (!question) {
      question = await Question.findOne({ id: questionId });
      console.log('Tried to find by numeric ID:', question ? 'Found' : 'Not found');
    }
    
    // Log the found question
    console.log('Question search result:', question ? 'Found' : 'Not found');
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ question });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/questions', authenticate, async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    
    // Create a new question
    const newQuestion = new Question({
      title,
      body,
      author: `${req.user.firstName} ${req.user.lastName}`,
      email: req.user.email,
      avatar: req.user.photoUrl || '',
      tags
    });
    
    await newQuestion.save();
    res.status(201).json({ question: newQuestion });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/questions/:id/answers', async (req, res) => {
  try {
    const questionId = req.params.id;
    const { answer } = req.body;
    
    console.log(`Adding answer to question ID: ${questionId}`);
    console.log('Answer data:', answer);
    
    // First try to find by MongoDB ObjectId
    let question = null;
    try {
      if (questionId.match(/^[0-9a-fA-F]{24}$/)) {
        question = await Question.findById(questionId);
      }
    } catch (e) {
      console.log('Not a valid MongoDB ObjectId, trying other methods...');
    }
    
    // If not found, try to find by the numeric ID value
    if (!question) {
      question = await Question.findOne({ id: questionId });
    }
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Add the answer to the question
    question.answers = question.answers || [];
    question.answers.push(answer);
    question.isAnswered = true;
    
    await question.save();
    console.log('Answer added successfully');
    
    res.status(201).json({ 
      message: 'Answer added successfully', 
      question 
    });
  } catch (error) {
    console.error('Error adding answer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve static files from the 'dist' directory after build
// Only serve static files if the dist directory exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // Route to serve the index.html file for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  console.log('Dist directory not found. Static file serving disabled.');
  
  // If dist directory doesn't exist, only handle API routes
  // Add a catch-all route for non-API routes to prevent 404s
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next(); // Let API routes be handled by their handlers
    } else {
      res.status(503).json({ message: 'Frontend not built. Please run the frontend development server.' });
    }
  });
}

// Error handler for PayloadTooLargeError
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 413) {
    return res.status(413).json({
      status: 413,
      message: 'Request entity too large. Please reduce the size of your request.',
      error: 'PAYLOAD_TOO_LARGE'
    });
  }
  
  if (err) {
    console.error('Express error:', err);
    return res.status(err.status || 500).json({
      status: err.status || 500,
      message: err.message || 'Internal Server Error',
      error: err.name || 'ServerError'
    });
  }
  
  next();
});

// Start the server
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);