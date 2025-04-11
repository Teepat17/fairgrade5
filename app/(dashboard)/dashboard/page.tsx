"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, History, BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Manage and grade your student exams with AI assistance</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Start Grading</span>
            </CardTitle>
            <CardDescription>Upload student exams and grade them with AI</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Upload student answer PDFs and select a rubric to start the AI-powered grading process.
            </p>
            <Button asChild className="w-full">
              <Link href="/grading">
                Start Grading
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <span>Grading History</span>
            </CardTitle>
            <CardDescription>View your past grading sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">Access your previous grading sessions, review results, and download reports.</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/history">
                View History
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Manage Rubrics</span>
            </CardTitle>
            <CardDescription>Create and manage grading rubrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Create, edit, and manage your grading rubrics for different subjects and exam types.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/rubrics">
                Manage Rubrics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Grading Sessions</CardTitle>
            <CardDescription>Your most recent exam grading sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="font-medium">No recent grading sessions</div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/history">View all</Link>
                </Button>
              </div>
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t graded any exams yet. Start by creating a new grading session.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/grading">
                    Start Grading
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
