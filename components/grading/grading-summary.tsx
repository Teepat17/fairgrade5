"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface GradingSummaryProps {
  data: any
  onSelectStudent: (studentId: string) => void
}

export function GradingSummary({ data, onSelectStudent }: GradingSummaryProps) {
  // Calculate statistics
  const scores = data.students.map((student: any) => student.score)
  const averageScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
  const highestScore = Math.max(...scores)
  const lowestScore = Math.min(...scores)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <CardDescription>Across all students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <CardDescription>Best performing student</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highestScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
            <CardDescription>Needs improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowestScore}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
          <CardDescription>Summary of all student scores</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Grade</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.students.map((student: any) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.filename}</TableCell>
                  <TableCell className="text-right">{student.score}%</TableCell>
                  <TableCell className="text-right">{getGradeFromScore(student.score)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onSelectStudent(student.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
