import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, isMentorRoute = false }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkblue">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={isMentorRoute ? "/mentor-login" : "/student-login"} state={{ from: location }} replace />;
  }

  if (isMentorRoute && !currentUser.isMentor) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isMentorRoute && currentUser.isMentor) {
    return <Navigate to="/mentor-dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;