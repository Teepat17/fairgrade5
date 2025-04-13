"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Download, Trash2, Search, FileText } from "lucide-react"
import { getAllGradingSessions, deleteGradingSession } from "@/lib/storage"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { StudentPreview } from "@/components/grading/student-preview"

interface GradingSession {
  id: string
  userId: string
  subject: string
  sessionName: string
  studentFiles: string[]
  results: Array<{
    id: string
    name: string
    score: number
    feedback: string
    criteria: Array<{
      name: string
      score: number
      maxScore: number
      feedback: string
    }>
  }>
  createdAt: string
}

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [sessions, setSessions] = useState<GradingSession[]>([])
  const [previewSession, setPreviewSession] = useState<GradingSession | null>(null)
  const [previewFiles, setPreviewFiles] = useState<File[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const { toast } = useToast()
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }
    if (user) {
      loadSessions()
    }
  }, [user, loading])

  const loadSessions = async () => {
    if (!user) return
    
    try {
      const allSessions = await getAllGradingSessions(user.id)
      setSessions(allSessions)
    } catch (error) {
      console.error("Error loading sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load grading sessions",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return

    try {
      await deleteGradingSession(id, user.id)
      toast({
        title: "Success",
        description: "Grading session deleted successfully",
      })
      loadSessions() // Reload the sessions
    } catch (error) {
      console.error("Error deleting session:", error)
      toast({
        title: "Error",
        description: "Failed to delete grading session",
        variant: "destructive",
      })
    }
  }

  const handlePreview = async (session: GradingSession) => {
    try {
      // Convert base64 strings to File objects
      const files = await Promise.all(
        session.studentFiles.map(async (base64, index) => {
          // Extract the file extension from the base64 string or use a default
          const fileExtension = base64.includes('data:image/jpeg') ? 'jpg' : 
                               base64.includes('data:image/png') ? 'png' : 'pdf';
          
          // Create a blob from the base64 string
          const byteString = atob(base64.split(',')[1]);
          const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          
          const blob = new Blob([ab], { type: mimeString });
          
          // Create a File object
          return new File([blob], `student_answer_${index + 1}.${fileExtension}`, { type: mimeString });
        })
      );
      
      setPreviewFiles(files);
      setPreviewSession(session);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error preparing preview:", error);
      toast({
        title: "Error",
        description: "Failed to load preview",
        variant: "destructive",
      });
    }
  };

  // Filter sessions based on search term and subject filter
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.sessionName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === "all" || session.subject.toLowerCase() === subjectFilter.toLowerCase()
    return matchesSearch && matchesSubject
  })

  const calculateAverageScore = (session: GradingSession) => {
    if (!session.results || session.results.length === 0) return 0
    const totalScore = session.results.reduce((sum, result) => sum + result.score, 0)
    return totalScore / session.results.length
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

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
          {filteredSessions.length > 0 ? (
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
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.sessionName}</TableCell>
                    <TableCell>{session.subject}</TableCell>
                    <TableCell>{new Date(session.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{session.results?.length || 0}</TableCell>
                    <TableCell className="text-right">{calculateAverageScore(session).toFixed(1)}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/grading/results/${session.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handlePreview(session)}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(session.id)}>
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
                {sessions.length === 0 ? (
                  <>
                    You haven't created any grading sessions yet.{" "}
                    <Link href="/grading" className="text-primary hover:underline">
                      Start a new grading session
                    </Link>
                  </>
                ) : (
                  <>
                    No grading sessions match your search criteria.{" "}
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
                  </>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Preview Dialog */}
      {previewSession && (
        <StudentPreview
          files={previewFiles}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          gradingResults={previewSession.results}
          showResults={true}
        />
      )}
    </div>
  )
}
