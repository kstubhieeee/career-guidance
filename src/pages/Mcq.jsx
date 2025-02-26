import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function Mcq() {
  const { saveAssessment } = useAuth();
  const [questionsData, setQuestionsData] = useState(null);
  const [careerFields, setCareerFields] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({
    Science: 0,
    Technology: 0,
    Engineering: 0,
    Mathematics: 0
  });
  const [showResults, setShowResults] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [progress, setProgress] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [savingResults, setSavingResults] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    // Load questions data
    Promise.all([
      import('../data/questions.json'),
      import('../data/careerFields.json')
    ])
      .then(([questionsModule, careerFieldsModule]) => {
        setQuestionsData(questionsModule);
        setCareerFields(careerFieldsModule);
        setAnsweredQuestions(Array(questionsModule.questions.length).fill(false));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-darkblue py-12 flex justify-center items-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!questionsData || !careerFields) {
    return (
      <div className="min-h-screen bg-darkblue py-12 flex justify-center items-center">
        <div className="text-white text-center">
          <p className="text-xl">Error loading assessment data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const { questions, options, optionCategories } = questionsData;

  // Display options without categories
  const displayOptions = options.map(optionSet => 
    optionSet.map(option => {
      // Remove the category in parentheses
      return option.replace(/\s*\([^)]*\)\s*$/, '');
    })
  );

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
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const handleOptionClick = (option, index) => {
    if (answeredQuestions[currentQuestion]) return;

    setSelectedOption(index);

    // Update scores based on the selected option's category
    const newScores = { ...scores };
    const category = optionCategories[currentQuestion][index];
    newScores[category] += 1;
    setScores(newScores);

    // Mark question as answered after a short delay
    setTimeout(() => {
      const newAnsweredQuestions = [...answeredQuestions];
      newAnsweredQuestions[currentQuestion] = true;
      setAnsweredQuestions(newAnsweredQuestions);

      // Move to next question or show results after a delay
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setProgress(((currentQuestion + 1) / questions.length) * 100);
          setSelectedOption(null);
        } else {
          setShowResults(true);
          saveAssessmentResults();
        }
      }, 500);
    }, 500);
  };

  const saveAssessmentResults = async () => {
    const recommendedField = getRecommendedCareer().field;
    
    try {
      setSavingResults(true);
      setSaveError(null);
      
      await saveAssessment({
        scores,
        recommendedField
      });
    } catch (error) {
      console.error('Error saving assessment:', error);
      setSaveError('Failed to save your assessment results. Your results are still displayed below.');
    } finally {
      setSavingResults(false);
    }
  };

  const handlePrevClick = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setProgress(((currentQuestion - 1) / questions.length) * 100);
    }
  };

  const handleNextClick = () => {
    if (currentQuestion < questions.length - 1 && answeredQuestions[currentQuestion]) {
      setCurrentQuestion(currentQuestion + 1);
      setProgress(((currentQuestion + 1) / questions.length) * 100);
      setSelectedOption(null);
    }
  };

  const handlePageNumberClick = (pageNumber) => {
    setCurrentQuestion(pageNumber);
    setProgress(((pageNumber) / questions.length) * 100);
    setSelectedOption(null);
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setScores({
      Science: 0,
      Technology: 0,
      Engineering: 0,
      Mathematics: 0
    });
    setShowResults(false);
    setAnsweredQuestions(Array(questions.length).fill(false));
    setProgress(0);
    setSelectedOption(null);
    setSaveError(null);
  };

  const getRecommendedCareer = () => {
    const maxScore = Math.max(scores.Science, scores.Technology, scores.Engineering, scores.Mathematics);
    
    if (maxScore === scores.Science) {
      return careerFields.science;
    } else if (maxScore === scores.Technology) {
      return careerFields.technology;
    } else if (maxScore === scores.Engineering) {
      return careerFields.engineering;
    } else {
      return careerFields.mathematics;
    }
  };

  const getOptionClassName = (index) => {
    if (answeredQuestions[currentQuestion]) {
      if (selectedOption === index) {
        return "bg-primary text-white border border-primary-dark";
      }
      return "bg-darkblue-light border border-gray-700 opacity-70";
    }
    
    if (selectedOption === index) {
      return "bg-primary-light text-white border border-primary";
    }
    
    return "bg-darkblue-light border border-gray-700 hover:bg-darkblue-dark";
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
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-300">{Math.round(progress)}%</div>
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
                    {questions[currentQuestion]}
                  </h2>
                  
                  <div className="space-y-4">
                    {displayOptions[currentQuestion].map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionClick(option, index)}
                        disabled={answeredQuestions[currentQuestion]}
                        className={`w-full text-left p-5 rounded-lg transition-all duration-300 text-white ${getOptionClassName(index)} hover:shadow-lg transform hover:-translate-y-1`}
                      >
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${selectedOption === index ? 'bg-white text-primary' : 'bg-darkblue-dark text-white'}`}>
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
                  
                  <div className="hidden md:flex flex-wrap justify-center">
                    {Array.from({ length: Math.min(5, questions.length - currentQuestion) }, (_, i) => {
                      const pageStart = Math.floor(currentQuestion / 5) * 5;
                      return pageStart + i < questions.length ? pageStart + i : null;
                    }).filter(Boolean).map((num) => (
                      <button
                        key={num}
                        onClick={() => handlePageNumberClick(num)}
                        className={`w-10 h-10 mx-1 rounded-full flex items-center justify-center transition-all duration-300 ${
                          currentQuestion === num
                            ? 'bg-primary text-white scale-110'
                            : answeredQuestions[num]
                              ? 'bg-gray-700 text-white'
                              : 'bg-darkblue border border-gray-600 text-white hover:bg-darkblue-dark'
                        }`}
                      >
                        {num + 1}
                      </button>
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
              </>
            ) : (
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-white mb-6">Your Career Assessment Results</h2>
                
                {savingResults && (
                  <div className="bg-blue-500 bg-opacity-20 border border-blue-500 text-white p-3 rounded-md mb-6">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      <p>Saving your assessment results...</p>
                    </div>
                  </div>
                )}
                
                {saveError && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-3 rounded-md mb-6">
                    <p>{saveError}</p>
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
                    <h3 className="text-xl font-bold text-white mb-4">Detailed Scores</h3>
                    <div className="space-y-4">
                      {Object.entries(scores).map(([field, score]) => {
                        const percentage = Math.round((score / questions.length) * 100);
                        let bgColor;
                        
                        switch(field) {
                          case 'Science': bgColor = 'rgba(255, 99, 132, 0.8)'; break;
                          case 'Technology': bgColor = 'rgba(54, 162, 235, 0.8)'; break;
                          case 'Engineering': bgColor = 'rgba(255, 206, 86, 0.8)'; break;
                          case 'Mathematics': bgColor = 'rgba(75, 192, 192, 0.8)'; break;
                          default: bgColor = 'rgba(153, 102, 255, 0.8)';
                        }
                        
                        return (
                          <div key={field} className="text-left">
                            <div className="flex justify-between mb-1">
                              <span className="text-white font-medium">{field}</span>
                              <span className="text-white">{score}/{questions.length} ({percentage}%)</span>
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
                
                {(() => {
                  const recommendation = getRecommendedCareer();
                  return (
                    <div className="bg-darkblue p-6 rounded-lg border border-gray-700 mb-8">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 rounded-full mr-4" style={{ backgroundColor: recommendation.color }}></div>
                        <h3 className="text-2xl font-bold text-primary">
                          Your Recommended Career Path: {recommendation.name}
                        </h3>
                      </div>
                      
                      <p className="text-gray-300 mb-6 text-lg">
                        {recommendation.description}
                      </p>
                      
                      <div className="mb-6">
                        <h4 className="text-xl font-semibold text-white mb-3">Recommended Careers:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {recommendation.careers.map((career, index) => (
                            <div 
                              key={index}
                              className="bg-darkblue-dark p-4 rounded-lg border border-gray-700 text-white text-center hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105"
                            >
                              {career.name}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-gray-300">
                        <p>
                          These career suggestions are based on your responses to the assessment questions. 
                          Consider exploring these options further to find the best fit for your interests and skills.
                        </p>
                      </div>
                    </div>
                  );
                })()}
                
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