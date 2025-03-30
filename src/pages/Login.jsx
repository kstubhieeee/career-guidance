import React from 'react';
import { Link, Navigate } from 'react-router-dom';

function Login() {
  // Automatically redirect to student login as default
  return <Navigate to="/student-login" replace />;
}

export default Login;