import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

function MentorSignup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    qualification: '',
    experience: '',
    expertise: [],
    bio: '',
    photoUrl: '',
    price: '',
    availability: []
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const expertiseOptions = [
    'Computer Science',
    'Data Science',
    'Mathematics',
    'Engineering',
    'Physics',
    'Chemistry',
    'Biology',
    'Medicine',
    'Business',
    'Economics',
    'Psychology',
    'Education'
  ];

  const availabilityOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  // Test server connectivity on component mount
  useEffect(() => {
    const testServerConnection = async () => {
      try {
        const response = await fetch('http://localhost:3250/api/mentors');
        if (response.ok) {
          console.log('Server connection test: Success');
        } else {
          console.warn('Server connection test: Failed with status', response.status);
        }
      } catch (err) {
        console.error('Server connection test: Error', err);
      }
    };
    
    testServerConnection();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleExpertiseChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;
    
    setFormData(prevData => {
      if (isChecked) {
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

  const handleAvailabilityChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;
    
    setFormData(prevData => {
      if (isChecked) {
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

  // Function to handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Selected file must be an image');
      return;
    }

    setSelectedImage(file);
    
    // Create a preview URL
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  };

  // Function to upload the image to the server
  const uploadImage = async (file) => {
    if (!file) return null;
    
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('profileImage', file);
    
    try {
      console.log('Uploading image:', file.name, 'size:', file.size, 'type:', file.type);
      
      const response = await fetch('http://localhost:3250/api/upload/profile-image', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it automatically with boundary
      });
      
      console.log('Image upload response status:', response.status);
      
      // Check if the response is JSON or not
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server returned non-JSON response:', await response.text());
        throw new Error('Server returned an invalid response format');
      }
      
      const data = await response.json();
      console.log('Image upload response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }
      
      return data.imagePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + (error.message || 'Unknown error'));
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate essential fields
    if (formData.expertise.length === 0) {
      toast.error('Please select at least one area of expertise');
      return;
    }
    
    if (formData.availability.length === 0) {
      toast.error('Please select at least one day of availability');
      return;
    }
    
    // Validate price is a number
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 10) {
      toast.error('Please enter a valid price (minimum $10)');
      return;
    }
    
    setLoading(true);

    try {
      // First upload the image if one is selected
      let photoUrl = formData.photoUrl;
      
      if (selectedImage) {
        photoUrl = await uploadImage(selectedImage);
        if (!photoUrl) {
          toast.error('Failed to upload profile image. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      console.log('Submitting mentor registration form with image path:', photoUrl);

      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        isMentor: true,
        qualification: formData.qualification.trim(),
        experience: formData.experience.trim(),
        expertise: formData.expertise,
        bio: formData.bio.trim(),
        photoUrl: photoUrl,
        price: price,
        availability: formData.availability
      };
      
      const result = await register(registrationData);
      
      console.log('Registration successful:', result);
      toast.success('Registration successful!');
      navigate('/mentor-dashboard');
    } catch (err) {
      console.error('Mentor registration error:', err);
      
      // Provide more detailed error messages
      let errorMessage = 'Registration failed';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      // Network error
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkblue py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-darkblue-light p-8 rounded-xl shadow-lg border border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white">Become a Mentor</h2>
          <p className="mt-2 text-sm text-gray-300">
            Share your expertise and help students achieve their career goals
          </p>
        </div>
        
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-medium text-white border-b border-gray-700 pb-2">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-1">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="First Name"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-1">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Last Name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Profile Photo
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center overflow-hidden bg-gray-800">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <input
                      type="file"
                      id="photoUpload"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploadingImage}
                      className="px-3 py-2 bg-secondary-dark text-white text-sm rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50"
                    >
                      {uploadingImage ? 'Uploading...' : 'Choose Image'}
                    </button>
                    <p className="mt-1 text-xs text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewUrl('');
                          setFormData({
                            ...formData,
                            photoUrl: ''
                          });
                        }}
                        className="mt-2 text-xs text-red-400 hover:text-red-300"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Professional Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-medium text-white border-b border-gray-700 pb-2">Professional Information</h3>
              
              <div>
                <label htmlFor="qualification" className="block text-sm font-medium text-gray-200 mb-1">
                  Qualification *
                </label>
                <input
                  id="qualification"
                  name="qualification"
                  type="text"
                  required
                  value={formData.qualification}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="e.g., MSc in Computer Science, PhD in Mathematics"
                />
              </div>
              
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-200 mb-1">
                  Experience (years) *
                </label>
                <input
                  id="experience"
                  name="experience"
                  type="text"
                  required
                  value={formData.experience}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="e.g., 5 years in software development, 3 years teaching"
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-200 mb-1">
                  Session Fee (USD) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="10"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="40.00"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Set your price per 30-minute session (minimum $10)
                </p>
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-200 mb-1">
                  Professional Bio *
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="5"
                  required
                  value={formData.bio}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-darkblue border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Tell us about your professional background, teaching experience, and what you can offer to students"
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Areas of Expertise */}
          <div>
            <h3 className="text-xl font-medium text-white border-b border-gray-700 pb-2 mb-4">Areas of Expertise *</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {expertiseOptions.map(option => (
                <div key={option} className="flex items-center">
                  <input
                    id={`expertise-${option}`}
                    name="expertise"
                    type="checkbox"
                    value={option}
                    checked={formData.expertise.includes(option)}
                    onChange={handleExpertiseChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-darkblue"
                  />
                  <label htmlFor={`expertise-${option}`} className="ml-2 block text-sm text-gray-200">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Availability */}
          <div>
            <h3 className="text-xl font-medium text-white border-b border-gray-700 pb-2 mb-4">Availability *</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availabilityOptions.map(day => (
                <div key={day} className="flex items-center">
                  <input
                    id={`day-${day}`}
                    name="availability"
                    type="checkbox"
                    value={day}
                    checked={formData.availability.includes(day)}
                    onChange={handleAvailabilityChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-darkblue"
                  />
                  <label htmlFor={`day-${day}`} className="ml-2 block text-sm text-gray-200">
                    {day}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
            >
              {loading ? 'Registering...' : 'Register as Mentor'}
            </button>
            
            <p className="text-sm text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-light">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#333',
            color: '#fff'
          }
        }}
      />
    </div>
  );
}

export default MentorSignup; 