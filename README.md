# Career Guidance Platform

A comprehensive web application that connects students with mentors for career guidance and professional development through video consultations.

## 👥 Authors

- **Kaustubh Vijay Bane** - [kstubhieeee](https://github.com/kstubhieeee)
- **Faiz Moulavi** - [faizzz11](https://github.com/faizzz11)
- **Karan Banerjee** - [hi-karanb](https://github.com/hi-karanb)

## 🌟 Features

### For Students
- **Career Assessment**
  - Comprehensive STEM field assessment (Science, Technology, Engineering, Mathematics)
  - Interactive questionnaire with personalized questions
  - Visual score distribution with pie charts and progress bars
  - AI-powered career analysis and recommendations
  - Detailed breakdown of strengths in each STEM field
  - Personalized skills development recommendations
  - Suggested work environments based on assessment results
  - Option to retake assessment for updated insights

- **Mentor Discovery**
  - Browse through a curated list of experienced mentors
  - Filter mentors by specialization, experience, and ratings
  - View detailed mentor profiles and expertise

- **Session Management**
  - Book one-on-one mentoring sessions
  - Schedule follow-up consultations
  - Track session history and progress
  - Rate and review mentoring sessions

- **Video Consultation**
  - Seamless video calls with mentors
  - Real-time chat during sessions
  - Session recording and playback
  - Screen sharing capabilities

### For Mentors
- **Profile Management**
  - Create and customize professional profiles
  - Set availability and pricing
  - Manage session requests
  - Track earnings and performance

- **Session Management**
  - Accept/reject session requests
  - Schedule and manage sessions
  - Conduct video consultations
  - Track student progress

- **Dashboard**
  - View upcoming and completed sessions
  - Monitor student engagement
  - Track earnings and ratings
  - Quick access to video calls

## 🛠️ Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS for styling
- ZegoCloud for video conferencing
- React Router for navigation
- Context API for state management

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Socket.IO for real-time communication

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Server Configuration
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_uri

# API Keys
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# ZegoCloud Configuration
VITE_ZEGO_APP_ID=your_zego_app_id
VITE_ZEGO_SERVER_SECRET=your_zego_server_secret
VITE_ZEGO_SERVER_URL=your_zego_server_url
VITE_ZEGO_APP_SIGN=your_zego_app_sign
VITE_ZEGO_CALLBACK_SECRET=your_zego_callback_secret
```

> Note: All frontend environment variables must be prefixed with `VITE_` to be accessible in the React application.

### Installation

1. Clone the repository
```bash
git clone https://github.com/kstubhieeee/career-guidance.git
cd career-guidance
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual values
```

4. Start the development servers
```bash
# Start backend server
node server.js

# Start frontend server
npm run dev
```

## �� Project Structure
```
📦 
├─ .env
├─ .gitignore
├─ README.md
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ images
│  │  └─ razorpay-logo.svg
│  ├─ index.html
│  ├─ mentor-img
│  │  ├─ mentor-1743331654229.png
│  │  └─ mentor-1743340095206.jpg
│  └─ test-razorpay.html
├─ server.js
├─ src
│  ├─ App.jsx
│  ├─ assets
│  │  ├─ Images
│  │  │  ├─ hero
│  │  │  │  └─ image.png
│  │  │  └─ pexels-photo-2080963.jpeg
│  │  └─ stem.png
│  ├─ components
│  │  ├─ About.jsx
│  │  ├─ Contact.jsx
│  │  ├─ Footer.jsx
│  │  ├─ Hero.jsx
│  │  ├─ InterestSection.jsx
│  │  ├─ MentorBookingModal.jsx
│  │  ├─ MentorRatingModal.jsx
│  │  ├─ Navbar.jsx
│  │  ├─ ProtectedRoute.jsx
│  │  ├─ ProtectedRouteShared.jsx
│  │  ├─ SessionPaymentModal.jsx
│  │  ├─ UserMenu.jsx
│  │  ├─ VideoCallWrapper.jsx
│  │  └─ ZegoVideoCall.jsx
│  ├─ context
│  │  ├─ AssessmentContext.jsx
│  │  └─ AuthContext.jsx
│  ├─ data
│  │  ├─ aboutData.json
│  │  ├─ careerFields.json
│  │  ├─ contactData.json
│  │  ├─ heroData.json
│  │  ├─ interestsData.json
│  │  ├─ mentorIMG
│  │  │  ├─ 2dummyIMG.png
│  │  │  ├─ 3mentor.png
│  │  │  └─ dummyMentor.png
│  │  ├─ mentors.json
│  │  └─ questions.json
│  ├─ index.css
│  ├─ index.jsx
│  ├─ pages
│  │  ├─ Analysis.jsx
│  │  ├─ Assesment.jsx
│  │  ├─ Dashboard.jsx
│  │  ├─ FindMentors.jsx
│  │  ├─ Home.jsx
│  │  ├─ Interests.jsx
│  │  ├─ Login.jsx
│  │  ├─ Mcq.jsx
│  │  ├─ MenteeRequests.jsx
│  │  ├─ MentorDashboard.jsx
│  │  ├─ MentorLogin.jsx
│  │  ├─ MentorSignup.jsx
│  │  ├─ MyBookings.jsx
│  │  ├─ RateSession.jsx
│  │  ├─ SessionHistory.jsx
│  │  ├─ SessionPayment.jsx
│  │  ├─ StudentLogin.jsx
│  │  ├─ StudentSignup.jsx
│  │  ├─ TextMessage.jsx
│  │  ├─ VideoCall.jsx
│  │  ├─ VideoCallActive.jsx
│  │  ├─ VideoCallSetup.jsx
│  │  └─ VoiceCall.jsx
│  └─ utils
│     ├─ analysisApi.js
│     ├─ env.js
│     └─ mcqGenerationApi.js
├─ tailwind.config.js
└─ vite.config.js
```


## 🔒 Security Features

- JWT-based authentication
- Secure password hashing
- Protected API routes
- Input validation and sanitization
- Rate limiting
- CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request




## 🙏 Acknowledgments

- ZegoCloud for video conferencing capabilities
- MongoDB Atlas for database hosting
- All contributors and users of the platform


---

Made with ❤️ by Zero KT FC
