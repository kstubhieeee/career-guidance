import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();
  
  // Determine if the user is a mentor
  const isMentor = currentUser?.isMentor;

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
            
            {/* Different navigation links based on user type */}
            {!currentUser && (
              <>
                <Link className="text-white hover:text-primary transition-colors" to="/interests">Interests</Link>
                <Link className="text-white hover:text-primary transition-colors" to="/mcq">Assessment</Link>
              </>
            )}
            
            {currentUser && !isMentor && (
              <>
                <Link className="text-white hover:text-primary transition-colors" to="/interests">Interests</Link>
                <Link className="text-white hover:text-primary transition-colors" to="/mcq">Assessment</Link>
                <Link className="text-white hover:text-primary transition-colors" to="/find-mentors">Find Mentors</Link>
              </>
            )}
            
            {currentUser && isMentor && (
              <>
                <Link className="text-white hover:text-primary transition-colors" to="/mentor-dashboard">Mentor Dashboard</Link>
                <Link className="text-white hover:text-primary transition-colors" to="/mentee-requests">Mentee Requests</Link>
              </>
            )}
            
            {currentUser ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-4">
                <Link className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors" to="/login">Login</Link>
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
                    to="/mcq"
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
                    to="/mcq"
                    onClick={() => setIsOpen(false)}
                  >
                    Assessment
                  </Link>
                  <Link 
                    className="text-white hover:text-primary transition-colors" 
                    to="/find-mentors"
                    onClick={() => setIsOpen(false)}
                  >
                    Find Mentors
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
                    className="text-white hover:text-primary transition-colors" 
                    to="/mentee-requests"
                    onClick={() => setIsOpen(false)}
                  >
                    Mentee Requests
                  </Link>
                </>
              )}
              
              {/* Authentication links */}
              {currentUser ? (
                <button 
                  className="text-white hover:text-primary transition-colors text-left" 
                  onClick={() => {
                    setIsOpen(false);
                    useAuth().logout();
                  }}
                >
                  Logout
                </button>
              ) : (
                <>
                  
                  <Link 
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors inline-block" 
                    to="/login"
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