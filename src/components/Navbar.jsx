import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

// API base URL constant
const API_BASE_URL = 'http://localhost:3250';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const [pendingRequests, setPendingRequests] = useState(0);

  // Determine if the user is a mentor
  const isMentor = currentUser?.isMentor;

  // Fetch pending session requests for mentors
  useEffect(() => {
    if (currentUser && isMentor) {
      const fetchPendingRequests = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/mentor/session-requests`, {
            method: 'GET',
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to fetch session requests');
          }

          const data = await response.json();
          // Count pending requests
          const pendingCount = data.sessionRequests?.filter(req => req.status === 'pending').length || 0;
          setPendingRequests(pendingCount);
        } catch (error) {
          console.error('Error fetching pending requests:', error);
        }
      };

      fetchPendingRequests();

      // Set up polling every 2 minutes
      const intervalId = setInterval(fetchPendingRequests, 120000);

      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [currentUser, isMentor]);

  return (
    <nav className="bg-darkblue-dark shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link className="text-2xl font-bold text-white" to="/">
            Career <span className="text-primary">Guidant</span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-primary focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link className="text-white hover:text-primary transition-colors" to="/">Home</Link>
            <Link className="text-white hover:text-primary transition-colors" to="/find-mentors">Find Mentors</Link>

            {/* Different navigation links based on user type */}
            {!currentUser && (
              <>
                <Link className="text-white hover:text-primary transition-colors" to="/interests">Interests</Link>
                <Link className="text-white hover:text-primary transition-colors" to="/assessment">Assessment</Link>
              </>
            )}

            {currentUser && !isMentor && (
              <>
                <Link className="text-white hover:text-primary transition-colors" to="/interests">Interests</Link>
                <Link className="text-white hover:text-primary transition-colors" to="/assessment">Assessment</Link>
              </>
            )}

            {currentUser && isMentor && (
              <>
                <Link className="text-white hover:text-primary transition-colors" to="/mentor-dashboard">Mentor Dashboard</Link>
                <Link className="text-white hover:text-primary transition-colors relative" to="/mentee-requests">
                  Mentee Requests
                  {pendingRequests > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingRequests}
                    </span>
                  )}
                </Link>
              </>
            )}

            {currentUser ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-4">
                <Link className="text-white border border-primary px-4 py-2 rounded hover:bg-primary-dark hover:text-white transition-colors" to="/mentor-signup">Become a Mentor</Link>
                <Link className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors" to="/student-login">Login</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link
                className="text-white hover:text-primary transition-colors"
                to="/"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>

              <Link
                className="text-white hover:text-primary transition-colors"
                to="/find-mentors"
                onClick={() => setIsOpen(false)}
              >
                Find Mentors
              </Link>

              {/* Mobile menu items for visitors */}
              {!currentUser && (
                <>
                  <Link
                    className="text-white hover:text-primary transition-colors"
                    to="/interests"
                    onClick={() => setIsOpen(false)}
                  >
                    Interests
                  </Link>
                  <Link
                    className="text-white hover:text-primary transition-colors"
                    to="/assessment"
                    onClick={() => setIsOpen(false)}
                  >
                    Assessment
                  </Link>
                </>
              )}

              {/* Mobile menu items for students */}
              {currentUser && !isMentor && (
                <>
                  <Link
                    className="text-white hover:text-primary transition-colors"
                    to="/interests"
                    onClick={() => setIsOpen(false)}
                  >
                    Interests
                  </Link>
                  <Link
                    className="text-white hover:text-primary transition-colors"
                    to="/assessment"
                    onClick={() => setIsOpen(false)}
                  >
                    Assessment
                  </Link>
                  <Link
                    className="text-white hover:text-primary transition-colors"
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                </>
              )}

              {/* Mobile menu items for mentors */}
              {currentUser && isMentor && (
                <>
                  <Link
                    className="text-white hover:text-primary transition-colors"
                    to="/mentor-dashboard"
                    onClick={() => setIsOpen(false)}
                  >
                    Mentor Dashboard
                  </Link>
                  <Link
                    className="text-white hover:text-primary transition-colors relative"
                    to="/mentee-requests"
                    onClick={() => setIsOpen(false)}
                  >
                    Mentee Requests
                    {pendingRequests > 0 && (
                      <span className="absolute right-0 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {pendingRequests}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Authentication links */}
              {currentUser ? (
                <div className="p-2">
                  <Link to="/profile" className="block py-2 px-4 text-white hover:bg-secondary-dark rounded-lg transition-colors">
                    Profile
                  </Link>
                  <Link to="/my-bookings" className="block py-2 px-4 text-white hover:bg-secondary-dark rounded-lg transition-colors">
                    My Bookings
                  </Link>
                  <Link to="/session-history" className="block py-2 px-4 text-white hover:bg-secondary-dark rounded-lg transition-colors">
                    Session History
                  </Link>
                  <hr className="border-gray-700 my-1" />
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full text-left py-2 px-4 text-white hover:bg-secondary-dark rounded-lg transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    className="text-white border border-primary px-4 py-2 rounded hover:bg-primary-dark hover:text-white transition-colors inline-block mb-2"
                    to="/mentor-signup"
                    onClick={() => setIsOpen(false)}
                  >
                    Become a Mentor
                  </Link>
                  <Link
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors inline-block"
                    to="/student-login"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;