import { createWorker } from 'tesseract.js';

// Initialize Tesseract worker
let worker: Tesseract.Worker | null = null;

export async function initializeOCR() {
  if (!worker) {
    worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
  }
}

export async function processImage(imageFile: File): Promise<string> {
  if (!worker) {
    await initializeOCR();
  }
  const result = await worker!.recognize(imageFile);
  return result.data.text;
}

// Function to parse rubric text into criteria
function parseRubric(rubricText: string): Array<{name: string, weight: number}> {
  return rubricText.split('\n')
    .map(line => {
      const match = line.match(/(.*?)\s*\((\d+)%\)/);
      if (match) {
        return {
          name: match[1].trim(),
          weight: parseInt(match[2], 10)
        };
      }
      return null;
    })
    .filter((item): item is {name: string, weight: number} => item !== null);
}

interface AIResponse {
  score: number;
  feedback: string;
  suggestions: string[];
}

// Function to grade a single criterion
async function gradeCriterion(answer: string, criterionName: string, maxScore: number): Promise<{
  score: number;
  feedback: string;
}> {
  // Prepare the prompt for the AI
  const prompt = `
    You are an expert essay grader. Please evaluate the following essay based on the criterion: "${criterionName}".
    
    ESSAY:
    ${answer}
    
    Please provide a detailed evaluation in the following format:
    
    SCORE: [number between 0 and ${maxScore}]
    
    STRENGTHS:
    - [List key strengths]
    
    WEAKNESSES:
    - [List key weaknesses]
    
    DETAILED ANALYSIS:
    [Provide a comprehensive analysis of the essay's performance on this criterion]
    
    SUGGESTIONS:
    Immediate Improvements:
    - [List specific, actionable improvements]
    
    Long-term Development:
    - [List broader development areas]
    
    Please ensure your response is clear, structured, and focused on the specific criterion being evaluated.
  `;

  try {
    // Call the AI API
    const response = await callAIAPI(prompt);
    
    // Parse the response to extract score and format feedback
    const scoreMatch = response.match(/SCORE:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : Math.floor(maxScore * 0.7);
    
    // Ensure score is within valid range
    const validatedScore = Math.max(0, Math.min(maxScore, score));

    return {
      score: validatedScore,
      feedback: response
    };
  } catch (error) {
    console.error('AI grading error:', error);
    // Fallback to basic grading if AI fails
    return {
      score: Math.floor(maxScore * 0.7), // Default to 70% if AI fails
      feedback: 'Unable to perform AI grading. Please review manually.'
    };
  }
}

// Function to call the AI API
async function callAIAPI(prompt: string): Promise<string> {
  const API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY;
  const API_URL = process.env.NEXT_PUBLIC_AI_API_URL;

  if (!API_KEY || !API_URL) {
    throw new Error('AI API configuration missing. Please check your .env.local file.');
  }

  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topP: 0.8,
        topK: 40
      }
    })
  });

  if (!response.ok) {
    throw new Error(`AI API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid AI API response');
  }

  return data.candidates[0].content.parts[0].text;
}

export async function processStudentAnswers(
  studentFiles: File[],
  rubricText: string
): Promise<Array<{
  id: string;
  name: string;
  score: number;
  feedback: string;
  criteria: Array<{
    name: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
}>> {
  const criteria = parseRubric(rubricText);
  const results = [];
  
  for (const file of studentFiles) {
    const text = await processImage(file);
    const criteriaResults = await Promise.all(criteria.map(async criterion => {
      const maxScore = criterion.weight;
      const { score, feedback } = await gradeCriterion(text, criterion.name, maxScore);
      return {
        name: criterion.name,
        score,
        maxScore,
        feedback
      };
    }));
    
    const totalScore = Math.round(
      criteriaResults.reduce((sum, criterion) => sum + criterion.score, 0) /
      criteriaResults.reduce((sum, criterion) => sum + criterion.maxScore, 0) * 100
    );
    
    const overallFeedback = totalScore >= 80 ? "Excellent work overall!" :
                           totalScore >= 60 ? "Good work with room for improvement." :
                           totalScore >= 40 ? "Needs significant improvement." :
                           "Requires extensive revision.";
    
    results.push({
      id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name.replace(/\.[^/.]+$/, ""),
      score: totalScore,
      feedback: overallFeedback,
      criteria: criteriaResults
    });
  }
  
  return results;
} 