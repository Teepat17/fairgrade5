"use client"

import { useEffect, useState } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Copy, Download, Search, GripVertical, X } from "lucide-react"
import { toast } from "sonner"
import { Rubric, RubricCriterion, saveRubric, getAllRubrics, deleteRubric, initializeDefaultRubrics } from "@/lib/storage"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

const SUBJECTS = [
  { value: "Math", label: "Mathematics" },
  { value: "Physics", label: "Physics" },
  { value: "English", label: "English" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Biology", label: "Biology" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Other", label: "Other" }
]

export default function RubricsPage() {
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const [editingRubric, setEditingRubric] = useState<Rubric | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [criteria, setCriteria] = useState<RubricCriterion[]>([])

  useEffect(() => {
    const loadRubrics = async () => {
      await initializeDefaultRubrics()
      const loadedRubrics = await getAllRubrics()
      setRubrics(loadedRubrics)
    }
    loadRubrics()
  }, [])

  useEffect(() => {
    if (editingRubric) {
      setCriteria(editingRubric.criteria || [])
    } else {
      setCriteria([])
    }
  }, [editingRubric])

  const filteredRubrics = rubrics.filter(rubric => {
    const matchesSearch = rubric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rubric.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || rubric.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  const handleSaveRubric = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const subject = formData.get("subject") as string

    if (!name || !subject || criteria.length === 0) {
      toast.error("Please fill in all fields and add at least one criterion")
      return
    }

    // Validate total weight is 100%
    const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0)
    if (totalWeight !== 100) {
      toast.error("Total weight must equal 100%")
      return
    }

    const rubric: Rubric = {
      id: editingRubric?.id || `rubric-${Date.now()}`,
      name,
      subject,
      criteria,
      content: "", // This will be generated in the storage function
      createdAt: editingRubric?.createdAt || new Date().toISOString(),
      isTemplate: false
    }

    try {
      await saveRubric(rubric)
      const updatedRubrics = await getAllRubrics()
      setRubrics(updatedRubrics)
      setIsDialogOpen(false)
      toast.success(editingRubric ? "Rubric updated successfully" : "Rubric created successfully")
      setEditingRubric(null)
      setCriteria([])
    } catch (error) {
      toast.error("Failed to save rubric")
      console.error(error)
    }
  }

  const handleDeleteRubric = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rubric?")) return
    
    try {
      await deleteRubric(id)
      const updatedRubrics = await getAllRubrics()
      setRubrics(updatedRubrics)
      toast.success("Rubric deleted successfully")
    } catch (error) {
      toast.error("Failed to delete rubric")
      console.error(error)
    }
  }

  const handleDuplicateRubric = async (rubric: Rubric) => {
    const duplicatedRubric: Rubric = {
      ...rubric,
      id: `rubric-${Date.now()}`,
      name: `${rubric.name} (Copy)`,
      createdAt: new Date().toISOString(),
      isTemplate: false
    }

    try {
      await saveRubric(duplicatedRubric)
      const updatedRubrics = await getAllRubrics()
      setRubrics(updatedRubrics)
      toast.success("Rubric duplicated successfully")
    } catch (error) {
      toast.error("Failed to duplicate rubric")
      console.error(error)
    }
  }

  const handleAddCriterion = () => {
    setCriteria([
      ...criteria,
      {
        id: `criterion-${Date.now()}`,
        description: "",
        weight: 0
      }
    ])
  }

  const handleUpdateCriterion = (index: number, field: keyof RubricCriterion, value: string | number) => {
    const newCriteria = [...criteria]
    newCriteria[index] = {
      ...newCriteria[index],
      [field]: field === 'weight' ? Number(value) : value
    }
    setCriteria(newCriteria)
  }

  const handleDeleteCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const items = Array.from(criteria)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    setCriteria(items)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Rubrics</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingRubric(null)} className="flex items-center gap-2">
                <Plus size={20} />
                Create New Rubric
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingRubric ? "Edit Rubric" : "Create New Rubric"}
                </DialogTitle>
                <DialogDescription>
                  {editingRubric 
                    ? "Make changes to your rubric here. Click save when you're done."
                    : "Create a new rubric by filling out the information below."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveRubric} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingRubric?.name}
                      placeholder="Enter a descriptive name"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                    <Select name="subject" defaultValue={editingRubric?.subject || ""} required>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map(subject => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Criteria</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddCriterion}>
                      <Plus size={16} className="mr-1" /> Add Criterion
                    </Button>
                  </div>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="criteria">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {criteria.map((criterion, index) => (
                            <Draggable
                              key={criterion.id}
                              draggableId={criterion.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border"
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical size={20} className="text-gray-400" />
                                  </div>
                                  <Input
                                    value={criterion.description}
                                    onChange={(e) => handleUpdateCriterion(index, 'description', e.target.value)}
                                    placeholder="Enter criterion description"
                                    className="flex-1"
                                  />
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={criterion.weight}
                                      onChange={(e) => handleUpdateCriterion(index, 'weight', e.target.value)}
                                      className="w-20 text-right"
                                      min="0"
                                      max="100"
                                    />
                                    <span className="text-sm text-gray-500">%</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCriterion(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  <div className="mt-2 text-sm text-gray-500 flex justify-between">
                    <span>Drag to reorder criteria</span>
                    <span>
                      Total: {criteria.reduce((sum, criterion) => sum + criterion.weight, 0)}%
                    </span>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Rubric</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search rubrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {SUBJECTS.map(subject => (
                <SelectItem key={subject.value} value={subject.value}>
                  {subject.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRubrics.map((rubric) => (
            <Card key={rubric.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{rubric.name}</CardTitle>
                    <CardDescription>{rubric.subject}</CardDescription>
                  </div>
                  {rubric.isTemplate && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                      Template
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border">
                  {rubric.content}
                </pre>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                {!rubric.isTemplate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingRubric(rubric)
                      setIsDialogOpen(true)
                    }}
                    className="flex items-center gap-1"
                  >
                    <Edit size={16} />
                    Edit
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicateRubric(rubric)}
                  className="flex items-center gap-1"
                >
                  <Copy size={16} />
                  Duplicate
                </Button>
                {!rubric.isTemplate && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRubric(rubric.id)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
