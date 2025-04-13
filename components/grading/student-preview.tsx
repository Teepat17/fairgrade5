import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from 'react';

interface StudentPreviewProps {
  files: File[];
  isOpen: boolean;
  onClose: () => void;
  gradingResults: Array<{
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
  }> | null;
  showResults: boolean;
}

export function StudentPreview({ files, isOpen, onClose, gradingResults, showResults }: StudentPreviewProps) {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  
  const currentFile = files[currentFileIndex];
  const fileUrl = currentFile ? URL.createObjectURL(currentFile) : '';
  const currentResult = gradingResults?.[currentFileIndex];

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>Student Answer Review - {currentFile?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          {/* Left side - Image preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  File {currentFileIndex + 1} of {files.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-[4/3] overflow-hidden rounded-md border">
                  <Image
                    src={fileUrl}
                    alt={`Student answer page ${currentFileIndex + 1}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentFileIndex(prev => Math.max(0, prev - 1))}
                disabled={currentFileIndex === 0}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="py-2">
                Page {currentFileIndex + 1} of {files.length}
              </span>
              <button
                onClick={() => setCurrentFileIndex(prev => Math.min(files.length - 1, prev + 1))}
                disabled={currentFileIndex === files.length - 1}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Right side - Grading results */}
          {showResults && currentResult && (
            <ScrollArea className="h-[600px]">
              <div className="space-y-6 pr-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Overall Score</CardTitle>
                      <div className="text-3xl font-bold">
                        <span className={getScoreColor(currentResult.score)}>
                          {currentResult.score}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={currentResult.score} 
                      className="h-2" 
                      indicatorClassName={getProgressColor(currentResult.score)} 
                    />
                    <Badge className={`mt-4 ${getFeedbackBadge(currentResult.score).class}`}>
                      {getFeedbackBadge(currentResult.score).text}
                    </Badge>
                    <div className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">
                      {currentResult.feedback}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detailed Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {currentResult.criteria.map((criterion, index) => {
                      const percentage = (criterion.score / criterion.maxScore) * 100;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{criterion.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Weight: {(criterion.maxScore)}%
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`text-lg font-bold ${getScoreColor(percentage)}`}>
                                {criterion.score}/{criterion.maxScore}
                              </span>
                              <p className="text-sm text-muted-foreground">
                                ({percentage.toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                          <Progress 
                            value={percentage} 
                            className="h-1" 
                            indicatorClassName={getProgressColor(percentage)} 
                          />
                          <div className="bg-muted/50 rounded-md p-3 mt-2 whitespace-pre-wrap">
                            {criterion.feedback}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Suggestions for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {currentResult.criteria
                        .filter(c => (c.score / c.maxScore) * 100 < 70)
                        .slice(0, 2)
                        .map((criterion, index) => {
                          // Parse the feedback sections
                          const feedbackLines = criterion.feedback.split('\n');
                          
                          // Extract all bullet points and split multi-item lines
                          const bulletPoints = feedbackLines
                            .filter(line => {
                              const trimmed = line.trim();
                              return trimmed.startsWith('•') || 
                                     trimmed.startsWith('-') || 
                                     /^\d+\./.test(trimmed);
                            })
                            .flatMap(line => {
                              const trimmed = line.trim();
                              // If the line contains multiple items separated by " - "
                              if (trimmed.includes(' - ')) {
                                // Split by " - " and create separate bullet points
                                return trimmed.split(' - ').map(item => {
                                  // Remove the bullet character from the first item
                                  if (item.startsWith('•') || item.startsWith('-')) {
                                    return item.substring(1).trim();
                                  }
                                  return item.trim();
                                });
                              }
                              // Single item bullet point
                              return [trimmed.replace(/^[•\-]\s*/, '').replace(/^\d+\.\s*/, '')];
                            });
                          
                          // Get analysis if it exists
                          const analysisIndex = feedbackLines.findIndex(line => 
                            line.trim() === 'ANALYSIS:' || 
                            line.trim() === 'ANALYSIS'
                          );
                          
                          // Extract analysis points if they exist
                          let analysisPoints: string[] = [];
                          if (analysisIndex !== -1) {
                            // Look for bullet points after ANALYSIS:
                            for (let i = analysisIndex + 1; i < feedbackLines.length; i++) {
                              const line = feedbackLines[i].trim();
                              if (line.startsWith('•') || line.startsWith('-') || /^\d+\./.test(line)) {
                                if (line.includes(' - ')) {
                                  // Split multi-item analysis lines
                                  const items = line.split(' - ').map(item => {
                                    if (item.startsWith('•') || item.startsWith('-')) {
                                      return item.substring(1).trim();
                                    }
                                    return item.trim();
                                  });
                                  analysisPoints.push(...items);
                                } else {
                                  analysisPoints.push(line.replace(/^[•\-]\s*/, '').replace(/^\d+\.\s*/, ''));
                                }
                              } else if (line === 'SUGGESTIONS:' || line === 'SUGGESTIONS') {
                                break; // Stop when we reach the next section
                              }
                            }
                          }
                          
                          return (
                            <div key={index} className="space-y-1">
                              <h4 className="font-medium">{criterion.name}:</h4>
                              {analysisPoints.length > 0 && (
                                <div className="mb-2">
                                  <p className="font-medium text-muted-foreground">Analysis:</p>
                                  <ul className="list-none pl-2 space-y-1 text-muted-foreground">
                                    {analysisPoints.map((point, i) => (
                                      <li key={i} className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <ul className="list-none pl-2 space-y-1 text-muted-foreground">
                                {bulletPoints.map((point, i) => (
                                  <li key={i} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}