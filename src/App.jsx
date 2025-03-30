import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Interests from './pages/Interests';
import Mcq from './pages/Mcq';
import Dashboard from './pages/Dashboard';
import MentorDashboard from './pages/MentorDashboard';
import FindMentors from './pages/FindMentors';
import MyBookings from './pages/MyBookings';
import SessionHistory from './pages/SessionHistory';
import Assesment from './pages/assesment';
import MentorSignup from './pages/MentorSignup';
import MenteeRequests from './pages/MenteeRequests';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { AssessmentProvider } from './context/AssessmentContext.jsx';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-darkblue">
      {!isLoginPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
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
        <Route path="/session-history" element={
          <ProtectedRoute>
            <SessionHistory />
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