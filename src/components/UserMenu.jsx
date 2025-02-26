import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function UserMenu() {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentUser) {
    return null;
  }

  const initials = `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
          {initials}
        </div>
        <span className="hidden md:block text-white">{currentUser.firstName}</span>
        <svg
          className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-darkblue-light rounded-md shadow-lg py-1 z-10 border border-gray-700">
          <div className="px-4 py-2 border-b border-gray-700">
            <p className="text-sm text-white font-medium">{`${currentUser.firstName} ${currentUser.lastName}`}</p>
            <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
          </div>
          
          <Link
            to="/dashboard"
            className="block px-4 py-2 text-sm text-white hover:bg-darkblue-dark"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-user-circle mr-2"></i> Dashboard
          </Link>
          
          <Link
            to="/mcq"
            className="block px-4 py-2 text-sm text-white hover:bg-darkblue-dark"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-clipboard-check mr-2"></i> Take Assessment
          </Link>
          
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-darkblue-dark"
          >
            <i className="fas fa-sign-out-alt mr-2"></i> Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;