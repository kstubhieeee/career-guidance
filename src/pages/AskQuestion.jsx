import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';

function AskQuestion() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Redirect mentors to the QandA page
  useEffect(() => {
    if (currentUser?.isMentor) {
      navigate('/qanda');
    }
  }, [currentUser, navigate]);
  
  // If user is a mentor, don't render the form
  if (currentUser?.isMentor) {
    return null; // Will be redirected in the useEffect
  }
  
  // Form states
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  
  // Error and submission states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle tag input
  const handleAddTag = (e) => {
    e.preventDefault();
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = "Question title is required";
    if (!body.trim()) newErrors.body = "Question details are required";
    if (tags.length === 0) newErrors.tags = "At least one tag is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create question object with user information
      const questionData = {
        title,
        body,
        author: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Anonymous User',
        email: currentUser?.email || 'anonymous@example.com',
        avatar: currentUser?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
        tags
      };
      
      console.log("Current user info:", currentUser);
      console.log("Question author info:", { 
        name: questionData.author, 
        email: questionData.email, 
        avatar: questionData.avatar 
      });
      
      try {
        // Try to send to the API first
        const response = await fetch('http://localhost:3250/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(questionData),
          credentials: 'include'
        });
        
        if (response.ok) {
          // Successfully saved to database
          console.log('Question saved to database successfully');
          setSuccessMessage('Your question has been submitted successfully to the database.');
        } else {
          // If API submission fails, store in localStorage as fallback
          console.error('Failed to save question to database. Falling back to localStorage.');
          const newQuestion = {
            ...questionData,
            id: Date.now(), // Generate a unique ID for localStorage
            date: new Date().toISOString(),
            answers: 0,
            likes: 0,
            isAnswered: false,
            isFeatured: false,
            comments: []
          };
          
          const existingQuestions = JSON.parse(localStorage.getItem('userQuestions') || '[]');
          localStorage.setItem('userQuestions', JSON.stringify([...existingQuestions, newQuestion]));
          
          setSuccessMessage('Your question has been saved locally and will be synced when connection is restored.');
        }
      } catch (error) {
        // If API request fails, store in localStorage
        console.error('Error saving question to database:', error);
        const newQuestion = {
          id: Date.now(), // Generate a unique ID for localStorage
          title,
          body,
          author: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Anonymous User',
          email: currentUser?.email || 'anonymous@example.com',
          avatar: currentUser?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
          date: new Date().toISOString(),
          tags,
          answers: 0,
          likes: 0,
          isAnswered: false,
          isFeatured: false,
          comments: []
        };
        
        const existingQuestions = JSON.parse(localStorage.getItem('userQuestions') || '[]');
        localStorage.setItem('userQuestions', JSON.stringify([...existingQuestions, newQuestion]));
        
        setSuccessMessage('Your question has been saved locally and will be synced when connection is restored.');
      }
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/qanda');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting question:', error);
      setErrors({ submit: 'Failed to submit question. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <Link 
            to="/qanda" 
            className="inline-flex items-center text-white mb-6 hover:text-teal-200 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Q&A
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Ask a Question</h1>
          <p className="text-teal-100 mt-2">Get answers from mentors and the career guidance community</p>
        </div>
      </div>
      
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 p-4 bg-green-100 text-green-800 rounded-lg">
            <p className="font-medium">{successMessage}</p>
            <p className="text-sm mt-1">You will be redirected to the Q&A page shortly.</p>
          </div>
        )}
        
        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-10 text-gray-800">
          {/* Tips */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Tips for a good question:</h3>
            <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
              <li>Make sure your question is clear and specific</li>
              <li>Include relevant details about your situation</li>
              <li>Check if your question has already been asked</li>
              <li>Use appropriate tags to categorize your question</li>
            </ul>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Question Title*
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="e.g., How do I prepare for a software engineering interview?"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>
            
            {/* Body */}
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                Question Details*
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows="8"
                className={`w-full px-4 py-2 border ${errors.body ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="Provide more context about your question. Include relevant details that might help others provide better answers."
              ></textarea>
              {errors.body && <p className="mt-1 text-sm text-red-500">{errors.body}</p>}
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags* (e.g., career-advice, job-search, interviews)
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Add tags relevant to your question"
                  onKeyPress={(e) => e.key === 'Enter' ? handleAddTag(e) : null}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700"
                >
                  Add
                </button>
              </div>
              
              {/* Display added tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <div key={tag} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full flex items-center">
                    <span className="mr-1">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-teal-800 hover:text-teal-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {errors.tags && <p className="mt-1 text-sm text-red-500">{errors.tags}</p>}
            </div>
            
            {/* User Info Notice */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Your name and email will be displayed with your question to help others provide personalized answers.
              </p>
              <div className="flex items-center mt-2">
                <img 
                  src={currentUser?.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"} 
                  alt="Your Avatar" 
                  className="w-10 h-10 rounded-full"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">
                    {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Anonymous User"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentUser?.email || "anonymous@example.com"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div>
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
                  {errors.submit}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-6 py-3 rounded-lg text-white font-medium ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Post Your Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default AskQuestion; 