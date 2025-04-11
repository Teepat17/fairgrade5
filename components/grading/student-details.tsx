"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface StudentDetailsProps {
  data: any
  selectedStudent: string | null
  onSelectStudent: (studentId: string) => void
}

export function StudentDetails({ data, selectedStudent, onSelectStudent }: StudentDetailsProps) {
  const [activeTab, setActiveTab] = useState("feedback")

  const student = data.students.find((s: any) => s.id === selectedStudent) || data.students[0]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Student Details</CardTitle>
              <CardDescription>Detailed grading feedback for each student</CardDescription>
            </div>
            <div className="mt-4 md:mt-0">
              <Select value={student.id} onValueChange={onSelectStudent}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {data.students.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.score}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold">{student.name}</h3>
                <p className="text-sm text-muted-foreground">File: {student.filename}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{student.score}%</div>
                  <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    Grade: {getGradeFromScore(student.score)}
                  </div>
                </div>
                <Progress value={student.score} className="h-2 w-[200px]" />
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="feedback">Detailed Feedback</TabsTrigger>
              <TabsTrigger value="document">Student Images</TabsTrigger>
            </TabsList>

            <TabsContent value="feedback">
              <div className="space-y-6">
                {student.feedback.map((item: any, index: number) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">{item.question}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-muted-foreground">Student Answer:</h4>
                        <div className="rounded-md bg-muted p-3">
                          <p className="text-sm">{item.answer}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="text-lg font-bold">
                            {item.score}/{item.maxScore}
                          </div>
                          <Progress value={(item.score / item.maxScore) * 100} className="h-2 w-[100px]" />
                        </div>
                        <div className="text-sm font-medium">{((item.score / item.maxScore) * 100).toFixed(0)}%</div>
                      </div>

                      <div>
                        <h4 className="mb-1 text-sm font-medium text-muted-foreground">AI Feedback:</h4>
                        <div className="rounded-md bg-primary/5 p-3">
                          <p className="text-sm">{item.explanation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="document">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Student Answer Images</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* In a real app, these would be actual images from the student */}
                      <div className="relative aspect-[4/3] overflow-hidden rounded-md border">
                        <Image
                          src="/placeholder.svg?height=600&width=800"
                          alt="Student answer page 1"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-md border">
                        <Image
                          src="/placeholder.svg?height=600&width=800"
                          alt="Student answer page 2"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      In a production environment, this would show the actual student answer images.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to convert score to letter grade
function getGradeFromScore(score: number): string {
  if (score >= 90) return "A"
  if (score >= 80) return "B"
  if (score >= 70) return "C"
  if (score >= 60) return "D"
  return "F"
}
