import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, isMentorRoute = false }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-darkblue flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if this is a mentor route and the user is not a mentor
  if (isMentorRoute && !currentUser.isMentor) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if this is a student route and the user is a mentor
  if (!isMentorRoute && currentUser.isMentor) {
    return <Navigate to="/mentor-dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;