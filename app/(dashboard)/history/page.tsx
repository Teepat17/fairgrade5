"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Download, Trash2, Search } from "lucide-react"

// Mock data for demonstration
const mockHistoryData = [
  {
    id: "session-1234567890",
    name: "Physics Midterm - Spring 2023",
    subject: "Physics",
    createdAt: "2023-04-15T10:30:00Z",
    studentsCount: 25,
    averageScore: 78.5,
  },
  {
    id: "session-0987654321",
    name: "Chemistry Final - Fall 2022",
    subject: "Chemistry",
    createdAt: "2022-12-10T14:15:00Z",
    studentsCount: 32,
    averageScore: 81.2,
  },
  {
    id: "session-5678901234",
    name: "Biology Quiz 3 - Spring 2023",
    subject: "Biology",
    createdAt: "2023-03-22T09:45:00Z",
    studentsCount: 18,
    averageScore: 85.7,
  },
  {
    id: "session-4321098765",
    name: "Math Homework 5 - Spring 2023",
    subject: "Math",
    createdAt: "2023-02-28T16:20:00Z",
    studentsCount: 28,
    averageScore: 72.3,
  },
  {
    id: "session-9876543210",
    name: "English Essay Analysis - Spring 2023",
    subject: "English",
    createdAt: "2023-05-05T13:15:00Z",
    studentsCount: 22,
    averageScore: 83.6,
  },
  {
    id: "session-5432109876",
    name: "Social Studies Document Analysis - Spring 2023",
    subject: "Social",
    createdAt: "2023-05-18T10:45:00Z",
    studentsCount: 24,
    averageScore: 79.8,
  },
]

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")

  // Filter history data based on search term and subject filter
  const filteredHistory = mockHistoryData.filter((session) => {
    const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === "all" || session.subject.toLowerCase() === subjectFilter.toLowerCase()
    return matchesSearch && matchesSubject
  })

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Grading History</h1>
        <p className="text-muted-foreground">View and manage your past grading sessions</p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle>Past Grading Sessions</CardTitle>
              <CardDescription>Access and manage your previous grading sessions</CardDescription>
            </div>
            <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search sessions..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="social">Social Studies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Avg. Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.name}</TableCell>
                    <TableCell>{session.subject}</TableCell>
                    <TableCell>{new Date(session.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{session.studentsCount}</TableCell>
                    <TableCell className="text-right">{session.averageScore.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/grading/results/${session.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-muted p-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No sessions found</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                No grading sessions match your search criteria.
                {searchTerm || subjectFilter !== "all" ? (
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => {
                      setSearchTerm("")
                      setSubjectFilter("all")
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Link href="/grading" className="text-primary hover:underline">
                    Start a new grading session
                  </Link>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
