import { GEMINI_API_KEY } from './env';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSessionQuestions } from './mcqGenerationApi';

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// In-memory storage for analysis results
const analysisStore = {};

// Analyze results from a completed assessment
export async function analyzeResults(sessionId) {
  console.log("analyzeResults called with sessionId:", sessionId);
  
  try {
    // Get the session data with questions and responses
    const questionsData = await getSessionQuestions(sessionId);
    
    if (!questionsData) {
      console.error("No question data found for session");
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    console.log("Questions data retrieved successfully:", 
      questionsData.questions ? `${questionsData.questions.length} questions found` : "No questions found");
    
    // Calculate scores based on responses
    const scores = {
      Science: 0,
      Technology: 0,
      Engineering: 0,
      Mathematics: 0
    };
    
    // Iterate through each question
    questionsData.questions.forEach((question, qIndex) => {
      // If there are responses for this question
      if (question.responses && question.responses.length > 0) {
        // Get the last response (in case there are multiple)
        const response = question.responses[question.responses.length - 1];
        
        // Get the category that corresponds to the selected option
        const selectedCategory = question.categories[response.optionIndex];
        
        // Add points to the selected category
        if (selectedCategory && scores.hasOwnProperty(selectedCategory)) {
          scores[selectedCategory] += 10; // Add 10 points per answer
        }
      }
    });
    
    // Calculate percentages for the analysis
    const totalScore = scores.Science + scores.Technology + scores.Engineering + scores.Mathematics || 1;
    const sciencePercentage = Math.round((scores.Science / totalScore) * 100);
    const technologyPercentage = Math.round((scores.Technology / totalScore) * 100);
    const engineeringPercentage = Math.round((scores.Engineering / totalScore) * 100);
    const mathematicsPercentage = Math.round((scores.Mathematics / totalScore) * 100);
    
    // Get the sorted fields by percentage for better analysis
    const sortedFields = [
      { name: "Science", percentage: sciencePercentage },
      { name: "Technology", percentage: technologyPercentage },
      { name: "Engineering", percentage: engineeringPercentage },
      { name: "Mathematics", percentage: mathematicsPercentage }
    ].sort((a, b) => b.percentage - a.percentage);
    
    // Format score distribution for the prompt
    const scoreDistribution = sortedFields.map(field => 
      `${field.name}: ${scores[field.name]} points (${field.percentage}%)`
    ).join('\n');
    
    // Create prompt for analysis
    const prompt = `
      Based on a comprehensive STEM career assessment, a user has received the following scores:
      
      ${scoreDistribution}
      
      Their primary area of interest appears to be ${sortedFields[0].name} (${sortedFields[0].percentage}%), 
      followed by ${sortedFields[1].name} (${sortedFields[1].percentage}%).
      
      Please provide a personalized career analysis with:
      
      1. A detailed analysis of their STEM preferences and aptitudes based on their exact score distribution
      2. Skills they should develop based on their unique STEM interest pattern
      3. Potential work environments where they might thrive
      
      Format your response as a JSON object with the following structure:
      {
        "analysis": "Your detailed personalized analysis referencing their specific score percentages",
        "primaryField": "${sortedFields[0].name}",
        "secondaryField": "${sortedFields[1].name}",
        "skillsToFocus": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"],
        "recommendedWorkEnvironments": ["Environment 1", "Environment 2", "Environment 3"]
      }
      
      Make the analysis highly specific to their exact score distribution (${sortedFields[0].percentage}%, ${sortedFields[1].percentage}%, ${sortedFields[2].percentage}%, ${sortedFields[3].percentage}%).
    `;
  
    console.log("Scores calculated from responses:", scores);
    console.log("Score percentages - Science:", sciencePercentage + "%", 
                "Technology:", technologyPercentage + "%", 
                "Engineering:", engineeringPercentage + "%", 
                "Mathematics:", mathematicsPercentage + "%");
  
    // Make sure API key is available
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is required for analysis");
    }
    
    console.log("Attempting to call Gemini API for analysis");
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Set up the generation configuration
    const generationConfig = {
      temperature: 0.5,
      maxOutputTokens: 4000,
      responseMimeType: "application/json",
    };
    
    // Request data and structured output
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });
    
    console.log("Gemini API response received");
    const response = result.response;
    const text = response.text();
    
    try {
      // Parse the JSON from the response
      const results = JSON.parse(text);
      console.log("Generated personalized career analysis successfully");
      
      // Add scores to results
      results.scores = scores;
      
      // Save analysis in memory
      analysisStore[sessionId] = results;
      
      return results;
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      throw new Error("Failed to parse response from Gemini API: " + parseError.message);
    }
  } catch (error) {
    console.error("Error generating career analysis:", error);
    // Check if it's a quota exceeded error
    if (error.message && error.message.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Gemini API quota exhausted. Please try again later.");
    }
    throw error;
  }
}

// Function to get saved analysis
export async function getAnalysis(sessionId) {
  try {
    if (!analysisStore[sessionId]) {
      return null;
    }
    
    return analysisStore[sessionId];
  } catch (error) {
    console.error("Error getting analysis:", error);
    return null;
  }
} 