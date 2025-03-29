import React from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext.jsx';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function Mcq() {
  const { currentUser } = useAuth();
  const { 
    loading, 
    questions, 
    currentQuestion, 
    setCurrentQuestion, 
    scores,
    answeredQuestions,
    showResults,
    aiAnalysis,
    error,
    isGeneratingAnalysis,
    handleOptionSelect,
    resetAssessment,
    getProgress
  } = useAssessment();

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

  // Prepare chart data
  const chartData = {
    labels: ['Science', 'Technology', 'Engineering', 'Mathematics'],
    datasets: [
      {
        label: 'Career Assessment Score',
        data: [scores.Science, scores.Technology, scores.Engineering, scores.Mathematics],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} points (${percentage}%)`;
          }
        }
      }
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

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Science': return 'rgba(255, 99, 132, 0.8)';
      case 'Technology': return 'rgba(54, 162, 235, 0.8)';
      case 'Engineering': return 'rgba(255, 206, 86, 0.8)';
      case 'Mathematics': return 'rgba(75, 192, 192, 0.8)';
      default: return 'rgba(153, 102, 255, 0.8)';
    }
  };

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
            {!showResults ? (
              <>
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
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      currentQuestion === 0
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
                        className={`w-3 h-3 rounded-full ${
                          idx === currentQuestion 
                            ? 'bg-primary' 
                            : answeredQuestions[idx]
                              ? 'bg-gray-400' 
                              : 'bg-gray-700'
                        }`}
                      ></div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleNextClick}
                    disabled={currentQuestion === questions.length - 1 || !answeredQuestions[currentQuestion]}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      currentQuestion === questions.length - 1 || !answeredQuestions[currentQuestion]
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    Next <i className="fas fa-arrow-right ml-2"></i>
                  </button>
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
              </>
            ) : (
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-white mb-6">Your Career Assessment Results</h2>
                
                {isGeneratingAnalysis && (
                  <div className="bg-blue-500 bg-opacity-20 border border-blue-500 text-white p-3 rounded-md mb-6">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      <p>AI is analyzing your results...</p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-3 rounded-md mb-6">
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Pie Chart */}
                  <div className="bg-darkblue p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Score Distribution</h3>
                    <div className="h-64 relative">
                      <Pie data={chartData} options={chartOptions} />
                    </div>
                  </div>
                  
                  {/* Score Details */}
                  <div className="bg-darkblue p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Your STEM Scores</h3>
                    <div className="space-y-4">
                      {Object.entries(scores).map(([field, score]) => {
                        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
                        const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
                        const bgColor = getCategoryColor(field);
                        
                        return (
                          <div key={field} className="text-left">
                            <div className="flex justify-between mb-1">
                              <span className="text-white font-medium">{field}</span>
                              <span className="text-white">{score} points ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                              <div 
                                className="h-2.5 rounded-full" 
                                style={{ width: `${percentage}%`, backgroundColor: bgColor }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {aiAnalysis && (
                  <>
                    <div className="bg-darkblue p-6 rounded-lg border border-gray-700 mb-8">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 rounded-full mr-4" style={{ backgroundColor: getCategoryColor(aiAnalysis.primaryField) }}></div>
                        <h3 className="text-2xl font-bold text-primary">
                          Recommended Career Path: {aiAnalysis.primaryField}
                          {aiAnalysis.secondaryField && (
                            <span className="block text-lg text-gray-300 mt-1">
                              with {aiAnalysis.secondaryField} as secondary focus
                            </span>
                          )}
                        </h3>
                      </div>
                      
                      <p className="text-gray-300 mb-6 text-lg text-left">
                        {aiAnalysis.analysis}
                      </p>
                      
                      <div className="mb-6">
                        <h4 className="text-xl font-semibold text-white mb-3 text-left">Recommended Careers:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {aiAnalysis.recommendedCareers.map((career, index) => (
                            <div 
                              key={index}
                              className="bg-darkblue-dark p-5 rounded-lg border border-gray-700 text-left hover:shadow-lg transition-all duration-300"
                            >
                              <h5 className="text-primary font-bold text-lg mb-2">{career.title}</h5>
                              <p className="text-gray-300 mb-3">{career.description}</p>
                              <div className="mb-3">
                                <span className="text-white font-medium">Education Path:</span>
                                <p className="text-gray-300">{career.educationPath}</p>
                              </div>
                              <div>
                                <span className="text-white font-medium">Key Skills:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {career.keySkills?.map((skill, i) => (
                                    <span key={i} className="bg-darkblue px-2 py-1 rounded text-gray-300 text-xs border border-gray-600">{skill}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {aiAnalysis.skillsToFocus && (
                        <div className="text-left">
                          <h4 className="text-xl font-semibold text-white mb-3">Skills to Develop:</h4>
                          <div className="flex flex-wrap gap-2">
                            {aiAnalysis.skillsToFocus.map((skill, index) => (
                              <span key={index} className="bg-primary bg-opacity-20 text-primary px-3 py-2 rounded-full text-sm font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                  <button
                    onClick={resetAssessment}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors transform hover:scale-105 duration-300"
                  >
                    <i className="fas fa-redo mr-2"></i> Retake Assessment
                  </button>
                  <Link 
                    to="/dashboard"
                    className="bg-darkblue-dark text-white px-6 py-3 rounded-lg border border-gray-700 hover:bg-darkblue transition-colors transform hover:scale-105 duration-300"
                  >
                    <i className="fas fa-chart-bar mr-2"></i> View Dashboard
                  </Link>
                  <Link 
                    to="/"
                    className="bg-darkblue-dark text-white px-6 py-3 rounded-lg border border-gray-700 hover:bg-darkblue transition-colors transform hover:scale-105 duration-300"
                  >
                    <i className="fas fa-home mr-2"></i> Back to Home
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mcq;