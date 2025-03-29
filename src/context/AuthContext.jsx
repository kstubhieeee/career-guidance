import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

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
        const response = await fetch('http://localhost:3250/api/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          
          // Update localStorage and state if server data is available
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          setCurrentUser(data.user);
        } else {
          // Clear localStorage if server doesn't recognize the user
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
      const response = await fetch('http://localhost:3250/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setCurrentUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:3250/api/login', {
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
      const response = await fetch('http://localhost:3250/api/logout', {
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
      const response = await fetch('http://localhost:3250/api/assessment', {
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
      const response = await fetch('http://localhost:3250/api/assessments', {
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