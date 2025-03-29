import { OPENROUTER_API_KEY } from './env';

export async function generateMCQQuestions() {
  const prompt = `
    Generate 10 multiple-choice career assessment questions related to STEM fields (Science, Technology, Engineering, Mathematics).
    
    For each question:
    1. The question should assess a person's interest, aptitude, or preference in career-related aspects.
    2. Provide exactly 4 answer choices (labeled A through D).
    3. Each answer choice should correspond to one of the four STEM categories: Science, Technology, Engineering, or Mathematics.
    4. Specify which STEM category each option belongs to.
    
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
    
    Make the questions engaging and relevant to career choices. Avoid technical questions that test knowledge - instead focus on preferences, interests, and aptitudes.
  `;

  try {
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
          model: "mistralai/mixtral-8x7b-instruct",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Error generating MCQ questions:", error);
    // Return fallback questions in case of API failure
    return getFallbackQuestions();
  }
}

export async function analyzeResults(scores) {
  const totalScore = scores.Science + scores.Technology + scores.Engineering + scores.Mathematics;
  const sciencePercentage = Math.round((scores.Science / totalScore) * 100);
  const technologyPercentage = Math.round((scores.Technology / totalScore) * 100);
  const engineeringPercentage = Math.round((scores.Engineering / totalScore) * 100);
  const mathematicsPercentage = Math.round((scores.Mathematics / totalScore) * 100);

  const prompt = `
    Based on a career assessment for STEM fields, a user has received the following scores:
    
    Science: ${scores.Science} points (${sciencePercentage}%)
    Technology: ${scores.Technology} points (${technologyPercentage}%)
    Engineering: ${scores.Engineering} points (${engineeringPercentage}%)
    Mathematics: ${scores.Mathematics} points (${mathematicsPercentage}%)
    
    Please analyze these results and provide:
    
    1. An overall analysis of the student's STEM preferences
    2. Recommended career paths with 3-5 specific jobs for each path
    3. Suggested educational routes to pursue these careers
    4. Skills they should develop
    
    Format your response as a JSON object with the following structure:
    {
      "analysis": "Your detailed analysis here",
      "primaryField": "The main field they should focus on (Science, Technology, Engineering, or Mathematics)",
      "secondaryField": "A complementary field they should also consider",
      "recommendedCareers": [
        {
          "title": "Career title",
          "description": "Brief career description",
          "educationPath": "Suggested degree or certification path",
          "keySkills": ["Skill 1", "Skill 2", "Skill 3"]
        }
      ],
      "skillsToFocus": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
    }
  `;

  try {
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
          model: "mistralai/mixtral-8x7b-instruct",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing results:", error);
    // Return a fallback analysis in case of API failure
    return getFallbackAnalysis(scores);
  }
}

function getFallbackQuestions() {
  return {
    "questions": [
      {
        "question": "Which activity would you most enjoy doing in your free time?",
        "options": [
          "A. Conducting experiments to understand how things work",
          "B. Building or fixing computers and other electronic devices",
          "C. Designing and building structures or mechanical devices",
          "D. Solving complex puzzles or mathematical problems"
        ],
        "categories": [
          "Science",
          "Technology",
          "Engineering",
          "Mathematics"
        ]
      },
      {
        "question": "Which of these subjects did you/do you enjoy the most in school?",
        "options": [
          "A. Biology, Chemistry or Physics",
          "B. Computer Science or Information Technology",
          "C. Design Technology or Engineering classes",
          "D. Mathematics or Statistics"
        ],
        "categories": [
          "Science",
          "Technology",
          "Engineering",
          "Mathematics"
        ]
      },
      {
        "question": "When faced with a problem, what approach do you typically take?",
        "options": [
          "A. Research and analyze to understand the underlying principles",
          "B. Look for technological solutions or tools to help solve it",
          "C. Design and build a practical solution",
          "D. Use logical reasoning and calculations to find an answer"
        ],
        "categories": [
          "Science",
          "Technology",
          "Engineering",
          "Mathematics"
        ]
      },
      {
        "question": "Which of these career outcomes would appeal to you most?",
        "options": [
          "A. Making discoveries that advance human knowledge",
          "B. Developing software or digital products that people use",
          "C. Creating physical structures or devices that solve problems",
          "D. Using mathematical models to analyze data and make predictions"
        ],
        "categories": [
          "Science",
          "Technology",
          "Engineering",
          "Mathematics"
        ]
      },
      {
        "question": "Which environment would you prefer to work in?",
        "options": [
          "A. Laboratory or research facility",
          "B. Tech company or IT department",
          "C. Workshop, construction site, or factory",
          "D. Office setting with focus on analysis and computation"
        ],
        "categories": [
          "Science",
          "Technology",
          "Engineering",
          "Mathematics"
        ]
      },
      {
        "question": "What type of project would you be most excited to lead?",
        "options": [
          "A. Investigating the effects of a new treatment or compound",
          "B. Developing a new app or software platform",
          "C. Designing and building a new prototype or structure",
          "D. Creating a predictive model using statistics and data"
        ],
        "categories": [
          "Science",
          "Technology",
          "Engineering",
          "Mathematics"
        ]
      },
      {
        "question": "Which skill do you think is your strongest?",
        "options": [
          "A. Observing and analyzing natural phenomena",
          "B. Understanding and working with computer systems",
          "C. Designing and building physical solutions",
          "D. Working with numbers and abstract concepts"
        ],
        "categories": [
          "Science",
          "Technology",
          "Engineering",
          "Mathematics"
        ]
      },
      {
        "question": "How would you prefer to contribute to addressing climate change?",
        "options": [
          "A. Researching alternative energy sources or environmental impacts",
          "B. Developing software to monitor and optimize energy usage",
          "C. Designing more efficient vehicles or sustainable buildings",
          "D. Creating mathematical models to predict climate patterns"
        ],
        "categories": [
          "Science",
          "Technology",
          "Engineering",
          "Mathematics"
        ]
      },
      {
        "question": "Which of these questions interests you the most?",
        "options": [
          "A. How do biological systems work at the molecular level?",
          "B. How can we make computers perform tasks more efficiently?",
          "C. How can we build structures that withstand natural disasters?",
          "D. How can we use statistics to understand large datasets?"
        ],
        "categories": [
          "Science",
          "Technology",
          "Engineering",
          "Mathematics"
        ]
      },
      {
        "question": "Which of these famous figures would you most like to emulate in your career?",
        "options": [
          "A. Marie Curie or Charles Darwin (scientists)",
          "B. Steve Jobs or Ada Lovelace (technology innovators)",
          "C. Nikola Tesla or Elon Musk (engineers/inventors)",
          "D. Katherine Johnson or Alan Turing (mathematicians)"
        ],
        "categories": [
          "Science",
          "Technology",
          "Engineering",
          "Mathematics"
        ]
      }
    ]
  };
}

function getFallbackAnalysis(scores) {
  // Determine the highest and second highest scores
  const scoreArray = [
    { field: "Science", score: scores.Science },
    { field: "Technology", score: scores.Technology },
    { field: "Engineering", score: scores.Engineering },
    { field: "Mathematics", score: scores.Mathematics }
  ];
  
  scoreArray.sort((a, b) => b.score - a.score);
  
  const primaryField = scoreArray[0].field;
  const secondaryField = scoreArray[1].field;
  
  let recommendedCareers = [];
  
  switch(primaryField) {
    case "Science":
      recommendedCareers = [
        {
          "title": "Research Scientist",
          "description": "Conduct research to expand scientific knowledge in a specific field",
          "educationPath": "Bachelor's in Science, followed by Master's or PhD in specialized field",
          "keySkills": ["Research methodology", "Lab techniques", "Data analysis", "Scientific writing"]
        },
        {
          "title": "Medical Scientist",
          "description": "Research human diseases and methods to improve human health",
          "educationPath": "Bachelor's in Biology/Chemistry, followed by MD or PhD",
          "keySkills": ["Medical knowledge", "Laboratory skills", "Critical thinking", "Problem-solving"]
        },
        {
          "title": "Environmental Scientist",
          "description": "Study environmental problems and develop solutions",
          "educationPath": "Bachelor's or Master's in Environmental Science",
          "keySkills": ["Field work", "Data collection", "Environmental regulations", "Analytical thinking"]
        }
      ];
      break;
    case "Technology":
      recommendedCareers = [
        {
          "title": "Software Developer",
          "description": "Design and build computer applications and systems",
          "educationPath": "Bachelor's in Computer Science or related field",
          "keySkills": ["Programming", "Algorithm design", "Problem-solving", "Teamwork"]
        },
        {
          "title": "Data Scientist",
          "description": "Analyze and interpret complex data to inform decision making",
          "educationPath": "Bachelor's in Computer Science/Statistics, often Master's or PhD",
          "keySkills": ["Machine learning", "Statistical analysis", "Programming", "Data visualization"]
        },
        {
          "title": "Cybersecurity Analyst",
          "description": "Protect computer systems and networks from security breaches",
          "educationPath": "Bachelor's in Computer Science/Cybersecurity",
          "keySkills": ["Network security", "Risk assessment", "Security protocols", "Ethical hacking"]
        }
      ];
      break;
    case "Engineering":
      recommendedCareers = [
        {
          "title": "Mechanical Engineer",
          "description": "Design, develop, and test mechanical devices and systems",
          "educationPath": "Bachelor's in Mechanical Engineering",
          "keySkills": ["CAD software", "Mechanical design", "Problem-solving", "Technical writing"]
        },
        {
          "title": "Civil Engineer",
          "description": "Design and oversee construction of infrastructure projects",
          "educationPath": "Bachelor's in Civil Engineering",
          "keySkills": ["Structural design", "Project management", "AutoCAD", "Building codes"]
        },
        {
          "title": "Aerospace Engineer",
          "description": "Design aircraft, spacecraft, and propulsion systems",
          "educationPath": "Bachelor's in Aerospace Engineering",
          "keySkills": ["Fluid dynamics", "Materials science", "Propulsion systems", "CAD modeling"]
        }
      ];
      break;
    case "Mathematics":
      recommendedCareers = [
        {
          "title": "Statistician",
          "description": "Collect, analyze and interpret data to identify trends and relationships",
          "educationPath": "Bachelor's or Master's in Statistics or Mathematics",
          "keySkills": ["Statistical methods", "Data analysis", "Programming", "Problem-solving"]
        },
        {
          "title": "Actuary",
          "description": "Analyze financial costs of risk and uncertainty",
          "educationPath": "Bachelor's in Mathematics/Actuarial Science + professional certification",
          "keySkills": ["Risk assessment", "Statistical analysis", "Financial knowledge", "Communication"]
        },
        {
          "title": "Operations Research Analyst",
          "description": "Use mathematical methods to solve complex problems and improve decision-making",
          "educationPath": "Bachelor's or Master's in Mathematics/Operations Research",
          "keySkills": ["Optimization", "Statistical analysis", "Mathematical modeling", "Problem-solving"]
        }
      ];
      break;
  }
  
  return {
    "analysis": `Based on your assessment results, you show a strong preference for ${primaryField} with a secondary interest in ${secondaryField}. Your score distribution indicates you would thrive in careers that combine elements of both these fields.`,
    "primaryField": primaryField,
    "secondaryField": secondaryField,
    "recommendedCareers": recommendedCareers,
    "skillsToFocus": [
      "Critical thinking",
      "Problem-solving",
      "Communication",
      "Analytical skills",
      "Technical proficiency in your chosen field"
    ]
  };
} 