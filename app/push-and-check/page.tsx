"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, Loader2, CheckCircle, AlertCircle, ArrowRight, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { processImage, initializeOCR, callAIAPIWithFile } from "@/lib/processing";

interface Question {
  number: number;
  expectedAnswer: string;
  suggestedIdeas: string;
  studentAnswer?: string;
  score?: number;
  feedback?: string;
  aiFeedback?: string;
}

export default function PushAndCheckPage() {
  const [numQuestions, setNumQuestions] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [scores, setScores] = useState<{ [key: number]: number | undefined }>({});
  const [feedback, setFeedback] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [studentAnswers, setStudentAnswers] = useState<{ [key: number]: string }>({});
  const [activeTab, setActiveTab] = useState<string>("setup");

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      // In a real implementation, you would process the file here
      // For now, we'll simulate extracting text
      simulateFileProcessing(acceptedFiles[0]);
    }
  });

  const simulateFileProcessing = async (file: File) => {
    setIsAnalyzing(true);
    try {
      // Initialize OCR
      await initializeOCR();
      
      // Process the image to extract text
      const extractedText = await processImage(file);
      setExtractedText(extractedText);
      
      // Split the text into "answers" for each question
      if (numQuestions > 0) {
        const answers: { [key: number]: string } = {};
        for (let i = 1; i <= numQuestions; i++) {
          answers[i] = extractedText;
        }
        setStudentAnswers(answers);
        
        // Update the questions with the extracted text
        setQuestions(prevQuestions => 
          prevQuestions.map(q => ({
            ...q,
            studentAnswer: extractedText
          }))
        );
      }
      
      toast.success("File processed successfully");
    } catch (error) {
      toast.error("Failed to process file");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value) || 0;
    setNumQuestions(num);
    setQuestions(Array.from({ length: num }, (_, i) => ({
      number: i + 1,
      expectedAnswer: "",
      suggestedIdeas: ""
    })));
    setShowResults(false);
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
    setShowResults(false);
  };

  const handleScoreChange = (questionNumber: number, score: string) => {
    const scoreValue = score === '' ? undefined : parseFloat(score);
    setScores(prev => ({ ...prev, [questionNumber]: scoreValue }));
    
    // Recalculate total score
    const newScores = { ...scores, [questionNumber]: scoreValue };
    const validScores = Object.values(newScores).filter(score => score !== undefined) as number[];
    if (validScores.length > 0) {
      const total = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
      setTotalScore(total);
    }
    
    setShowResults(false);
  };

  const handleFeedbackChange = (questionNumber: number, feedback: string) => {
    setFeedback(prev => ({ ...prev, [questionNumber]: feedback }));
    setShowResults(false);
  };

  const handleStudentAnswerChange = (questionNumber: number, answer: string) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q.number === questionNumber 
          ? { ...q, studentAnswer: answer } 
          : q
      )
    );
    setShowResults(false);
  };

  const calculateTotalScore = () => {
    // Get all valid scores from the questions array
    const validScores = questions
      .map(q => scores[q.number])
      .filter(score => score !== undefined) as number[];
    
    if (validScores.length === 0) return 0;
    
    // Calculate the average
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    return sum / validScores.length;
  };

  const generateAIFeedback = async (question: Question, studentAnswer: string) => {
    try {
      if (!file) {
        throw new Error("No file available for AI analysis");
      }
      
      // Create a prompt for the AI
      const prompt = `You are a kind and helpful expert grader. Evaluate this student answer based on the expected answer.
      
      Expected Answer: ${question.expectedAnswer}
      
      Student Answer: ${studentAnswer}
      
      Provide feedback in the following format:
      SCORE: [number between 0 and 100]
      STRENGTHS: [bullet points of what the student did well]
      WEAKNESSES: [bullet points of what the student could improve]
      ANALYSIS: [brief analysis of the answer]
      SUGGESTIONS: [bullet points of specific suggestions for improvement]
      
      Do not include * or ** or bold text. Use bullet points with • symbol.`;
      
      // Call the AI API with the file
      const response = await callAIAPIWithFile(file, prompt);
      
      // Parse the response to extract score
      const scoreMatch = response.match(/SCORE:\s*(\d+)/i);
      if (!scoreMatch) {
        console.error('Could not find score in AI response:', response);
        throw new Error('AI response did not contain a valid score');
      }
      
      const score = parseInt(scoreMatch[1], 10);
      if (isNaN(score) || score < 0 || score > 100) {
        console.error('Invalid score in AI response:', score);
        throw new Error('AI response contained an invalid score');
      }
      
      // Update the score for this question
      setScores(prev => ({ ...prev, [question.number]: score }));
      
      // Split the response into sections and clean up
      const sections = response.split(/(?=SCORE:|STRENGTHS:|WEAKNESSES:|ANALYSIS:|SUGGESTIONS:)/i)
        .filter(Boolean)
        .map(section => section.trim());
      
      // Format bullet points for each section
      const formatBulletPoints = (text: string) => {
        return text
          .split(/[•*]\s*/)  // Split on either • or * bullets
          .filter(Boolean)
          .map(point => point.trim())
          .filter(point => point.length > 0)  // Remove empty points
          .map(point => `  • ${point}`)  // Add consistent bullet point format
          .join('\n');
      };
      
      // Extract and format each section
      const formattedSections = sections.map(section => {
        if (section.startsWith('SCORE:')) {
          return `SCORE:${section.replace('SCORE:', '').trim()}`;
        }
        
        const [header, ...content] = section.split('\n');
        const sectionContent = content.join(' ').trim();
        
        if (header.includes('ANALYSIS:')) {
          return `ANALYSIS:\n  ${sectionContent}`;
        }
        
        if (header.includes('STRENGTHS:') || header.includes('WEAKNESSES:') || header.includes('SUGGESTIONS:')) {
          return `${header}\n${formatBulletPoints(sectionContent)}`;
        }
        
        return section;
      });
      
      // Join sections with proper spacing
      const formattedFeedback = formattedSections
        .join('\n\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      // Add specific suggestions based on the question's suggested ideas
      if (question.suggestedIdeas) {
        return `${formattedFeedback}\n\nAdditional Ideas to Consider:\n  • ${question.suggestedIdeas.split(',').join('\n  • ')}`;
      }
      
      return formattedFeedback;
    } catch (error: unknown) {
      console.error('AI feedback error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `Unable to generate AI feedback: ${errorMessage}. Please review manually.`;
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please upload a file first");
      return;
    }

    if (numQuestions === 0) {
      toast.error("Please specify the number of questions");
      return;
    }

    // Check if all questions have expected answers
    const missingAnswers = questions.some(q => !q.expectedAnswer.trim());
    if (missingAnswers) {
      toast.error("Please provide expected answers for all questions");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate AI feedback for each question
      const updatedQuestions = [...questions];
      
      for (let i = 0; i < updatedQuestions.length; i++) {
        const question = updatedQuestions[i];
        // Use the studentAnswer from the question object, or fall back to the studentAnswers state
        const studentAnswer = question.studentAnswer || studentAnswers[question.number] || "No answer provided";
        
        // Generate AI feedback
        const aiFeedback = await generateAIFeedback(question, studentAnswer);
        
        // Update the question with AI feedback
        updatedQuestions[i] = {
          ...question,
          studentAnswer, // Ensure studentAnswer is set
          aiFeedback
        };
      }
      
      // Update questions with AI feedback
      setQuestions(updatedQuestions);
      
      // Calculate total score
      const total = calculateTotalScore();
      setTotalScore(total);
      
      // Show results
      setShowResults(true);
      setActiveTab("results");
      
      toast.success("Submission successful!");
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-yellow-600";
    if (score >= 40) return "bg-orange-600";
    return "bg-red-600";
  };

  const getFeedbackBadge = (score: number) => {
    if (score >= 80) return { text: "Excellent", class: "bg-green-100 text-green-800" };
    if (score >= 60) return { text: "Good", class: "bg-yellow-100 text-yellow-800" };
    if (score >= 40) return { text: "Fair", class: "bg-orange-100 text-orange-800" };
    return { text: "Needs Improvement", class: "bg-red-100 text-red-800" };
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Push and Check System</h1>
        <p className="text-muted-foreground">Upload student answers and provide feedback with AI assistance</p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="results" disabled={!showResults}>Results</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Student Answer</CardTitle>
              <CardDescription>Upload a file containing student answers for analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div {...getRootProps()} className="border-2 border-dashed p-8 rounded-lg text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <input {...getInputProps()} />
                {isAnalyzing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Processing file...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-4 text-lg font-medium">Drag and drop a file here, or click to select</p>
                    <p className="mt-2 text-sm text-muted-foreground">Supports PDF, JPG, PNG files</p>
                    {file && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{file.name}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {extractedText && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Extracted Text Preview</h3>
                  <div className="bg-muted/50 rounded-md p-3 max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Number of Questions</CardTitle>
              <CardDescription>Specify how many questions are in the exam</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-full max-w-xs">
                  <Label htmlFor="num-questions">Questions</Label>
                  <Input
                    id="num-questions"
                    type="number"
                    min="1"
                    value={numQuestions || ""}
                    onChange={handleNumQuestionsChange}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label>Status</Label>
                  <div className="mt-1 flex items-center gap-2">
                    {numQuestions > 0 ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-muted-foreground">
                          {numQuestions} question{numQuestions !== 1 ? 's' : ''} set up
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        <span className="text-sm text-muted-foreground">
                          Please specify the number of questions
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => setActiveTab("questions")}
                disabled={numQuestions === 0 || !file}
              >
                Continue to Questions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-7">
            <div className="md:col-span-5">
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-primary" />
                        Question {question.number}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div>
                        <Label htmlFor={`expected-answer-${index}`}>Expected Answer</Label>
                        <Textarea
                          id={`expected-answer-${index}`}
                          value={question.expectedAnswer}
                          onChange={(e) => handleQuestionChange(index, 'expectedAnswer', e.target.value)}
                          placeholder="Enter the expected answer..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`student-answer-${index}`}>Student Answer</Label>
                        <Textarea
                          id={`student-answer-${index}`}
                          value={question.studentAnswer || ""}
                          onChange={(e) => handleStudentAnswerChange(question.number, e.target.value)}
                          placeholder="Enter or edit the student's answer..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`suggested-ideas-${index}`}>Suggested Ideas</Label>
                        <Textarea
                          id={`suggested-ideas-${index}`}
                          value={question.suggestedIdeas}
                          onChange={(e) => handleQuestionChange(index, 'suggestedIdeas', e.target.value)}
                          placeholder="Enter suggested ideas for essay questions..."
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`score-${index}`}>Score</Label>
                          <Input
                            id={`score-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            value={scores[question.number] || ""}
                            onChange={(e) => handleScoreChange(question.number, e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`feedback-${index}`}>Feedback</Label>
                          <Textarea
                            id={`feedback-${index}`}
                            value={feedback[question.number] || ""}
                            onChange={(e) => handleFeedbackChange(question.number, e.target.value)}
                            placeholder="Enter detailed feedback..."
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Grading Session</CardTitle>
                  <CardDescription>Summary of your grading session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">File</h3>
                    <p className="font-medium">{file ? file.name : "No file uploaded"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Questions</h3>
                    <p className="font-medium">{numQuestions} question{numQuestions !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="flex items-center gap-2">
                      {questions.every(q => q.expectedAnswer.trim()) ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">All questions ready</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <span className="text-sm">Missing expected answers</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !file || numQuestions === 0 || questions.some(q => !q.expectedAnswer.trim())}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Submit for Review"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-7">
            <div className="md:col-span-5">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Results</CardTitle>
                      <CardDescription>AI-generated feedback and scores</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        <span className={getScoreColor(totalScore)}>
                          {totalScore.toFixed(1)}%
                        </span>
                      </div>
                      <Badge className={`mt-2 ${getFeedbackBadge(totalScore).class}`}>
                        {getFeedbackBadge(totalScore).text}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={totalScore} 
                    className="h-2 mb-6"
                    indicatorClassName={getProgressColor(totalScore)}
                  />
                  
                  <div className="space-y-6">
                    {questions.map((question, index) => {
                      const score = scores[question.number] || 0;
                      return (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="bg-muted/50">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">Question {question.number}</CardTitle>
                              <div className="text-right">
                                <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                                  {score}%
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6 space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Student Answer</h4>
                              <div className="bg-muted/50 rounded-md p-3">
                                {question.studentAnswer || 'No answer provided'}
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2"
                                onClick={() => {
                                  const newAnswer = prompt("Edit student answer:", question.studentAnswer || "");
                                  if (newAnswer !== null) {
                                    handleStudentAnswerChange(question.number, newAnswer);
                                    // Regenerate AI feedback
                                    generateAIFeedback(question, newAnswer).then(aiFeedback => {
                                      setQuestions(prevQuestions => 
                                        prevQuestions.map(q => 
                                          q.number === question.number 
                                            ? { ...q, aiFeedback } 
                                            : q
                                        )
                                      );
                                      
                                      // Recalculate total score
                                      const total = calculateTotalScore();
                                      setTotalScore(total);
                                    });
                                  }
                                }}
                              >
                                Edit Answer
                              </Button>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Expected Answer</h4>
                              <div className="bg-muted/50 rounded-md p-3">
                                {question.expectedAnswer}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">AI Feedback</h4>
                              <div className="bg-muted/50 rounded-md p-3 whitespace-pre-wrap">
                                {question.aiFeedback || 'No AI feedback available'}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Teacher Feedback</h4>
                              <div className="bg-muted/50 rounded-md p-3">
                                {feedback[question.number] || 'No feedback provided'}
                              </div>
                            </div>
                            
                            <Progress 
                              value={score} 
                              className="h-1 mt-2"
                              indicatorClassName={getProgressColor(score)}
                            />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Overview of grading results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Score</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-2xl font-bold">
                        <span className={getScoreColor(totalScore)}>
                          {totalScore.toFixed(1)}%
                        </span>
                      </div>
                      <Badge className={getFeedbackBadge(totalScore).class}>
                        {getFeedbackBadge(totalScore).text}
                      </Badge>
                    </div>
                    <Progress 
                      value={totalScore} 
                      className="h-1 mt-2"
                      indicatorClassName={getProgressColor(totalScore)}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Questions</h3>
                    <p className="font-medium">{numQuestions} question{numQuestions !== 1 ? 's' : ''}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">File</h3>
                    <p className="font-medium">{file ? file.name : "No file uploaded"}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => setActiveTab("questions")}
                  >
                    Edit Grades
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 