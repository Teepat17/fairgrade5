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

// Function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
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
        maxOutputTokens: 128,
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

// Function to call the AI API with file
async function callAIAPIWithFile(file: File, prompt: string): Promise<string> {
  const API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY;
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  if (!API_KEY) {
    throw new Error('AI API key missing. Please check your .env.local file.');
  }

  // Convert file to base64
  const base64File = await fileToBase64(file);

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: file.type,
                data: base64File.split(',')[1] // Remove the data URL prefix
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI API error:', errorData);
      throw new Error(`AI API request failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid AI API response:', data);
      throw new Error('Invalid AI API response format');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('AI API call error:', error);
    throw error;
  }
}

// Modified gradeCriterion function to only handle files
async function gradeCriterion(answer: File, criterionName: string, maxScore: number, subject: string): Promise<{
  score: number;
  feedback: string;
}> {
  try {
    const prompt = `You are an expert ${subject} grader. Evaluate this essay based on: ${criterionName}

Format your response EXACTLY as follows (do not add any extra text or explanations):

SCORE: [number between 0 and ${maxScore}]

STRENGTHS:
• [key point]
• [key point]

WEAKNESSES:
• [key point]
• [key point]

ANALYSIS:
[2-3 sentences max]

SUGGESTIONS:
• [1-2 key improvements]
• [1-2 key improvements]`;
    
    const response = await callAIAPIWithFile(answer, prompt);
    
    // Parse the response to extract score
    const scoreMatch = response.match(/SCORE:\s*(\d+)/i);
    if (!scoreMatch) {
      console.error('Could not find score in AI response:', response);
      throw new Error('AI response did not contain a valid score');
    }
    
    const score = parseInt(scoreMatch[1], 10);
    if (isNaN(score) || score < 0 || score > maxScore) {
      console.error('Invalid score in AI response:', score);
      throw new Error('AI response contained an invalid score');
    }

    // Split the response into sections and format each section
    const sections = response.split(/(?=SCORE:|STRENGTHS:|WEAKNESSES:|ANALYSIS:|SUGGESTIONS:)/i);
    const formattedSections = sections.map(section => {
      section = section.trim();
    
      // Insert a line break after each section header
      section = section.replace(/^(SCORE:.*)/i, '\n$1\n');
      section = section.replace(/^(STRENGTHS:)/i, '\n$1\n');
      section = section.replace(/^(WEAKNESSES:)/i, '\n$1\n');
      section = section.replace(/^(ANALYSIS:)/i, '\n$1\n');
      section = section.replace(/^(SUGGESTIONS:)/i, '\n$1\n');
    
      // Format bullet points
      section = section.replace(/[•\-]\s*/g, '• ');
      section = section.replace(/(•[^\n]+)/g, '$1\n');
    
      return section.trim();
    });
    

    // Join sections with double line breaks
    let formattedFeedback = formattedSections.join('\n\n').trim();
    
    // Clean up any excessive line breaks
    formattedFeedback = formattedFeedback
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\n\s+\n/g, '\n\n')
      .trim();

    return {
      score: score,
      feedback: formattedFeedback,
    };
  } catch (error: unknown) {
    console.error('AI grading error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      score: Math.floor(maxScore * 0.7),
      feedback: `Unable to perform AI grading: ${errorMessage}. Please review manually.`
    };
  }
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
    const criteriaResults = await Promise.all(criteria.map(async criterion => {
      const maxScore = criterion.weight;
      const { score, feedback } = await gradeCriterion(file, criterion.name, maxScore, "");
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