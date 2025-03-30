import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import MentorLogin from './pages/MentorLogin';
import Interests from './pages/Interests';
import Mcq from './pages/Mcq';
import Analysis from './pages/Analysis';
import Dashboard from './pages/Dashboard';
import MentorDashboard from './pages/MentorDashboard';
import FindMentors from './pages/FindMentors';
import MyBookings from './pages/MyBookings';
import SessionHistory from './pages/SessionHistory';
import Assesment from './pages/Assesment';
import MentorSignup from './pages/MentorSignup';
import MenteeRequests from './pages/MenteeRequests';
import SessionPayment from './pages/SessionPayment';
import VideoCall from './pages/VideoCall';
import VideoCallSetupPage from './pages/VideoCallSetup';
import VideoCallActivePage from './pages/VideoCallActive';
import RateSession from './pages/RateSession';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteShared from './components/ProtectedRouteShared';
import { AuthProvider } from './context/AuthContext';
import { AssessmentProvider } from './context/AssessmentContext.jsx';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/student-login', '/student-signup', '/mentor-login', '/mentor-signup'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-darkblue">
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-signup" element={<StudentSignup />} />
        <Route path="/mentor-login" element={<MentorLogin />} />
        <Route path="/mentor-signup" element={<MentorSignup />} />
        <Route path="/interests" element={<Interests />} />
        <Route path="/assessment" element={<Assesment />} />
        <Route path="/mcq" element={
          <ProtectedRoute>
            <AssessmentProvider>
              <Mcq />
            </AssessmentProvider>
          </ProtectedRoute>
        } />
        <Route path="/analysis" element={
          <ProtectedRoute>
            <AssessmentProvider>
              <Analysis />
            </AssessmentProvider>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/mentor-dashboard" element={
          <ProtectedRoute isMentorRoute={true}>
            <MentorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/mentee-requests" element={
          <ProtectedRoute isMentorRoute={true}>
            <MenteeRequests />
          </ProtectedRoute>
        } />
        <Route path="/find-mentors" element={<FindMentors />} />
        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } />
        <Route path="/session-payment" element={
          <ProtectedRoute>
            <SessionPayment />
          </ProtectedRoute>
        } />
        <Route path="/session-history" element={
          <ProtectedRoute>
            <SessionHistory />
          </ProtectedRoute>
        } />
        <Route path="/video-call" element={
          <ProtectedRouteShared>
            <VideoCall />
          </ProtectedRouteShared>
        } />
        <Route path="/video-call-setup" element={
          <ProtectedRouteShared>
            <VideoCallSetupPage />
          </ProtectedRouteShared>
        } />
        <Route path="/video-call-active" element={
          <ProtectedRouteShared>
            <VideoCallActivePage />
          </ProtectedRouteShared>
        } />
        <Route path="/rate-session" element={
          <ProtectedRoute>
            <RateSession />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;