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
                    <p className="mt-4 text-sm text-muted-foreground">{currentResult.feedback}</p>
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
                          <div className="bg-muted/50 rounded-md p-3 mt-2">
                            <p className="text-sm">{criterion.feedback}</p>
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
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      {currentResult.criteria
                        .filter(c => (c.score / c.maxScore) * 100 < 80)
                        .map((criterion, index) => (
                          <li key={index}>
                            <span className="font-medium">{criterion.name}:</span>{' '}
                            Focus on improving {criterion.feedback.toLowerCase()}
                          </li>
                        ))}
                    </ul>
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