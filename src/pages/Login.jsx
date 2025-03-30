import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isMentor, setIsMentor] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    experience: '',
    specialization: '',
    qualification: '',
    expertise: [],
    bio: '',
    price: '',
    availability: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle expertise checkboxes
  const handleExpertiseChange = (e) => {
    const { value, checked } = e.target;
    
    setFormData(prevData => {
      if (checked) {
        return {
          ...prevData,
          expertise: [...prevData.expertise, value]
        };
      } else {
        return {
          ...prevData,
          expertise: prevData.expertise.filter(item => item !== value)
        };
      }
    });
  };

  // Handle availability checkboxes
  const handleAvailabilityChange = (e) => {
    const { value, checked } = e.target;
    
    setFormData(prevData => {
      if (checked) {
        return {
          ...prevData,
          availability: [...prevData.availability, value]
        };
      } else {
        return {
          ...prevData,
          availability: prevData.availability.filter(day => day !== value)
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
          isMentor
        });
      } else {
        await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          isMentor,
          ...(isMentor && {
            experience: formData.experience,
            specialization: formData.specialization,
            qualification: formData.qualification,
            expertise: formData.expertise,
            bio: formData.bio,
            price: formData.price,
            availability: formData.availability
          })
        });
      }
      navigate(isMentor ? '/mentor-dashboard' : from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const toggleUserType = () => {
    setIsMentor(!isMentor);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkblue py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-darkblue-light p-10 rounded-xl shadow-lg border border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white mb-2">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="text-sm text-gray-300">
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Fill in your information to get started'
            }
          </p>
          
          <div className="mt-4 flex justify-center">
            <div className="bg-darkblue rounded-lg p-1 inline-flex">
              <button
                onClick={() => setIsMentor(false)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  !isMentor 
                    ? 'bg-primary text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setIsMentor(true)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  isMentor 
                    ? 'bg-primary text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Mentor
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-3 rounded-md">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="First Name"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Last Name"
                />
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
          
          {/* Mentor-specific fields */}
          {!isLogin && isMentor && (
            <div className="space-y-4">
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-200 mb-1">
                  Specialization
                </label>
                <select
                  id="specialization"
                  name="specialization"
                  required
                  value={formData.specialization}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                >
                  <option value="">Select your specialization</option>
                  <option value="Science">Science</option>
                  <option value="Technology">Technology</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Mathematics">Mathematics</option>
                  
                </select>
              </div>
              
              <div>
                <label htmlFor="qualification" className="block text-sm font-medium text-gray-200 mb-1">
                  Qualification
                </label>
                <input
                  id="qualification"
                  name="qualification"
                  type="text"
                  required
                  value={formData.qualification}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Your highest qualification or certification"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Areas of Expertise
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Computer Science', 'Data Science', 'Mathematics', 'Engineering', 
                    'Physics', 'Chemistry', 'Biology', 'Education'].map(area => (
                    <div key={area} className="flex items-center">
                      <input
                        id={`expertise-${area}`}
                        name="expertise"
                        type="checkbox"
                        value={area}
                        onChange={handleExpertiseChange}
                        checked={formData.expertise.includes(area)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-darkblue"
                      />
                      <label htmlFor={`expertise-${area}`} className="ml-2 block text-sm text-gray-200">
                        {area}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.expertise.length === 0 && (
                  <p className="text-red-400 text-xs mt-1">Please select at least one area of expertise</p>
                )}
              </div>
              
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-200 mb-1">
                  Years of Experience
                </label>
                <input
                  id="experience"
                  name="experience"
                  type="number"
                  min="0"
                  required
                  value={formData.experience}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Years of experience"
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-200 mb-1">
                  Session Price (₹)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="10"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Price per session (min ₹10)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Availability
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <div key={day} className="flex items-center">
                      <input
                        id={`availability-${day}`}
                        name="availability"
                        type="checkbox"
                        value={day}
                        onChange={handleAvailabilityChange}
                        checked={formData.availability.includes(day)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-darkblue"
                      />
                      <label htmlFor={`availability-${day}`} className="ml-2 block text-sm text-gray-200">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.availability.length === 0 && (
                  <p className="text-red-400 text-xs mt-1">Please select at least one day you're available</p>
                )}
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-200 mb-1">
                  Professional Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  required
                  value={formData.bio}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Tell us about your professional background and expertise"
                ></textarea>
              </div>
            </div>
          )}
          
          {isLogin && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-darkblue"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-200">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-light">
                  Forgot your password?
                </a>
              </div>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-primary-dark group-hover:text-primary-light" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {isLogin ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-300">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={toggleForm}
              className="font-medium text-primary hover:text-primary-light"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;