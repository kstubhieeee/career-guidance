const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3250;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/career-guidance';

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

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
  experience: { type: Number }, // For mentors
  specialization: { type: String }, // For mentors
  bio: { type: String }, // For mentors
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

// Create models
const User = mongoose.model('User', userSchema);
const Assessment = mongoose.model('Assessment', assessmentSchema);
const Contact = mongoose.model('Contact', contactSchema);

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
    const { firstName, lastName, email, password, isMentor, experience, specialization, bio } = req.body;
    
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
      experience: experience,
      specialization: specialization,
      bio: bio
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
        experience: user.experience,
        specialization: user.specialization,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
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
        experience: user.experience,
        specialization: user.specialization,
        bio: user.bio
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

// Serve static files from the 'dist' directory after build
app.use(express.static(path.join(__dirname, 'dist')));

// Route to serve the index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});