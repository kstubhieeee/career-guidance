import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Interests from './pages/Interests';
import Mcq from './pages/Mcq';
import Analysis from './pages/Analysis';
import Dashboard from './pages/Dashboard';
import MentorDashboard from './pages/MentorDashboard';
import FindMentors from './pages/FindMentors';
import MyBookings from './pages/MyBookings';
import SessionHistory from './pages/SessionHistory';
import Assesment from './pages/Assesment';
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