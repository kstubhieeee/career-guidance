import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaUser, FaQuestionCircle, FaPlus, FaCheck, FaRegClock, FaThumbsUp, FaRegComment } from 'react-icons/fa';

function QandA() {
  const { currentUser, isMentor } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittingAnswers, setSubmittingAnswers] = useState({});

  // Sample questions data
  const sampleQuestions = [
    {
      id: 1,
      title: "How can I prepare for placement interviews at tech companies?",
      body: "I'm in my final year of B.Tech Computer Science and want to start preparing for campus placements at tech companies. What should be my study plan and how can I improve my chances?",
      author: "Rahul Sharma",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      date: "2023-05-18T14:30:00",
      tags: ["placements", "interview-prep", "tech"],
      answers: 5,
      likes: 17,
      isAnswered: true,
      isFeatured: true
    },
    {
      id: 2,
      title: "What are the career options after B.Sc in Mathematics?",
      body: "I'm currently pursuing B.Sc in Mathematics and I'm confused about my career options after graduation. Should I go for M.Sc, MBA, or some other field? Please guide.",
      author: "Priya Patel",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      date: "2023-05-17T10:15:00",
      tags: ["mathematics", "career-guidance", "higher-education"],
      answers: 3,
      likes: 8,
      isAnswered: true,
      isFeatured: false
    },
    {
      id: 3,
      title: "How to balance studies and internship during college?",
      body: "I recently got a part-time internship opportunity, but I'm concerned about balancing it with my studies. Any tips on effective time management and prioritization?",
      author: "Arjun Singh",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      date: "2023-05-15T16:45:00",
      tags: ["internship", "time-management", "college"],
      answers: 4,
      likes: 12,
      isAnswered: true,
      isFeatured: false
    },
    {
      id: 4,
      title: "Is it worth doing MS abroad after engineering in India?",
      body: "I will be completing my engineering in Mechanical from NIT next year. I'm confused whether I should pursue MS abroad or go for a job in India. How beneficial is an MS degree in terms of career prospects and ROI?",
      author: "Karan Mehta",
      avatar: "https://randomuser.me/api/portraits/men/62.jpg",
      date: "2023-05-14T09:20:00",
      tags: ["ms-abroad", "higher-education", "engineering"],
      answers: 6,
      likes: 15,
      isAnswered: true,
      isFeatured: true
    },
    {
      id: 5,
      title: "How to transition from non-IT background to a career in Data Science?",
      body: "I'm from a Civil Engineering background with 2 years of work experience. I'm interested in switching to Data Science. What skills should I acquire and what learning path would you recommend?",
      author: "Anusha Reddy",
      avatar: "https://randomuser.me/api/portraits/women/67.jpg",
      date: "2023-05-12T13:10:00",
      tags: ["data-science", "career-switch", "upskilling"],
      answers: 4,
      likes: 9,
      isAnswered: false,
      isFeatured: false
    },
    {
      id: 6,
      title: "Should I go for CAT preparation or focus on improving technical skills?",
      body: "I'm in the third year of my B.Tech in ECE. I'm confused whether to prepare for CAT and pursue MBA or focus on improving my technical skills in core electronics or software development. What would be more rewarding in the long term?",
      author: "Vikram Malhotra",
      avatar: "https://randomuser.me/api/portraits/men/29.jpg",
      date: "2023-05-10T11:25:00",
      tags: ["cat", "mba", "career-choice", "engineering"],
      answers: 2,
      likes: 7,
      isAnswered: false,
      isFeatured: false
    }
  ];

  useEffect(() => {
    // Fetch questions from the API
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Try to fetch questions from the API
        const response = await fetch('http://localhost:3250/api/questions');
        
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions);
        } else {
          // Fallback to local data if API fails
          console.error('Failed to fetch questions from API. Using local data instead.');
          // Get user questions from localStorage
          const userQuestions = JSON.parse(localStorage.getItem('userQuestions') || '[]');
          
          // Combine sample questions with user questions
          const allQuestions = [...sampleQuestions, ...userQuestions];
          setQuestions(allQuestions);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        // Fallback to local data in case of error
        const userQuestions = JSON.parse(localStorage.getItem('userQuestions') || '[]');
        const allQuestions = [...sampleQuestions, ...userQuestions];
        setQuestions(allQuestions);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter questions based on active tab and search query
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      question.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const hasAnswers = question.answers && question.answers.length > 0;
    
    if (activeTab === 'recent') return matchesSearch;
    if (activeTab === 'popular') return matchesSearch;
    if (activeTab === 'unanswered') return !hasAnswers && matchesSearch;
    if (activeTab === 'featured') return question.isFeatured && matchesSearch;
    
    return matchesSearch;
  });

  // Sort questions based on active tab
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (activeTab === 'recent') {
      return new Date(b.date) - new Date(a.date);
    }
    if (activeTab === 'popular') {
      return b.likes - a.likes;
    }
    // Default sorting by date for other tabs
    return new Date(b.date) - new Date(a.date);
  });

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

  // Handle like/upvote
  const handleLike = (questionId) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        // Check if already liked (would use userId in real app)
        return { ...q, likes: q.likes + 1 };
      }
      return q;
    });
    
    setQuestions(updatedQuestions);
    
    // Update localStorage if it's a user question
    const userQuestions = JSON.parse(localStorage.getItem('userQuestions') || '[]');
    const updatedUserQuestions = userQuestions.map(q => {
      if (q.id === questionId) {
        return { ...q, likes: q.likes + 1 };
      }
      return q;
    });
    
    localStorage.setItem('userQuestions', JSON.stringify(updatedUserQuestions));
  };
  
  // Add comment functionality
  const [commentText, setCommentText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);
  
  const showCommentForm = (questionId) => {
    setActiveCommentId(questionId);
    setCommentText('');
  };
  
  const handleCommentSubmit = (questionId) => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now(),
      author: {
        id: currentUser?._id || 'anonymous',
        name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Anonymous User',
        avatar: currentUser?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
        isMentor: currentUser?.isMentor || false
      },
      content: commentText,
      createdAt: new Date().toISOString()
    };
    
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        const updatedComments = [...(q.comments || []), newComment];
        return { ...q, comments: updatedComments };
      }
      return q;
    });
    
    setQuestions(updatedQuestions);
    setCommentText('');
    setActiveCommentId(null);
    
    // Update localStorage if it's a user question
    const userQuestions = JSON.parse(localStorage.getItem('userQuestions') || '[]');
    const updatedUserQuestions = userQuestions.map(q => {
      if (q.id === questionId) {
        const updatedComments = [...(q.comments || []), newComment];
        return { ...q, comments: updatedComments };
      }
      return q;
    });
    
    localStorage.setItem('userQuestions', JSON.stringify(updatedUserQuestions));
  };

  // Handle submit answer
  const handleSubmitAnswer = async (questionId) => {
    const questionToAnswer = questions.find(q => q.id === questionId);
    
    if (!questionToAnswer || !questionToAnswer.answerDraft?.trim()) {
      alert('Please write an answer before submitting');
      return;
    }
    
    try {
      // Set the question as submitting
      setSubmittingAnswers(prev => ({ ...prev, [questionId]: true }));
      
      // Create new answer object
      const newAnswer = {
        id: Date.now(),
        author: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Anonymous Mentor',
        text: questionToAnswer.answerDraft,
        date: new Date().toISOString(),
        isMentor: true
      };
      
      // Try to submit to API first
      try {
        const response = await fetch(`/api/questions/${questionId}/answers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answer: newAnswer }),
        });
        
        if (response.ok) {
          console.log('Answer submitted to API successfully');
          // API was successful, reload questions from API
          const questionsResponse = await fetch('/api/questions');
          if (questionsResponse.ok) {
            const data = await questionsResponse.json();
            setQuestions(data.questions);
            return;
          }
        }
        // If API fails, fall back to localStorage
      } catch (error) {
        console.error('Error submitting to API:', error);
        // Continue to localStorage update
      }
      
      // Update questions in state
      const updatedQuestions = questions.map(q => {
        if (q.id === questionId) {
          // Create or update the answers array
          const answers = q.answers || [];
          return { 
            ...q, 
            answers: [...answers, newAnswer],
            isAnswered: true,
            answerDraft: '' // Clear draft after submission
          };
        }
        return q;
      });
      
      setQuestions(updatedQuestions);
      
      // Update localStorage
      const userQuestions = JSON.parse(localStorage.getItem('userQuestions') || '[]');
      const updatedUserQuestions = userQuestions.map(q => {
        if (q.id === questionId) {
          const answers = q.answers || [];
          return { 
            ...q, 
            answers: [...answers, newAnswer],
            isAnswered: true 
          };
        }
        return q;
      });
      
      localStorage.setItem('userQuestions', JSON.stringify(updatedUserQuestions));
      
      // Show success message
      alert('Your answer has been submitted successfully!');
    } catch (error) {
      console.error('Error saving answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      // Remove the question from submitting state
      setSubmittingAnswers(prev => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-4xl font-bold text-white">Q&A with Mentors</h1>
          <p className="text-teal-100 mt-2 max-w-3xl">
            Ask questions about careers, education, and skills. Get answers from experienced mentors and industry professionals.
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full px-5 py-4 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="md:w-3/4">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex overflow-x-auto">
                <button
                  className={`px-4 py-2 font-medium text-sm rounded-lg mr-2 whitespace-nowrap ${
                    activeTab === 'recent'
                      ? 'bg-teal-100 text-teal-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('recent')}
                >
                  Recent Questions
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm rounded-lg mr-2 whitespace-nowrap ${
                    activeTab === 'popular'
                      ? 'bg-teal-100 text-teal-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('popular')}
                >
                  Popular
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm rounded-lg mr-2 whitespace-nowrap ${
                    activeTab === 'unanswered'
                      ? 'bg-teal-100 text-teal-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('unanswered')}
                >
                  Unanswered
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm rounded-lg mr-2 whitespace-nowrap ${
                    activeTab === 'featured'
                      ? 'bg-teal-100 text-teal-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('featured')}
                >
                  Featured
                </button>
              </div>
              
              <Link
                to={currentUser?.isMentor ? "/qanda" : "/ask-question"}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center"
              >
                <FaPlus className="mr-2" /> {currentUser?.isMentor ? "Answer Questions" : "Ask Question"}
              </Link>
            </div>
            
            {/* Questions List */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedQuestions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <FaQuestionCircle className="text-gray-300 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? `No results match your search "${searchQuery}"`
                    : 'There are no questions in this category yet'}
                </p>
                <Link
                  to={currentUser?.isMentor ? "/qanda" : "/ask-question"}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <FaPlus className="mr-2" /> {currentUser?.isMentor ? "Answer Questions" : "Ask a Question"}
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedQuestions.map(question => (
                  <div key={question.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start">
                      <img src={question.avatar} alt={question.author} className="w-10 h-10 rounded-full mr-4" />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          <Link to={`/question/${question.id}`} className="hover:text-teal-600 transition-colors">
                            {question.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{question.body}</p>
                        
                        {/* User info */}
                        <div className="mb-4 text-sm">
                          <p className="text-gray-800 font-medium">
                            Asked by: {question.author} {question.email && <span className="text-gray-500">({question.email})</span>}
                          </p>
                          <p className="text-gray-500">
                            {formatRelativeTime(question.date)}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {question.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-500 space-x-4">
                            <button 
                              onClick={() => handleLike(question.id)}
                              className="flex items-center hover:text-teal-600 transition-colors"
                            >
                              <FaThumbsUp className="mr-1" />
                              <span>{question.likes}</span>
                            </button>
                            <button 
                              onClick={() => showCommentForm(question.id)}
                              className="flex items-center hover:text-teal-600 transition-colors"
                            >
                              <FaRegComment className="mr-1" />
                              <span>{question.comments?.length || 0}</span>
                            </button>
                          </div>
                          
                          <div className="flex items-center">
                            {question.answers && question.answers.length > 0 ? (
                              <span className="flex items-center text-green-600 text-sm">
                                <FaCheck className="mr-1" />
                                Answered
                              </span>
                            ) : (
                              <span className="flex items-center text-orange-500 text-sm">
                                <FaRegClock className="mr-1" />
                                Awaiting answer
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Display answers */}
                        {question.answers && question.answers.length > 0 && (
                          <div className="mt-4 border-t pt-4">
                            <h4 className="text-gray-800 font-medium mb-3">
                              {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
                            </h4>
                            <div className="space-y-4">
                              {question.answers.map((answer) => (
                                <div key={answer.id} className="flex space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                    <FaUser size={12} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center mb-1">
                                      <span className="font-medium text-gray-800">{answer.author}</span>
                                      {answer.isMentor && (
                                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                          Mentor
                                        </span>
                                      )}
                                      <span className="ml-auto text-xs text-gray-500">
                                        {formatRelativeTime(answer.date)}
                                      </span>
                                    </div>
                                    <p className="text-gray-600">{answer.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Mentor Answer Form - Inline */}
                        {currentUser?.isMentor && !(question.answers && question.answers.length > 0) && (
                          <div className="mt-4 border-t pt-4">
                            <h4 className="text-gray-800 font-medium mb-2">Answer as Mentor</h4>
                            <div className="mb-3">
                              <textarea
                                placeholder="Write your answer here..."
                                rows="3"
                                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                value={question.answerDraft || ''}
                                onChange={(e) => {
                                  const updatedQuestions = questions.map(q => {
                                    if (q.id === question.id) {
                                      return { ...q, answerDraft: e.target.value };
                                    }
                                    return q;
                                  });
                                  setQuestions(updatedQuestions);
                                }}
                              ></textarea>
                            </div>
                            <button 
                              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed flex items-center"
                              onClick={() => handleSubmitAnswer(question.id)}
                              disabled={submittingAnswers[question.id]}
                            >
                              {submittingAnswers[question.id] ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Submitting...
                                </>
                              ) : 'Submit Answer'}
                            </button>
                          </div>
                        )}
                        
                        {/* Comment form */}
                        {activeCommentId === question.id && (
                          <div className="mt-4 border-t pt-4">
                            <h4 className="text-gray-800 font-medium mb-2">Add a comment</h4>
                            <div className="flex">
                              <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                rows="2"
                                placeholder="Write your comment..."
                              ></textarea>
                              <button
                                onClick={() => handleCommentSubmit(question.id)}
                                className="bg-teal-600 text-white px-4 rounded-r-lg hover:bg-teal-700"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Display comments */}
                        {question.comments && question.comments.length > 0 && (
                          <div className="mt-4 border-t pt-4 space-y-3">
                            <h4 className="text-gray-800 font-medium">Comments ({question.comments.length})</h4>
                            {question.comments.map(comment => (
                              <div key={comment.id} className="flex space-x-3">
                                <img 
                                  src={comment.author.avatar} 
                                  alt={comment.author.name} 
                                  className="w-8 h-8 rounded-full" 
                                />
                                <div>
                                  <div className="flex items-center">
                                    <p className="font-medium text-gray-800">
                                      {comment.author.name}
                                      {comment.author.isMentor && (
                                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                          Mentor
                                        </span>
                                      )}
                                    </p>
                                    <span className="ml-2 text-xs text-gray-500">
                                      {formatRelativeTime(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-gray-600">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{currentUser?.isMentor ? "Answer Questions" : "Ask a Question"}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {currentUser?.isMentor 
                  ? "Share your knowledge and experience to answer student questions." 
                  : "Have a question about education, career, or skills? Our mentors are here to help."}
              </p>
              <Link
                to={currentUser?.isMentor ? "/qanda" : "/ask-question"}
                className="block w-full text-center bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
              >
                {currentUser?.isMentor ? "Answer Questions" : "Ask a Question"}
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                <Link 
                  to="/questions/tag/career-guidance"
                  className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full hover:bg-gray-200"
                >
                  career-guidance
                </Link>
                <Link 
                  to="/questions/tag/interview-prep"
                  className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full hover:bg-gray-200"
                >
                  interview-prep
                </Link>
                <Link 
                  to="/questions/tag/higher-education"
                  className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full hover:bg-gray-200"
                >
                  higher-education
                </Link>
                <Link 
                  to="/questions/tag/engineering"
                  className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full hover:bg-gray-200"
                >
                  engineering
                </Link>
                <Link 
                  to="/questions/tag/tech"
                  className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full hover:bg-gray-200"
                >
                  tech
                </Link>
                <Link 
                  to="/questions/tag/placements"
                  className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full hover:bg-gray-200"
                >
                  placements
                </Link>
                <Link 
                  to="/questions/tag/career-switch"
                  className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full hover:bg-gray-200"
                >
                  career-switch
                </Link>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Become a Mentor</h3>
              <p className="text-sm text-gray-700 mb-4">
                Are you an industry professional or experienced educator? Share your knowledge by becoming a mentor.
              </p>
              <Link 
                to="/become-mentor" 
                className="block w-full text-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Join as Mentor
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Q&A Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions</span>
                  <span className="font-medium text-gray-900">2,356</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Answers</span>
                  <span className="font-medium text-gray-900">8,749</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mentors</span>
                  <span className="font-medium text-gray-900">154</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Response Time</span>
                  <span className="font-medium text-gray-900">4.2 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default QandA; 