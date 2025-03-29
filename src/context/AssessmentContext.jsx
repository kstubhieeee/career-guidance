import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateMCQQuestions, analyzeResults } from '../utils/openRouterApi';
import { useAuth } from './AuthContext';

const AssessmentContext = createContext();

export function useAssessment() {
  return useContext(AssessmentContext);
}

export function AssessmentProvider({ children }) {
  const { currentUser, saveAssessment } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({
    Science: 0,
    Technology: 0,
    Engineering: 0,
    Mathematics: 0
  });
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

  // Load questions from API or fallback
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await generateMCQQuestions();
        setQuestions(data.questions);
        setAnsweredQuestions(Array(data.questions.length).fill(false));
      } catch (err) {
        console.error("Error loading questions:", err);
        setError("Failed to load assessment questions. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  // Handle user selecting an option
  const handleOptionSelect = (questionIndex, optionIndex) => {
    if (answeredQuestions[questionIndex]) return; // Prevent answering twice
    
    // Update scores based on selected option
    const selectedCategory = questions[questionIndex].categories[optionIndex];
    
    setScores(prev => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory] + 10 // Increment by 10 points
    }));
    
    // Mark question as answered
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[questionIndex] = true;
    setAnsweredQuestions(newAnsweredQuestions);
    
    // Move to next question after a delay
    setTimeout(() => {
      if (questionIndex < questions.length - 1) {
        setCurrentQuestion(questionIndex + 1);
      } else {
        finishAssessment();
      }
    }, 700);
  };

  // Complete the assessment and generate analysis
  const finishAssessment = async () => {
    setIsGeneratingAnalysis(true);
    
    try {
      // Get AI analysis
      const analysis = await analyzeResults(scores);
      setAiAnalysis(analysis);
      
      // Save results if user is logged in
      if (currentUser) {
        await saveAssessment({
          scores,
          recommendedField: analysis.primaryField,
          analysis: analysis
        });
      }
      
      setShowResults(true);
    } catch (err) {
      console.error("Error analyzing results:", err);
      setError("Failed to analyze results. Please try again later.");
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  // Reset assessment to start over
  const resetAssessment = () => {
    setCurrentQuestion(0);
    setScores({
      Science: 0,
      Technology: 0,
      Engineering: 0,
      Mathematics: 0
    });
    setAnsweredQuestions(Array(questions.length).fill(false));
    setShowResults(false);
    setAiAnalysis(null);
    setError(null);
  };

  // Calculate progress percentage
  const getProgress = () => {
    if (questions.length === 0) return 0;
    return (answeredQuestions.filter(Boolean).length / questions.length) * 100;
  };

  const value = {
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
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
} 