import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Add a base URL constant
const API_BASE_URL = 'http://localhost:3250';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // First check if we have user data in localStorage
        const savedUser = localStorage.getItem('currentUser');

        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
          setLoading(false);
        }

        // Always verify with the server even if we have local data
        const response = await fetch(`${API_BASE_URL}/api/user`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();

          // Update localStorage and state if server data is available
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          setCurrentUser(data.user);
        } else if (response.status === 401) {
          // User is not authenticated - this is normal during signup/login
          // Just clear the user data silently
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        } else {
          // Other errors - clear localStorage if server doesn't recognize the user
          console.error('Server error:', response.status);
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        // Don't clear localStorage on network errors to prevent logout
        // when server is temporarily unavailable
        if (!localStorage.getItem('currentUser')) {
          setCurrentUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const register = async (userData) => {
    try {
      setError(null);

      // Clean up the userData based on isMentor flag
      let registerData = { ...userData };

      // If user is not a mentor, remove mentor-specific fields
      if (!registerData.isMentor) {
        // Keep only these fields for students - explicitly removing mentor fields
        const { firstName, lastName, email, password, isMentor } = registerData;
        registerData = {
          firstName,
          lastName,
          email,
          password,
          isMentor
        };
      }

      console.log('Sending registration request to server with data:', {
        ...registerData,
        password: '[REDACTED]' // Don't log the actual password
      });

      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setCurrentUser(data.user);
      return data;
    } catch (err) {
      console.error('Registration error in AuthContext:', err);
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setCurrentUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Logout failed');
      }

      localStorage.removeItem('currentUser');
      setCurrentUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const saveAssessment = async (assessmentData) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save assessment');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getAssessments = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/assessments`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch assessments');
      }

      return data.assessments;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    saveAssessment,
    getAssessments
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;