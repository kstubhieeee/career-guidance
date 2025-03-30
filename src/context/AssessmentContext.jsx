import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateMCQQuestions, saveUserResponse, getSessionQuestions } from '../utils/mcqGenerationApi';
import { analyzeResults, getAnalysis } from '../utils/analysisApi';
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
  const [sessionId, setSessionId] = useState(null);

  // Function to fetch questions
  const fetchQuestions = async () => {
    try {
      console.log("fetchQuestions started in AssessmentContext");
      setLoading(true);
      setError(null);

      // Call the generateMCQQuestions function from the API
      const data = await generateMCQQuestions();
      console.log("MCQ questions generated:", data ? "Success" : "Failed");

      if (!data || !data.questions) {
        throw new Error("Failed to generate questions");
      }

      setQuestions(data.questions);
      setSessionId(data.sessionId);
      console.log("Session ID set:", data.sessionId);
      setAnsweredQuestions(Array(data.questions.length).fill(false));
    } catch (err) {
      console.error("Error loading questions:", err);

      // Set a user-friendly error message based on the error
      if (err.message.includes("quota") || err.message.includes("RESOURCE_EXHAUSTED")) {
        setError("Gemini API quota exhausted. Please try again later.");
      } else {
        setError("Failed to load assessment questions. " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load questions when component mounts
  useEffect(() => {
    console.log("Initial useEffect running to fetch questions");
    fetchQuestions();
  }, []);

  // Handle user selecting an option
  const handleOptionSelect = async (questionIndex, optionIndex) => {
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

    // Save the response to file
    if (sessionId) {
      try {
        await saveUserResponse(sessionId, questionIndex, optionIndex);

        // Update local questions state to include the new response
        const updatedQuestions = [...questions];
        if (!updatedQuestions[questionIndex].responses) {
          updatedQuestions[questionIndex].responses = [];
        }
        updatedQuestions[questionIndex].responses.push({
          optionIndex,
          timestamp: Date.now()
        });
        setQuestions(updatedQuestions);
      } catch (err) {
        console.error("Error saving response:", err);
      }
    }

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
    console.log("finishAssessment called - starting analysis generation");
    setIsGeneratingAnalysis(true);
    setError(null);

    try {
      if (!sessionId) {
        console.error("No session ID found when trying to analyze");
        throw new Error("No active session found");
      }

      console.log("Calling analyzeResults with sessionId:", sessionId);
      // Get AI analysis
      const analysis = await analyzeResults(sessionId);
      console.log("Analysis results received:", analysis ? "Success" : "Failed");

      if (!analysis) {
        throw new Error("Failed to generate analysis");
      }

      setAiAnalysis(analysis);
      setScores(analysis.scores);

      // Save results if user is logged in
      if (currentUser) {
        console.log("Saving assessment for logged-in user");
        await saveAssessment({
          sessionId,
          scores: analysis.scores,
          recommendedField: analysis.primaryField,
          analysis: analysis
        });
      }

      setShowResults(true);
    } catch (err) {
      console.error("Error analyzing results:", err);

      // Set a user-friendly error message based on the error
      if (err.message.includes("quota") || err.message.includes("RESOURCE_EXHAUSTED")) {
        setError("Gemini API quota exhausted. Please try again later.");
      } else {
        setError("Failed to analyze results. " + err.message);
      }

      // Create a simple analysis based on the scores
      const analysis = createBasicAnalysis();
      setAiAnalysis(analysis);
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  // Create a basic analysis from scores when API fails
  const createBasicAnalysis = () => {
    // Calculate percentages
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) || 1;
    const scoreArray = Object.entries(scores).map(([field, score]) => ({
      field,
      score,
      percentage: Math.round((score / totalScore) * 100)
    }));

    scoreArray.sort((a, b) => b.score - a.score);

    const primaryField = scoreArray[0].field;
    const secondaryField = scoreArray[1].field;

    return {
      analysis: `Based on your assessment, you show a strong preference for ${primaryField} with ${secondaryField} as your secondary interest.`,
      primaryField,
      secondaryField,
      skillsToFocus: ["Critical thinking", "Problem solving", "Communication"],
      recommendedWorkEnvironments: ["Research environments", "Educational institutions"],
      scores
    };
  };

  // Load a previously completed assessment
  const loadAssessment = async (savedSessionId) => {
    try {
      setLoading(true);
      setError(null);

      // Get the questions data
      const questionsData = await getSessionQuestions(savedSessionId);
      if (!questionsData) {
        throw new Error("Failed to load assessment data");
      }

      setQuestions(questionsData.questions);
      setSessionId(savedSessionId);

      // Get the analysis if it exists
      const analysis = await getAnalysis(savedSessionId);
      if (analysis) {
        setAiAnalysis(analysis);
        setScores(analysis.scores);
        setShowResults(true);
      }

      // Mark all questions as answered
      setAnsweredQuestions(Array(questionsData.questions.length).fill(true));
    } catch (err) {
      console.error("Error loading assessment:", err);
      setError("Failed to load assessment. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Reset assessment to start over
  const resetAssessment = () => {
    setSessionId(null);
    setCurrentQuestion(0);
    setScores({
      Science: 0,
      Technology: 0,
      Engineering: 0,
      Mathematics: 0
    });
    setAnsweredQuestions([]);
    setShowResults(false);
    setAiAnalysis(null);
    setError(null);

    // Fetch new questions
    fetchQuestions();
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
    sessionId,
    handleOptionSelect,
    resetAssessment,
    loadAssessment,
    getProgress,
    finishAssessment
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
} 