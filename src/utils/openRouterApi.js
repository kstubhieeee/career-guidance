import { OPENROUTER_API_KEY } from './env';

// Generate dynamic MCQ questions from AI on each call
export async function generateMCQQuestions() {
  const prompt = `
    Generate 20 unique multiple-choice career assessment questions related to STEM fields (Science, Technology, Engineering, Mathematics).
    
    Current timestamp: ${Date.now()} - make these questions unique from any previous set.
    
    For each question:
    1. The question should deeply assess a person's interest, aptitude, or preference in career-related aspects.
    2. Provide exactly 4 answer choices (labeled A through D).
    3. Each answer choice should correspond to one of the four STEM categories: Science, Technology, Engineering, or Mathematics.
    4. Specify which STEM category each option belongs to.
    5. Make each question insightful for career guidance purposes.
    6. Ensure questions are diverse, covering different aspects of career preferences, work styles, problem-solving approaches, and interests.
    7. Questions should help identify a person's authentic career preferences in STEM fields.
    
    Format your response as a JSON object with the following structure:
    {
      "questions": [
        {
          "question": "Question text here",
          "options": [
            "A. Option text here",
            "B. Option text here",
            "C. Option text here",
            "D. Option text here"
          ],
          "categories": [
            "Science", 
            "Technology", 
            "Engineering", 
            "Mathematics"
          ]
        }
      ]
    }
    
    Make the questions engaging, diverse, and relevant to career choices. Focus on preferences, interests, aptitudes, and work styles rather than technical knowledge.
  `;

  try {
    console.log("Generating new assessment questions from AI...");
    
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin || "http://localhost:3000",
          "X-Title": "Career Assessment Generator",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-opus:beta",  // Using a more advanced model for better questions
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.8, // Slightly higher temperature for more variety
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      console.error(`OpenRouter API request failed with status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    try {
      const questions = JSON.parse(data.choices[0].message.content);
      console.log(`Successfully generated ${questions.questions.length} new career assessment questions`);
      
      // Ensure we have at least some questions
      if (!questions.questions || questions.questions.length < 5) {
        console.error("Not enough questions generated, requesting emergency questions");
        return await getEmergencyQuestions();
      }
      
      return questions;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return await getEmergencyQuestions();
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    return await getEmergencyQuestions();
  }
}

// This function is called only if the main API call fails
async function getEmergencyQuestions() {
  console.log("Using emergency API call to generate questions");
  
  try {
    // Simpler prompt as fallback
    const emergencyPrompt = `
      Generate 10 multiple-choice questions that assess STEM career preferences.
      Each question should have 4 options (A-D) with each option associated with one of:
      Science, Technology, Engineering, or Mathematics.
      Format as JSON with: questions array containing objects with question, options array, and categories array.
    `;
    
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // Using a faster/simpler model as backup
          messages: [
            {
              role: "user",
              content: emergencyPrompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: "json_object" },
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error("Emergency API call failed");
    }
    
    const data = await response.json();
    const questions = JSON.parse(data.choices[0].message.content);
    
    console.log(`Generated ${questions.questions.length} emergency questions`);
    return questions;
  } catch (finalError) {
    console.error("Even emergency questions failed:", finalError);
    
    // Absolute last resort - create a minimal set of questions programmatically
    return {
      questions: [
        {
          question: "Which type of activity do you enjoy most?",
          options: [
            "A. Exploring and understanding how things work",
            "B. Working with computers and software",
            "C. Building and creating physical objects",
            "D. Solving numerical problems and puzzles"
          ],
          categories: ["Science", "Technology", "Engineering", "Mathematics"]
        },
        {
          question: "What would be your ideal work environment?",
          options: [
            "A. Laboratory or research facility",
            "B. Tech company or digital environment",
            "C. Design studio or workshop",
            "D. Office with focus on data and analysis"
          ],
          categories: ["Science", "Technology", "Engineering", "Mathematics"]
        },
        {
          question: "How do you prefer to solve problems?",
          options: [
            "A. Through systematic investigation and testing",
            "B. Using digital tools and programming",
            "C. By designing and building solutions",
            "D. Through logical reasoning and calculations"
          ],
          categories: ["Science", "Technology", "Engineering", "Mathematics"]
        }
      ]
    };
  }
}

// Analyze results and provide AI-generated career guidance
export async function analyzeResults(scores) {
  const totalScore = scores.Science + scores.Technology + scores.Engineering + scores.Mathematics;
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
  
  const prompt = `
    Based on a comprehensive STEM career assessment, a user has received the following scores:
    
    ${scoreDistribution}
    
    Their primary area of interest appears to be ${sortedFields[0].name} (${sortedFields[0].percentage}%), 
    followed by ${sortedFields[1].name} (${sortedFields[1].percentage}%).
    
    Please provide a highly personalized career analysis with:
    
    1. A detailed analysis of their STEM preferences and aptitudes based on their exact score distribution
    2. 5-7 specific career recommendations that precisely match their score profile, including emerging careers
    3. Educational pathways to pursue these careers, with specific degree recommendations
    4. Skills they should develop based on their unique STEM interest pattern
    5. Interdisciplinary careers that leverage their specific combination of interests
    6. Potential work environments where they might thrive
    
    Format your response as a JSON object with the following structure:
    {
      "analysis": "Your detailed personalized analysis referencing their specific score percentages",
      "primaryField": "${sortedFields[0].name}",
      "secondaryField": "${sortedFields[1].name}",
      "recommendedCareers": [
        {
          "title": "Career title",
          "description": "Detailed career description relevant to their specific score profile",
          "educationPath": "Specific degree or certification path",
          "keySkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
          "salaryRange": "Typical salary range",
          "futureOutlook": "Growth prospects for this career"
        }
      ],
      "interdisciplinaryCareers": [
        {
          "title": "Career combining ${sortedFields[0].name} and ${sortedFields[1].name}",
          "description": "How this career combines their strongest interest areas",
          "requirements": "Specific education and experience needed"
        }
      ],
      "skillsToFocus": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"],
      "recommendedWorkEnvironments": ["Environment 1", "Environment 2", "Environment 3"]
    }
    
    Make the analysis highly specific to their exact score distribution (${sortedFields[0].percentage}%, ${sortedFields[1].percentage}%, ${sortedFields[2].percentage}%, ${sortedFields[3].percentage}%).
  `;

  try {
    console.log("Generating personalized career analysis based on assessment results:", {
      Science: sciencePercentage + "%",
      Technology: technologyPercentage + "%",
      Engineering: engineeringPercentage + "%",
      Mathematics: mathematicsPercentage + "%"
    });
    
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin || "http://localhost:3000",
          "X-Title": "Career Assessment Analyzer",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-opus:beta", // Using a more advanced model for better analysis
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      console.error(`OpenRouter API request failed with status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    try {
      const results = JSON.parse(data.choices[0].message.content);
      console.log("Generated personalized career analysis successfully");
      return results;
    } catch (parseError) {
      console.error("Error parsing AI career analysis:", parseError);
      return await getEmergencyAnalysis(scores);
    }
  } catch (error) {
    console.error("Error generating career analysis:", error);
    return await getEmergencyAnalysis(scores);
  }
}

// This function is called only if the main analysis API call fails
async function getEmergencyAnalysis(scores) {
  console.log("Using emergency API call to generate career analysis");
  
  try {
    // Calculate percentages
    const totalScore = scores.Science + scores.Technology + scores.Engineering + scores.Mathematics;
    const scoreArray = [
      { field: "Science", score: scores.Science, percentage: Math.round((scores.Science / totalScore) * 100) },
      { field: "Technology", score: scores.Technology, percentage: Math.round((scores.Technology / totalScore) * 100) },
      { field: "Engineering", score: scores.Engineering, percentage: Math.round((scores.Engineering / totalScore) * 100) },
      { field: "Mathematics", score: scores.Mathematics, percentage: Math.round((scores.Mathematics / totalScore) * 100) }
    ];
    
    scoreArray.sort((a, b) => b.score - a.score);
    
    const primaryField = scoreArray[0].field;
    const secondaryField = scoreArray[1].field;
    
    const simplePrompt = `
      Create a simple career analysis for someone with these STEM scores:
      Science: ${scoreArray[0].percentage}%
      Technology: ${scoreArray[1].percentage}%
      Engineering: ${scoreArray[2].percentage}%
      Mathematics: ${scoreArray[3].percentage}%
      
      Primary field: ${primaryField}
      Secondary field: ${secondaryField}
      
      Give 3 career recommendations, 2 interdisciplinary careers, and 5 skills to develop.
      Format as simple JSON with: analysis, primaryField, secondaryField, recommendedCareers (array), interdisciplinaryCareers (array), and skillsToFocus (array).
    `;
    
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // Using a faster/simpler model as backup
          messages: [
            {
              role: "user",
              content: simplePrompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: "json_object" },
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error("Emergency analysis API call failed");
    }
    
    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);
    
    console.log("Generated emergency career analysis");
    return analysis;
  } catch (finalError) {
    console.error("Even emergency analysis failed:", finalError);
    
    // Create a very basic analysis as absolute last resort
    const totalScore = scores.Science + scores.Technology + scores.Engineering + scores.Mathematics;
    const scoreArray = [
      { field: "Science", score: scores.Science },
      { field: "Technology", score: scores.Technology },
      { field: "Engineering", score: scores.Engineering },
      { field: "Mathematics", score: scores.Mathematics }
    ];
    
    scoreArray.sort((a, b) => b.score - a.score);
    
    const primaryField = scoreArray[0].field;
    const secondaryField = scoreArray[1].field;
    
    return {
      "analysis": `Based on your assessment results, you show a strong preference for ${primaryField} with a secondary interest in ${secondaryField}. Your score distribution indicates you would thrive in careers that combine elements of both these fields.`,
      "primaryField": primaryField,
      "secondaryField": secondaryField,
      "recommendedCareers": [
        {
          "title": `${primaryField} Specialist`,
          "description": `Uses ${primaryField} knowledge to solve complex problems`,
          "educationPath": `Bachelor's degree in ${primaryField}`,
          "keySkills": ["Critical thinking", "Problem-solving", `${primaryField} fundamentals`, "Communication"]
        },
        {
          "title": `${primaryField} Researcher`,
          "description": `Conducts research in the field of ${primaryField}`,
          "educationPath": `Bachelor's and advanced degree in ${primaryField}`,
          "keySkills": ["Research methods", "Data analysis", "Technical writing", "Analytical thinking"]
        }
      ],
      "interdisciplinaryCareers": [
        {
          "title": `${primaryField}-${secondaryField} Analyst`,
          "description": `Combines knowledge of ${primaryField} and ${secondaryField} to analyze complex problems`,
          "requirements": `Degree in ${primaryField} or ${secondaryField} with additional training`
        }
      ],
      "skillsToFocus": [
        "Critical thinking",
        "Problem-solving",
        "Communication",
        "Data analysis",
        "Adaptability",
        `${primaryField} fundamentals`
      ]
    };
  }
} 