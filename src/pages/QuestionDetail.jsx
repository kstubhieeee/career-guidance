import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaThumbsUp, FaRegComment, FaCheck, FaUser, FaCalendarAlt } from 'react-icons/fa';

// Sample questions data (this would come from your database in a real app)
const sampleQuestions = [
  {
    id: 1,
    title: "How can I prepare for placement interviews at tech companies?",
    body: "I'm in my final year of B.Tech Computer Science and want to start preparing for campus placements at tech companies. What should be my study plan and how can I improve my chances?",
    author: "Rahul Sharma",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    email: "rahul.sharma@example.com",
    date: "2023-05-18T14:30:00",
    tags: ["placements", "interview-prep", "tech"],
    answers: [],
    likes: 17,
    isAnswered: false
  },
  // Other sample questions would be here
];

function QuestionDetail() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isMentor } = useAuth();
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Log the questionId when the component mounts
  console.log('QuestionDetail mounted with questionId:', questionId, 'type:', typeof questionId);
  
  // Helper function to log and compare IDs for matching
  const idsMatch = (id1, id2) => {
    console.log(`Comparing IDs: ${id1} (${typeof id1}) with ${id2} (${typeof id2})`);
    
    // First try string comparison
    if (String(id1) === String(id2)) {
      console.log('IDs match as strings');
      return true;
    }
    
    // Try numeric comparison if both can be converted to numbers
    const num1 = Number(id1);
    const num2 = Number(id2);
    if (!isNaN(num1) && !isNaN(num2) && num1 === num2) {
      console.log('IDs match as numbers');
      return true;
    }
    
    // Additional check for MongoDB ObjectId form
    if (typeof id1 === 'string' && typeof id2 === 'string') {
      // For ObjectId strings, they may be in different formats but represent the same ID
      const trimmedId1 = id1.replace(/^"|"$/g, '');
      const trimmedId2 = id2.replace(/^"|"$/g, '');
      
      if (trimmedId1 === trimmedId2) {
        console.log('IDs match after string processing');
        return true;
      }
    }
    
    console.log('IDs do not match');
    return false;
  };
  
  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Attempting to load question with ID: ${questionId} (${typeof questionId})`);
        console.log(`Current route: ${window.location.pathname}`);
        
        // First try to fetch from API
        try {
          console.log('Attempting to fetch from API...');
          const response = await fetch(`/api/questions/${questionId}`);
          console.log('API Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('API fetch successful:', data);
            setQuestion(data.question);
            setLoading(false);
            return;
          } else {
            const errorText = await response.text();
            console.log('API fetch failed with status:', response.status, errorText);
            // Continue to localStorage if API fails
          }
        } catch (apiError) {
          console.error('API fetch error:', apiError);
          // Continue to localStorage if API throws an error
        }
        
        // If API fails, try localStorage
        console.log('Falling back to localStorage...');
        const userQuestions = JSON.parse(localStorage.getItem('userQuestions')) || [];
        
        // Log all available questions for debugging
        console.log('Available questions in localStorage:', 
          userQuestions.map(q => `ID: ${q.id} (${typeof q.id})`).join(', '));
        
        // Sample questions from data
        const sampleQuestions = [
          {
            id: 1,
            title: "How do I prepare for a product manager interview?",
            body: "I have an interview for a product manager role at a tech company next week. What are some key things I should prepare for?",
            author: "Jane Smith",
            date: "2023-06-15T10:30:00",
            tags: ["interview", "product management", "career"],
            likes: 15,
            answers: [
              {
                id: 101,
                author: "John Doe",
                text: "Focus on product case studies, metrics, and behavioral questions. Be ready to talk about products you admire and why.",
                date: "2023-06-16T14:20:00",
                isMentor: true
              }
            ]
          },
          // ... other sample questions
        ];
        
        console.log('Sample questions available:', 
          sampleQuestions.map(q => `ID: ${q.id} (${typeof q.id})`).join(', '));
        
        // Combine sample questions with user questions
        const allQuestions = [...sampleQuestions, ...userQuestions];
        console.log('All questions array length:', allQuestions.length);
        
        // Find the question with the matching ID
        const foundQuestion = allQuestions.find(q => idsMatch(q.id, questionId));
        
        if (foundQuestion) {
          console.log('Question found in localStorage:', foundQuestion);
          setQuestion(foundQuestion);
        } else {
          console.error(`Question not found with ID: ${questionId}`);
          setError(`Question with ID ${questionId} not found`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading question:', error);
        setError('Failed to load question. Please try again later.');
        setLoading(false);
      }
    };

    loadQuestion();
  }, [questionId]);
  
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to answer this question');
      return;
    }
    
    if (!currentUser.isMentor) {
      setError('Only mentors can answer questions');
      return;
    }
    
    if (!answerText.trim()) {
      setError('Answer cannot be empty');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const newAnswer = {
        id: Date.now(),
        author: currentUser.displayName || currentUser.email,
        text: answerText,
        date: new Date().toISOString(),
        isMentor: true
      };
      
      // Try to submit to API first
      try {
        console.log('Attempting to submit answer to API...');
        const response = await fetch(`/api/questions/${questionId}/answers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answer: newAnswer }),
        });
        
        if (response.ok) {
          console.log('Answer submitted to API successfully');
          setSuccessMessage('Your answer has been submitted!');
          setAnswerText('');
          setSubmitting(false);
          
          // Get updated question from API
          const updatedResponse = await fetch(`/api/questions/${questionId}`);
          if (updatedResponse.ok) {
            const data = await updatedResponse.json();
            setQuestion(data.question);
          }
          
          return;
        } else {
          console.log('API submission failed, falling back to localStorage');
          // Continue to localStorage if API fails
        }
      } catch (apiError) {
        console.error('API submission error:', apiError);
        // Continue to localStorage if API throws an error
      }
      
      // If API fails, update localStorage
      console.log('Updating question in localStorage');
      const userQuestions = JSON.parse(localStorage.getItem('userQuestions')) || [];
      const sampleQuestions = [
        // ... same sample questions as above
      ];
      
      const allQuestions = [...sampleQuestions, ...userQuestions];
      const questionIndex = allQuestions.findIndex(q => idsMatch(q.id, questionId));
      
      if (questionIndex === -1) {
        throw new Error('Question not found');
      }
      
      const updatedQuestion = {
        ...allQuestions[questionIndex],
        answers: [...(allQuestions[questionIndex].answers || []), newAnswer]
      };
      
      // If it's a user question (not a sample one), update localStorage
      if (questionIndex >= sampleQuestions.length) {
        const updatedUserQuestions = [...userQuestions];
        updatedUserQuestions[questionIndex - sampleQuestions.length] = updatedQuestion;
        localStorage.setItem('userQuestions', JSON.stringify(updatedUserQuestions));
      }
      
      setQuestion(updatedQuestion);
      setSuccessMessage('Your answer has been submitted!');
      setAnswerText('');
      
      // After a delay, navigate back to the Q&A page
      setTimeout(() => {
        navigate('/qanda');
      }, 2000);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Format date to relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-xl shadow-md p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            <p className="ml-4 text-gray-600">Loading question...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Question Not Found</h2>
            <p className="text-gray-600 mb-6">The question you are looking for does not exist or has been removed.</p>
            <Link 
              to="/qanda" 
              className="inline-flex items-center px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <FaArrowLeft className="mr-2" /> Back to Q&A
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl md:text-4xl font-bold text-white">{question.title}</h1>
          <div className="flex flex-wrap items-center mt-4 text-teal-100 gap-4">
            <div className="flex items-center">
              <FaUser className="mr-2" />
              {question.author} {question.email && <span>({question.email})</span>}
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2" />
              {formatRelativeTime(question.date)}
            </div>
          </div>
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
        
        {/* Question Details */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="p-6 md:p-8">
            <div className="flex items-start">
              {question.avatar ? (
                <img src={question.avatar} alt={question.author} className="w-12 h-12 rounded-full mr-4" />
              ) : (
                <div className="w-12 h-12 rounded-full mr-4 bg-blue-100 flex items-center justify-center text-blue-500">
                  <FaUser />
                </div>
              )}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="prose max-w-none text-gray-800">
                  <p>{question.body}</p>
                </div>
                
                <div className="flex items-center mt-6 text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <FaThumbsUp className="mr-1" />
                    <span>{question.likes} likes</span>
                  </div>
                  <div className="flex items-center">
                    <FaRegComment className="mr-1" />
                    <span>{question.answers?.length || 0} answers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Answers Section */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {question.answers?.length || 0} Answers
            </h2>
            
            {question.answers && question.answers.length > 0 ? (
              <div className="space-y-8">
                {question.answers.map((answer) => (
                  <div key={answer.id} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full mr-4 bg-blue-100 flex items-center justify-center text-blue-500">
                        <FaUser />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-gray-800">{answer.author}</span>
                          {answer.isMentor && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Mentor
                            </span>
                          )}
                          <span className="ml-auto text-sm text-gray-500">
                            {formatRelativeTime(answer.date)}
                          </span>
                        </div>
                        
                        <div className="prose max-w-none text-gray-800">
                          <p>{answer.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No answers yet. Be the first to answer this question!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Answer form for mentors */}
        {currentUser?.isMentor && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Your Answer</h3>
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmitAnswer}>
              <div className="mb-4">
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <textarea
                  id="answer"
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Write your answer here..."
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Answer'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

export default QuestionDetail; 