"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"

interface RubricSelectorProps {
  subject: string
  onRubricChange: (rubric: string) => void
}

interface RubricCriterion {
  name: string
  weight: number
}

export function RubricSelector({ subject, onRubricChange }: RubricSelectorProps) {
  const [selectedRubric, setSelectedRubric] = useState<string | null>(null)
  const [customizedRubric, setCustomizedRubric] = useState<string>("")
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [criteria, setCriteria] = useState<RubricCriterion[]>([])
  const [isEditing, setIsEditing] = useState(false)

  // Initialize with default criteria based on subject
  useEffect(() => {
    const defaultCriteria = getDefaultCriteria(subject)
    setCriteria(defaultCriteria)
    updateRubricText(defaultCriteria)
  }, [subject])

  const getDefaultCriteria = (subject: string): RubricCriterion[] => {
    switch (subject.toLowerCase()) {
      case 'english':
        return [
          { name: 'Evidence and supporting details', weight: 25 },
          { name: 'Organization and structure', weight: 50 },
          { name: 'Grammar and mechanics', weight: 25 }
        ]
      case 'math':
        return [
          { name: 'Problem solving approach', weight: 35 },
          { name: 'Calculations accuracy', weight: 30 },
          { name: 'Show working steps', weight: 25 },
          { name: 'Final answer presentation', weight: 10 }
        ]
      // Add more subjects as needed
      default:
        return [
          { name: 'Content understanding', weight: 40 },
          { name: 'Analysis and reasoning', weight: 30 },
          { name: 'Organization', weight: 20 },
          { name: 'Presentation', weight: 10 }
        ]
    }
  }

  const updateRubricText = (currentCriteria: RubricCriterion[]) => {
    const rubricText = currentCriteria
      .map(criterion => `${criterion.name} (${criterion.weight}%)`)
      .join('\n')
    onRubricChange(rubricText)
  }

  const handleWeightChange = (index: number, newWeight: number) => {
    const newCriteria = [...criteria]
    newCriteria[index].weight = Math.min(100, Math.max(0, newWeight))
    setCriteria(newCriteria)
  }

  const handleNameChange = (index: number, newName: string) => {
    const newCriteria = [...criteria]
    newCriteria[index].name = newName
    setCriteria(newCriteria)
  }

  const handleSave = () => {
    // Validate total weight is 100%
    const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0)
    if (totalWeight !== 100) {
      alert('Total weight must equal 100%')
      return
    }
    
    updateRubricText(criteria)
    setIsEditing(false)
  }

  const addCriterion = () => {
    setCriteria([...criteria, { name: 'New criterion', weight: 0 }])
  }

  const removeCriterion = (index: number) => {
    const newCriteria = criteria.filter((_, i) => i !== index)
    setCriteria(newCriteria)
  }

  // Mock rubric templates based on subject
  const getRubricTemplates = (subject: string) => {
    switch (subject) {
      case "math":
        return [
          {
            id: "math-basic",
            name: "Basic Mathematics Rubric",
            description: "For general mathematics exams with problem-solving focus",
            content:
              "1. Correct answer (50%)\n2. Proper working/steps (30%)\n3. Mathematical notation (10%)\n4. Clarity and organization (10%)",
          },
          {
            id: "math-advanced",
            name: "Advanced Mathematics Rubric",
            description: "For advanced mathematics with proofs and complex problem-solving",
            content:
              "1. Correct solution/proof (40%)\n2. Mathematical reasoning (30%)\n3. Proper notation and terminology (15%)\n4. Organization and clarity (15%)",
          },
        ]
      case "physics":
        return [
          {
            id: "physics-basic",
            name: "Basic Physics Rubric",
            description: "For general physics exams with calculations and explanations",
            content:
              "1. Correct answer with units (40%)\n2. Proper application of formulas (25%)\n3. Physical reasoning and explanations (25%)\n4. Diagrams and visual representations (10%)",
          },
          {
            id: "physics-lab",
            name: "Physics Lab Report Rubric",
            description: "For physics lab reports and experimental analysis",
            content:
              "1. Experimental procedure (20%)\n2. Data collection and analysis (30%)\n3. Results and calculations (30%)\n4. Discussion and conclusion (20%)",
          },
        ]
      case "biology":
        return [
          {
            id: "biology-basic",
            name: "General Biology Rubric",
            description: "For general biology exams with concepts and explanations",
            content:
              "1. Factual accuracy (40%)\n2. Use of biological terminology (20%)\n3. Depth of explanation (30%)\n4. Organization and clarity (10%)",
          },
          {
            id: "biology-advanced",
            name: "Advanced Biology Rubric",
            description: "For advanced biology with detailed analysis",
            content:
              "1. Scientific accuracy (35%)\n2. Depth of analysis (25%)\n3. Application of concepts (25%)\n4. Scientific communication (15%)",
          },
        ]
      case "chemistry":
        return [
          {
            id: "chemistry-basic",
            name: "Basic Chemistry Rubric",
            description: "For general chemistry exams with calculations and concepts",
            content:
              "1. Correct answers with units (40%)\n2. Chemical equations and formulas (25%)\n3. Conceptual understanding (25%)\n4. Organization and presentation (10%)",
          },
          {
            id: "chemistry-advanced",
            name: "Advanced Chemistry Rubric",
            description: "For advanced chemistry with detailed analysis",
            content:
              "1. Chemical accuracy (35%)\n2. Problem-solving approach (25%)\n3. Application of chemical principles (25%)\n4. Scientific communication (15%)",
          },
        ]
      case "english":
        return [
          {
            id: "english-essay",
            name: "Essay Writing Rubric",
            description: "For evaluating essays and written compositions",
            content:
              "1. Thesis and argument development (30%)\n2. Evidence and supporting details (25%)\n3. Organization and structure (20%)\n4. Grammar and mechanics (15%)\n5. Style and voice (10%)",
          },
          {
            id: "english-literature",
            name: "Literature Analysis Rubric",
            description: "For literary analysis and text interpretation",
            content:
              "1. Textual understanding (25%)\n2. Analysis of literary elements (30%)\n3. Use of evidence from text (25%)\n4. Writing clarity and organization (20%)",
          },
        ]
      case "social":
        return [
          {
            id: "social-essay",
            name: "Social Studies Essay Rubric",
            description: "For evaluating social studies essays and arguments",
            content:
              "1. Historical/social understanding (30%)\n2. Use of evidence and examples (25%)\n3. Analysis and critical thinking (25%)\n4. Organization and clarity (20%)",
          },
          {
            id: "social-document",
            name: "Document Analysis Rubric",
            description: "For primary and secondary source analysis",
            content:
              "1. Source contextualization (25%)\n2. Comprehension of content (25%)\n3. Analysis of perspective and bias (30%)\n4. Connection to historical/social concepts (20%)",
          },
        ]
      default:
        return []
    }
  }

  const rubricTemplates = getRubricTemplates(subject)
  const selectedRubricTemplate = rubricTemplates.find((r) => r.id === selectedRubric)

  const handleCustomizeRubric = () => {
    if (selectedRubricTemplate) {
      setCustomizedRubric(selectedRubricTemplate.content)
      setIsCustomizing(true)
    }
  }

  const handleSaveCustomization = () => {
    setIsCustomizing(false)
  }

  return (
    <div className="space-y-4">
      {!isEditing ? (
        <div className="space-y-4">
          {criteria.map((criterion, index) => (
            <div key={index} className="flex justify-between items-center">
              <span>{criterion.name}</span>
              <span className="font-medium">{criterion.weight}%</span>
            </div>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setIsEditing(true)}
          >
            Edit Criteria
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {criteria.map((criterion, index) => (
            <div key={index} className="grid gap-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label>Criterion Name</Label>
                  <Input
                    value={criterion.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder="Enter criterion name"
                  />
                </div>
                <div className="w-24">
                  <Label>Weight (%)</Label>
                  <Input
                    type="number"
                    value={criterion.weight}
                    onChange={(e) => handleWeightChange(index, parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  className="mt-6"
                  onClick={() => removeCriterion(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={addCriterion}
            >
              Add Criterion
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {selectedRubricTemplate && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Rubric Preview</h4>
              <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleCustomizeRubric}>
                    <Pencil className="h-3 w-3 mr-1" />
                    Customize
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Customize Rubric</DialogTitle>
                    <DialogDescription>Modify the rubric to fit your specific grading needs</DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={customizedRubric}
                    onChange={(e) => setCustomizedRubric(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <DialogFooter>
                    <Button onClick={handleSaveCustomization}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-md bg-muted p-3">
              <pre className="text-sm whitespace-pre-wrap">
                {isCustomizing ? customizedRubric : selectedRubricTemplate.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
