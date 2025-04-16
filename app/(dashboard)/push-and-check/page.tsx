'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '@/components/grading/file-uploader';
import { StudentPreview } from '@/components/grading/student-preview';
import { processStudentAnswers } from '@/lib/processing';
import { Rubric, getAllRubrics, saveGradingSession, fileToBase64 } from '@/lib/storage';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle2, Key, History } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function PushAndCheckPage() {
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [answerKey, setAnswerKey] = useState<File | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadRubrics = async () => {
      const loadedRubrics = await getAllRubrics();
      setRubrics(loadedRubrics);
    };
    loadRubrics();
  }, []);

  const handleFileChange = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    setResults([]);
  };

  const handleAnswerKeyChange = (uploadedFiles: File[]) => {
    if (uploadedFiles.length > 0) {
      setAnswerKey(uploadedFiles[0]);
    } else {
      setAnswerKey(null);
    }
  };

  const handleProcessFiles = async () => {
    if (!selectedRubric) {
      toast.error('Please select a rubric first');
      return;
    }

    if (files.length === 0) {
      toast.error('Please upload files first');
      return;
    }

    if (!answerKey) {
      toast.error('Please upload an answer key');
      return;
    }

    if (!sessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }

    setIsProcessing(true);
    try {
      const gradingResults = await processStudentAnswers(files, selectedRubric.content, answerKey);
      setResults(gradingResults);
      
      // Save to history
      if (user) {
        const sessionId = `session-${Date.now()}`;
        const session = {
          id: sessionId,
          userId: user.id,
          subject: selectedRubric.subject,
          sessionName,
          studentFiles: await Promise.all(files.map(file => fileToBase64(file))),
          rubricFile: null,
          useTemplateRubric: false,
          results: gradingResults,
          createdAt: new Date().toISOString(),
        };
        
        await saveGradingSession(session);
        toast.success('Results saved to history');
      }
      
      toast.success('Files processed successfully');
      setActiveTab("results");
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Error processing files. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewHistory = () => {
    router.push('/grading/history');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Push and Check</h1>
            <p className="text-muted-foreground mt-1">
              Upload student answers and answer key for instant grading results
            </p>
          </div>
          <Button variant="outline" onClick={handleViewHistory} className="flex items-center gap-2">
            <History size={16} />
            View History
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload size={16} />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="answer-key" className="flex items-center gap-2">
              <Key size={16} />
              Answer Key
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Student Answers</CardTitle>
                <CardDescription>
                  Select a rubric and upload student answer files to get instant grading results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="rubric">Select Rubric</Label>
                  <Select
                    value={selectedRubric?.id || ''}
                    onValueChange={(value) => {
                      const rubric = rubrics.find((r) => r.id === value);
                      setSelectedRubric(rubric || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a rubric" />
                    </SelectTrigger>
                    <SelectContent>
                      {rubrics.map((rubric) => (
                        <SelectItem key={rubric.id} value={rubric.id}>
                          {rubric.name} ({rubric.subject})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Session Name</Label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter a name for this grading session"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload Student Files</Label>
                  <FileUploader 
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple={true}
                    maxFiles={10}
                    onChange={handleFileChange}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => setActiveTab("answer-key")}
                  disabled={!selectedRubric || files.length === 0 || !sessionName.trim()}
                  className="w-full"
                >
                  Next: Upload Answer Key
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="answer-key" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Answer Key</CardTitle>
                <CardDescription>
                  Upload the answer key file to compare with student submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Answer Key File</Label>
                  <FileUploader 
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple={false}
                    maxFiles={1}
                    onChange={handleAnswerKeyChange}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("upload")}
                >
                  Back
                </Button>
                <Button
                  onClick={handleProcessFiles}
                  disabled={isProcessing || !answerKey}
                  className="w-1/2"
                >
                  {isProcessing ? 'Processing...' : 'Process Files'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {results.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((result, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{files[index].name}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsPreviewOpen(true)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>Overall Score</Label>
                            <span className="text-2xl font-bold text-primary">
                              {result.score}%
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${result.score}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {result.feedback}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Results Yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload and process files to see grading results
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {results.length > 0 && (
          <StudentPreview
            files={files}
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            gradingResults={results}
            showResults={true}
          />
        )}
      </div>
    </div>
  );
} 