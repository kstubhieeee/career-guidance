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
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: function(origin, callback) {
    // Allow any origin in development
    return callback(null, true);
  },
  credentials: true
}));

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
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' }
}, { timestamps: true });

// Create models
const User = mongoose.model('User', userSchema);
const Assessment = mongoose.model('Assessment', assessmentSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Session = mongoose.model('Session', sessionSchema);
const SessionRequest = mongoose.model('SessionRequest', sessionRequestSchema);

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

// Create a new session booking
app.post('/api/sessions', authenticate, async (req, res) => {
  try {
    console.log('Received session booking request:', req.body);
    console.log('Authenticated user:', { id: req.user._id, name: `${req.user.firstName} ${req.user.lastName}` });
    
    const {
      mentorId,
      mentorName,
      sessionDate,
      sessionTime,
      sessionType,
      notes,
      price,
      paymentId
    } = req.body;
    
    // Validate mentorId is a valid MongoDB ObjectId
    let validMentorId;
    try {
      if (mentorId && mongoose.Types.ObjectId.isValid(mentorId)) {
        validMentorId = new mongoose.Types.ObjectId(mentorId);
      } else {
        // For demo purposes, allow non-MongoDB IDs but convert them
        console.warn('Invalid mentorId received:', mentorId);
        validMentorId = new mongoose.Types.ObjectId('000000000000000000000000'); // Use a placeholder ObjectId
      }
    } catch (error) {
      console.error('Error validating mentorId:', error);
      validMentorId = new mongoose.Types.ObjectId('000000000000000000000000'); // Use a placeholder ObjectId
    }
    
    const newSession = new Session({
      mentorId: validMentorId,
      mentorName,
      studentId: req.user._id,
      studentName: `${req.user.firstName} ${req.user.lastName}`,
      sessionDate,
      sessionTime,
      sessionType,
      notes,
      price,
      paymentId,
      status: 'confirmed'
    });
    
    console.log('Saving session to database:', newSession);
    await newSession.save();
    
    res.status(201).json({
      message: 'Session booked successfully',
      session: newSession
    });
  } catch (error) {
    console.error('Session booking error:', error);
    res.status(500).json({ message: 'Failed to book session. Please try again later.' });
  }
});

// Get all sessions for a user
app.get('/api/sessions', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find sessions where the user is either a student or mentor
    let sessions;
    
    if (req.user.isMentor) {
      // If user is a mentor, find sessions where they are the mentor
      sessions = await Session.find({ mentorId: userId });
    } else {
      // If user is a student, find sessions where they are the student
      sessions = await Session.find({ studentId: userId });
      
      // For each session, check if there's a related session request
      // This helps determine payment status for the frontend
      for (const session of sessions) {
        try {
          // Find any related session request
          const relatedRequest = await SessionRequest.findOne({
            studentId: userId,
            mentorId: session.mentorId,
            sessionDate: new Date(session.sessionDate),
            sessionTime: session.sessionTime
          });
          
          if (relatedRequest) {
            // Add paymentStatus from the request if it's available and the session doesn't have one
            if (relatedRequest.paymentStatus === 'completed' && (!session.paymentId || session.paymentId === 'pending')) {
              session.paymentStatus = 'completed';
              // Update the session to note it's been paid for
              if (session.paymentId === 'pending') {
                session.paymentId = relatedRequest._id.toString() + '_paid';
                await session.save();
              }
            }
          }
        } catch (err) {
          console.error('Error processing related session request:', err);
          // Continue with the next session even if there's an error with this one
        }
      }
    }
    
    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching sessions: ' + error.message 
    });
  }
});

// Get user's sessions (as mentor)
app.get('/api/mentor/sessions', authenticate, async (req, res) => {
  try {
    // Check if the user is a mentor
    if (!req.user.isMentor) {
      return res.status(403).json({ message: 'Access denied. User is not a mentor.' });
    }
    
    const sessions = await Session.find({ mentorId: req.user._id })
      .sort({ createdAt: -1 });
    
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
    
    const sessionRequests = await SessionRequest.find({ 
      mentorId: req.user._id 
    }).sort({ createdAt: -1 });
    
    // Get student details for each request
    const requestsWithStudentDetails = await Promise.all(sessionRequests.map(async (request) => {
      const student = await User.findById(request.studentId).select('-password');
      return {
        ...request.toObject(),
        student: student || null
      };
    }));
    
    res.json({
      success: true,
      sessionRequests: requestsWithStudentDetails
    });
  } catch (error) {
    console.error('Error fetching session requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching session requests: ' + error.message 
    });
  }
});

// Update session request status
app.put('/api/session-requests/:requestId', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    
    console.log('Updating session request:', { requestId, status });
    
    if (!['accepted', 'rejected', 'pending', 'approved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Find the session request
    const sessionRequest = await SessionRequest.findById(requestId);
    
    if (!sessionRequest) {
      console.log('Session request not found:', requestId);
      return res.status(404).json({ message: 'Session request not found' });
    }
    
    // Check if the user is the mentor for this request
    if (sessionRequest.mentorId.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access attempt:', {
        requestMentorId: sessionRequest.mentorId,
        currentUserId: req.user._id
      });
      return res.status(403).json({ message: 'You are not authorized to update this request' });
    }
    
    // Update the session request status
    sessionRequest.status = status;
    await sessionRequest.save();
    
    // If the mentor accepted the request, create a new session
    if (status === 'accepted' || status === 'approved') {
      try {
        // Get the student and mentor information
        const student = await User.findById(sessionRequest.studentId);
        const mentor = await User.findById(sessionRequest.mentorId);
        
        if (!student || !mentor) {
          console.log('Student or mentor not found:', {
            studentId: sessionRequest.studentId,
            mentorId: sessionRequest.mentorId
          });
          return res.status(404).json({ message: 'Student or mentor not found' });
        }
        
        // Check if a session already exists for this request to avoid duplicates
        const existingSession = await Session.findOne({
          studentId: sessionRequest.studentId,
          mentorId: sessionRequest.mentorId,
          sessionDate: sessionRequest.sessionDate.toISOString().split('T')[0],
          sessionTime: sessionRequest.sessionTime
        });
        
        if (existingSession) {
          console.log('Session already exists for this request:', existingSession._id);
          
          // Update the existing session if needed
          if (existingSession.status !== 'accepted') {
            existingSession.status = 'accepted';
            await existingSession.save();
            console.log('Updated existing session status to accepted');
          }
        } else {
          // Create a new session
          const session = new Session({
            studentId: sessionRequest.studentId,
            mentorId: sessionRequest.mentorId,
            studentName: `${student.firstName} ${student.lastName}`,
            mentorName: `${mentor.firstName} ${mentor.lastName}`,
            sessionDate: sessionRequest.sessionDate.toISOString().split('T')[0],
            sessionTime: sessionRequest.sessionTime,
            sessionType: sessionRequest.sessionType,
            notes: sessionRequest.notes,
            status: 'confirmed',
            price: mentor.price,
            paymentId: 'pending' // This will be updated when payment is made
          });
          
          console.log('Creating new session with price:', mentor.price);
          await session.save();
          console.log('New session created:', session._id);
        }
        
        // Make sure payment status is set to pending
        sessionRequest.paymentStatus = 'pending';
        await sessionRequest.save();
        
        // Don't increment the sessions count here - do it when payment is made
      } catch (error) {
        console.error('Error creating session after accepting request:', error);
        // Don't throw here, just log the error
      }
    }
    
    return res.status(200).json({ 
      message: `Session request ${status} successfully`,
      sessionRequest
    });
  } catch (error) {
    console.error('Error updating session request:', error);
    return res.status(500).json({ 
      message: 'Server error. Please try again.',
      error: error.message // Include error message for debugging
    });
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
      
      const requestObj = request.toObject();
      
      // Add a derived status that combines the request status with payment information
      if (paidSession) {
        requestObj.derivedStatus = 'paid';
        requestObj.paymentId = paidSession.paymentId;
        requestObj.displayStatus = 'Paid';
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

// Update session payment status
app.put('/api/sessions/:sessionId/payment', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { paymentId } = req.body;

    console.log('Updating session payment:', { sessionId, paymentId });
    console.log('User:', { id: req.user._id, name: `${req.user.firstName} ${req.user.lastName}` });

    // Validate sessionId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      console.error('Invalid session ID format:', sessionId);
      return res.status(400).json({ message: 'Invalid session ID format' });
    }

    // First try to find the specific session
    let session = await Session.findById(sessionId);
    
    // If no session found, check if it's a session request
    if (!session) {
      console.log('Session not found with ID:', sessionId, 'Checking for session request...');
      
      const sessionRequest = await SessionRequest.findById(sessionId);
      if (sessionRequest) {
        console.log('Found session request instead:', sessionRequest._id);
        
        // Make sure the requesting user is the student in the session request
        if (sessionRequest.studentId.toString() !== req.user._id.toString()) {
          console.error('User not authorized to update this session request:', {
            requestStudentId: sessionRequest.studentId,
            userId: req.user._id
          });
          return res.status(403).json({ message: 'You are not authorized to update this session request' });
        }
        
        // Check if a session already exists for this request (to avoid duplicates)
        const existingSession = await Session.findOne({
          studentId: sessionRequest.studentId,
          mentorId: sessionRequest.mentorId,
          sessionDate: sessionRequest.sessionDate.toISOString().split('T')[0],
          sessionTime: sessionRequest.sessionTime,
        });
        
        if (existingSession) {
          console.log('Session already exists for this request. Updating payment:', existingSession._id);
          
          // Update the existing session with payment info
          existingSession.paymentId = paymentId;
          existingSession.status = 'confirmed';
          await existingSession.save();
          
          // Update session request payment status
          sessionRequest.paymentStatus = 'completed';
          await sessionRequest.save();
          
          return res.status(200).json({
            message: 'Existing session payment updated successfully',
            session: existingSession
          });
        }
        
        // Get the mentor information to get the price
        const mentor = await User.findById(sessionRequest.mentorId);
        if (!mentor) {
          console.error('Mentor not found for session request:', sessionRequest.mentorId);
          return res.status(404).json({ message: 'Mentor not found for this session request' });
        }
        
        console.log('Creating new session from request with mentor:', mentor.firstName, mentor.lastName);
        
        // Create a new session from the session request
        const newSession = new Session({
          studentId: sessionRequest.studentId,
          mentorId: sessionRequest.mentorId,
          studentName: sessionRequest.studentName,
          mentorName: `${mentor.firstName} ${mentor.lastName}`,
          sessionDate: sessionRequest.sessionDate.toISOString().split('T')[0],
          sessionTime: sessionRequest.sessionTime,
          sessionType: sessionRequest.sessionType,
          notes: sessionRequest.notes,
          status: 'confirmed',
          price: mentor.price || 0,
          paymentId: paymentId
        });
        
        await newSession.save();
        console.log('Created new session from session request:', newSession._id);
        
        // Update the session request status to accepted and payment status to completed
        sessionRequest.status = 'accepted';
        sessionRequest.paymentStatus = 'completed';
        await sessionRequest.save();
        console.log('Updated session request status to accepted and payment completed');
        
        // Increment the mentor's sessions count
        if (!mentor.sessionsCompleted || typeof mentor.sessionsCompleted !== 'number') {
          mentor.sessionsCompleted = 1;
        } else {
          mentor.sessionsCompleted += 1;
        }
        await mentor.save();
        console.log('Updated mentor session count to:', mentor.sessionsCompleted);
        
        // Return the newly created session
        return res.status(200).json({
          message: 'New session created and payment recorded successfully',
          session: newSession
        });
      }
      
      console.error('No session or session request found with ID:', sessionId);
      return res.status(404).json({ message: 'Session not found' });
    }

    // We found a session - update it with the payment info
    console.log('Found existing session:', session._id);
    
    // Check if the user is the student for this session
    if (session.studentId.toString() !== req.user._id.toString()) {
      console.error('Unauthorized access attempt:', {
        sessionStudentId: session.studentId,
        currentUserId: req.user._id
      });
      return res.status(403).json({ message: 'You are not authorized to update this session' });
    }
    
    // If payment has already been made, don't process it again
    if (session.paymentId && session.paymentId !== 'pending') {
      console.log('Payment already processed for this session:', session.paymentId);
      return res.status(200).json({
        message: 'Payment was already processed for this session',
        session
      });
    }

    // Update the session payment status
    session.paymentId = paymentId;
    
    // Change status to confirmed now that payment is complete
    if (session.status === 'accepted') {
      session.status = 'confirmed';
      console.log('Updating session status from accepted to confirmed after payment');
    }
    
    await session.save();

    console.log('Session payment updated successfully:', session._id);
    
    // Attempt to find any associated sessions with the same details
    // This is to handle potential duplicate sessions created during payment flow
    try {
      const otherSessions = await Session.find({
        _id: { $ne: session._id },
        studentId: session.studentId,
        mentorId: session.mentorId,
        sessionDate: session.sessionDate,
        sessionTime: session.sessionTime,
      });
      
      for (const otherSession of otherSessions) {
        // Mark these sessions as paid too
        otherSession.paymentId = paymentId;
        otherSession.status = 'confirmed';
        await otherSession.save();
        console.log('Updated duplicate session with payment:', otherSession._id);
      }
    } catch (error) {
      console.error('Error updating duplicate sessions:', error);
      // Continue execution even if this fails
    }
    
    // Find and update any corresponding session requests
    try {
      // This is important to keep session requests and sessions in sync
      const sessionRequests = await SessionRequest.find({
        studentId: session.studentId,
        mentorId: session.mentorId,
        // Convert sessionDate to a Date object for comparison
        sessionDate: new Date(session.sessionDate),
        sessionTime: session.sessionTime
      });
      
      for (const request of sessionRequests) {
        request.paymentStatus = 'completed';
        // Also ensure the status is accepted or confirmed
        if (request.status === 'pending') {
          request.status = 'accepted';
        }
        await request.save();
        console.log('Updated session request payment status:', request._id);
      }
    } catch (error) {
      console.error('Error updating related session requests:', error);
      // Continue execution even if this fails
    }

    return res.status(200).json({
      message: 'Session payment updated successfully',
      session
    });
  } catch (error) {
    console.error('Error updating session payment:', error);
    return res.status(500).json({
      message: 'Server error. Please try again.',
      error: error.message
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