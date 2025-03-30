import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext.jsx';

function Mcq() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const {
    loading,
    questions,
    currentQuestion,
    setCurrentQuestion,
    scores,
    answeredQuestions,
    showResults,
    error,
    handleOptionSelect,
    resetAssessment,
    getProgress,
    finishAssessment
  } = useAssessment();

  // Use useEffect for navigation to avoid React Router warning
  useEffect(() => {
    if (showResults) {
      navigate('/analysis');
    }
  }, [showResults, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-darkblue py-12 flex justify-center items-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl">Loading AI-powered assessment questions...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-darkblue py-12 flex justify-center items-center">
        <div className="text-white text-center">
          <div className="bg-red-500 bg-opacity-20 border border-red-500 p-4 rounded-lg mb-4">
            <p className="text-xl">{error}</p>
          </div>
          <Link
            to="/assessment"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors mt-4 inline-block"
          >
            Back to Assessment
          </Link>
        </div>
      </div>
    );
  }

  // Return null if showResults is true since we're navigating away
  if (showResults) {
    return null;
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Science': return 'rgba(255, 99, 132, 0.8)';
      case 'Technology': return 'rgba(54, 162, 235, 0.8)';
      case 'Engineering': return 'rgba(255, 206, 86, 0.8)';
      case 'Mathematics': return 'rgba(75, 192, 192, 0.8)';
      default: return 'rgba(153, 102, 255, 0.8)';
    }
  };

  const getOptionClassName = (qIndex, oIndex) => {
    // Current question styles
    if (qIndex === currentQuestion) {
      if (answeredQuestions[qIndex]) {
        // After answering
        const isSelectedCategory = questions[qIndex].categories[oIndex];
        if (isSelectedCategory) {
          return "bg-primary text-white border border-primary-dark";
        }
        return "bg-darkblue-light border border-gray-700 opacity-70";
      }

      // Before answering - hover state
      return "bg-darkblue-light border border-gray-700 hover:bg-darkblue-dark transform hover:-translate-y-1 hover:shadow-lg";
    }

    // Other questions
    return "bg-darkblue-light border border-gray-700";
  };

  const handlePrevClick = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNextClick = () => {
    if (currentQuestion < questions.length - 1 && answeredQuestions[currentQuestion]) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleCompleteAssessment = () => {
    finishAssessment();
  };

  const isAssessmentComplete = answeredQuestions.every(Boolean) && answeredQuestions.length > 0;

  return (
    <div className="min-h-screen bg-darkblue py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-darkblue-light rounded-xl shadow-md overflow-hidden border border-gray-700">
          <div className="flex justify-between items-center p-6 bg-darkblue border-b border-gray-700">
            <div className="text-2xl font-bold text-white">Career Assessment</div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-300">Progress:</div>
              <div className="w-32 bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-300">{Math.round(getProgress())}%</div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-300">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-white mb-6">
                {questions[currentQuestion]?.question}
              </h2>

              <div className="space-y-4">
                {questions[currentQuestion]?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(currentQuestion, index)}
                    disabled={answeredQuestions[currentQuestion]}
                    className={`w-full text-left p-5 rounded-lg transition-all duration-300 text-white ${getOptionClassName(currentQuestion, index)}`}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-darkblue-dark text-white">
                        {option.charAt(0)}
                      </div>
                      <span className="text-lg">{option.substring(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handlePrevClick}
                disabled={currentQuestion === 0}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${currentQuestion === 0
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
              >
                <i className="fas fa-arrow-left mr-2"></i> Previous
              </button>

              <div className="hidden md:flex space-x-2">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full ${idx === currentQuestion
                      ? 'bg-primary'
                      : answeredQuestions[idx]
                        ? 'bg-gray-400'
                        : 'bg-gray-700'
                      }`}
                  ></div>
                ))}
              </div>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleCompleteAssessment}
                  disabled={!isAssessmentComplete}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${!isAssessmentComplete
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                >
                  Complete Assessment
                </button>
              ) : (
                <button
                  onClick={handleNextClick}
                  disabled={currentQuestion === questions.length - 1 || !answeredQuestions[currentQuestion]}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${currentQuestion === questions.length - 1 || !answeredQuestions[currentQuestion]
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                >
                  Next <i className="fas fa-arrow-right ml-2"></i>
                </button>
              )}
            </div>

            {/* STEM field legend */}
            <div className="mt-8 p-4 bg-darkblue rounded-lg border border-gray-700">
              <h3 className="text-white font-medium mb-2">Answer Key:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: getCategoryColor('Science') }}></div>
                  <span className="text-gray-300 text-sm">Science</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: getCategoryColor('Technology') }}></div>
                  <span className="text-gray-300 text-sm">Technology</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: getCategoryColor('Engineering') }}></div>
                  <span className="text-gray-300 text-sm">Engineering</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: getCategoryColor('Mathematics') }}></div>
                  <span className="text-gray-300 text-sm">Mathematics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mcq;