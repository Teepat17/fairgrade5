"use client"

import { useState } from "react"
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

interface RubricSelectorProps {
  subject: string
}

export function RubricSelector({ subject }: RubricSelectorProps) {
  const [selectedRubric, setSelectedRubric] = useState<string | null>(null)
  const [customizedRubric, setCustomizedRubric] = useState<string>("")
  const [isCustomizing, setIsCustomizing] = useState(false)

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
      <RadioGroup value={selectedRubric || ""} onValueChange={setSelectedRubric}>
        {rubricTemplates.map((rubric) => (
          <div key={rubric.id} className="flex items-start space-x-2">
            <RadioGroupItem value={rubric.id} id={`rubric-${rubric.id}`} />
            <div className="grid gap-1">
              <Label htmlFor={`rubric-${rubric.id}`} className="font-medium">
                {rubric.name}
              </Label>
              <p className="text-sm text-muted-foreground">{rubric.description}</p>
            </div>
          </div>
        ))}
      </RadioGroup>

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
