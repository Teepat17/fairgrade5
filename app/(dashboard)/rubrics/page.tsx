"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUploader } from "@/components/grading/file-uploader"
import { Plus, Edit, Trash2, Copy, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock data for demonstration
const mockRubrics = [
  {
    id: "rubric-1",
    name: "Basic Mathematics Rubric",
    subject: "Math",
    createdAt: "2023-01-15T10:30:00Z",
    content:
      "1. Correct answer (50%)\n2. Proper working/steps (30%)\n3. Mathematical notation (10%)\n4. Clarity and organization (10%)",
  },
  {
    id: "rubric-2",
    name: "Advanced Physics Rubric",
    subject: "Physics",
    createdAt: "2023-02-20T14:15:00Z",
    content:
      "1. Correct solution (40%)\n2. Application of physics principles (25%)\n3. Mathematical working (20%)\n4. Units and dimensions (15%)",
  },
  {
    id: "rubric-3",
    name: "Biology Lab Report Rubric",
    subject: "Biology",
    createdAt: "2023-03-10T09:45:00Z",
    content:
      "1. Hypothesis and methodology (25%)\n2. Data collection and analysis (30%)\n3. Results interpretation (25%)\n4. Scientific communication (20%)",
  },
  {
    id: "rubric-4",
    name: "Chemistry Problem-Solving Rubric",
    subject: "Chemistry",
    createdAt: "2023-04-05T16:20:00Z",
    content:
      "1. Chemical equations and formulas (35%)\n2. Stoichiometric calculations (30%)\n3. Conceptual understanding (25%)\n4. Presentation and clarity (10%)",
  },
  {
    id: "rubric-5",
    name: "Essay Writing Rubric",
    subject: "English",
    createdAt: "2023-05-12T11:30:00Z",
    content:
      "1. Thesis and argument development (30%)\n2. Evidence and supporting details (25%)\n3. Organization and structure (20%)\n4. Grammar and mechanics (15%)\n5. Style and voice (10%)",
  },
  {
    id: "rubric-6",
    name: "Historical Document Analysis",
    subject: "Social",
    createdAt: "2023-06-18T13:45:00Z",
    content:
      "1. Source contextualization (25%)\n2. Comprehension of content (25%)\n3. Analysis of perspective and bias (30%)\n4. Connection to historical concepts (20%)",
  },
]

export default function RubricsPage() {
  const [rubrics, setRubrics] = useState(mockRubrics)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentRubric, setCurrentRubric] = useState<any>(null)
  const [newRubricName, setNewRubricName] = useState("")
  const [newRubricSubject, setNewRubricSubject] = useState("")
  const [newRubricContent, setNewRubricContent] = useState("")
  const [rubricFile, setRubricFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("create")

  const { toast } = useToast()

  const handleCreateRubric = () => {
    if (!newRubricName || !newRubricSubject || !newRubricContent) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to create a rubric",
        variant: "destructive",
      })
      return
    }

    const newRubric = {
      id: `rubric-${Date.now()}`,
      name: newRubricName,
      subject: newRubricSubject,
      createdAt: new Date().toISOString(),
      content: newRubricContent,
    }

    setRubrics([...rubrics, newRubric])
    setNewRubricName("")
    setNewRubricSubject("")
    setNewRubricContent("")
    setIsCreating(false)

    toast({
      title: "Rubric created",
      description: "Your new rubric has been created successfully",
    })
  }

  const handleEditRubric = () => {
    if (!currentRubric || !newRubricName || !newRubricSubject || !newRubricContent) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to update the rubric",
        variant: "destructive",
      })
      return
    }

    const updatedRubrics = rubrics.map((rubric) =>
      rubric.id === currentRubric.id
        ? {
            ...rubric,
            name: newRubricName,
            subject: newRubricSubject,
            content: newRubricContent,
          }
        : rubric,
    )

    setRubrics(updatedRubrics)
    setCurrentRubric(null)
    setNewRubricName("")
    setNewRubricSubject("")
    setNewRubricContent("")
    setIsEditing(false)

    toast({
      title: "Rubric updated",
      description: "Your rubric has been updated successfully",
    })
  }

  const handleDeleteRubric = (id: string) => {
    const updatedRubrics = rubrics.filter((rubric) => rubric.id !== id)
    setRubrics(updatedRubrics)

    toast({
      title: "Rubric deleted",
      description: "The rubric has been deleted successfully",
    })
  }

  const handleDuplicateRubric = (rubric: any) => {
    const duplicatedRubric = {
      ...rubric,
      id: `rubric-${Date.now()}`,
      name: `${rubric.name} (Copy)`,
      createdAt: new Date().toISOString(),
    }

    setRubrics([...rubrics, duplicatedRubric])

    toast({
      title: "Rubric duplicated",
      description: "The rubric has been duplicated successfully",
    })
  }

  const handleRubricFileChange = (files: File[]) => {
    if (files.length > 0) {
      setRubricFile(files[0])
    } else {
      setRubricFile(null)
    }
  }

  const handleUploadRubric = () => {
    if (!rubricFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    // In a real application, you would parse the file here
    // For this demo, we'll just create a placeholder rubric

    const newRubric = {
      id: `rubric-${Date.now()}`,
      name: rubricFile.name.replace(/\.[^/.]+$/, ""),
      subject: "Other",
      createdAt: new Date().toISOString(),
      content: "Uploaded rubric content would be parsed here.",
    }

    setRubrics([...rubrics, newRubric])
    setRubricFile(null)
    setActiveTab("create")

    toast({
      title: "Rubric uploaded",
      description: "Your rubric has been uploaded successfully",
    })
  }

  const openEditDialog = (rubric: any) => {
    setCurrentRubric(rubric)
    setNewRubricName(rubric.name)
    setNewRubricSubject(rubric.subject)
    setNewRubricContent(rubric.content)
    setIsEditing(true)
  }

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rubrics</h1>
            <p className="text-muted-foreground">Create and manage your grading rubrics</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Rubric
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rubrics.map((rubric) => (
          <Card key={rubric.id}>
            <CardHeader className="pb-3">
              <CardTitle>{rubric.name}</CardTitle>
              <CardDescription>
                {rubric.subject} • {new Date(rubric.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-40 overflow-auto rounded-md bg-muted p-3">
                <pre className="text-xs">{rubric.content}</pre>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => openEditDialog(rubric)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleDuplicateRubric(rubric)}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Duplicate</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteRubric(rubric.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create Rubric Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Rubric</DialogTitle>
            <DialogDescription>Create a new grading rubric for your exams</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Manually</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rubric Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Advanced Physics Problem-Solving Rubric"
                  value={newRubricName}
                  onChange={(e) => setNewRubricName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={newRubricSubject} onValueChange={setNewRubricSubject}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Math">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Social">Social Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Rubric Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your rubric criteria here..."
                  className="min-h-[200px]"
                  value={newRubricContent}
                  onChange={(e) => setNewRubricContent(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Format each criterion on a new line, with optional percentage weights.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Upload Rubric File</Label>
                <FileUploader
                  accept=".pdf,.docx,.txt"
                  multiple={false}
                  onChange={handleRubricFileChange}
                  maxFiles={1}
                />
                <p className="text-xs text-muted-foreground">
                  Upload a PDF, Word document, or text file containing your rubric.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button
              onClick={activeTab === "create" ? handleCreateRubric : handleUploadRubric}
              disabled={activeTab === "create" ? !newRubricName || !newRubricSubject || !newRubricContent : !rubricFile}
            >
              Create Rubric
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rubric Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Rubric</DialogTitle>
            <DialogDescription>Make changes to your existing rubric</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Rubric Name</Label>
              <Input id="edit-name" value={newRubricName} onChange={(e) => setNewRubricName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subject">Subject</Label>
              <Select value={newRubricSubject} onValueChange={setNewRubricSubject}>
                <SelectTrigger id="edit-subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Math">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Social">Social Studies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Rubric Content</Label>
              <Textarea
                id="edit-content"
                className="min-h-[200px]"
                value={newRubricContent}
                onChange={(e) => setNewRubricContent(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRubric}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
