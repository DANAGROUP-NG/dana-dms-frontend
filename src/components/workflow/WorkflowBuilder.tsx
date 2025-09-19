"use client"

import { useState, useCallback, useRef } from "react"
import { Plus, Save, Play, RotateCcw, Users, Clock, CheckCircle, GitBranch, Bell, Zap } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { cn } from "../../lib/utils"
import type { WorkflowStep, WorkflowTemplate, WorkflowInstance } from "../../types/workflow"

interface WorkflowBuilderProps {
  workflow?: WorkflowInstance
  templates?: WorkflowTemplate[]
  onSave: (workflow: Partial<WorkflowInstance>) => void
  onPublish: (workflow: WorkflowInstance) => void
  className?: string
}

const stepTypes = [
  {
    id: "approval",
    name: "Approval",
    icon: CheckCircle,
    color: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
    description: "Requires approval from assigned user",
  },
  {
    id: "review",
    name: "Review",
    icon: Users,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
    description: "Review and provide feedback",
  },
  {
    id: "notification",
    name: "Notification",
    icon: Bell,
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300",
    description: "Send notification to users",
  },
  {
    id: "condition",
    name: "Condition",
    icon: GitBranch,
    color: "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300",
    description: "Conditional logic based on document properties",
  },
]

const mockUsers = [
  { id: "1", name: "Sarah Johnson", email: "sarah@company.com", role: "Manager" },
  { id: "2", name: "Mike Chen", email: "mike@company.com", role: "Legal" },
  { id: "3", name: "Emily Davis", email: "emily@company.com", role: "HR" },
  { id: "4", name: "John Smith", email: "john@company.com", role: "Finance" },
]

export function WorkflowBuilder({ workflow, templates = [], onSave, onPublish, className }: WorkflowBuilderProps) {
  const [currentWorkflow, setCurrentWorkflow] = useState<Partial<WorkflowInstance>>(
    workflow || {
      name: "",
      steps: [],
      status: "draft",
      priority: "normal",
      metadata: {},
    },
  )
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null)
  const [draggedStep, setDraggedStep] = useState<string | null>(null)
  const [showStepDialog, setShowStepDialog] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const addStep = useCallback(
    (type: WorkflowStep["type"]) => {
      const newStep: WorkflowStep = {
        id: `step-${Date.now()}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Step`,
        type,
        assigneeType: "user",
        assigneeId: "",
        assigneeName: "",
        status: "pending",
        order: (currentWorkflow.steps?.length || 0) + 1,
        position: { x: 100 + (currentWorkflow.steps?.length || 0) * 200, y: 100 },
      }

      setCurrentWorkflow((prev) => ({
        ...prev,
        steps: [...(prev.steps || []), newStep],
      }))
      setSelectedStep(newStep)
      setShowStepDialog(true)
    },
    [currentWorkflow.steps],
  )

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setCurrentWorkflow((prev) => ({
      ...prev,
      steps: prev.steps?.map((step) => (step.id === stepId ? { ...step, ...updates } : step)) || [],
    }))
  }, [])

  const deleteStep = useCallback((stepId: string) => {
    setCurrentWorkflow((prev) => ({
      ...prev,
      steps: prev.steps?.filter((step) => step.id !== stepId) || [],
    }))
    setSelectedStep(null)
  }, [])

  const handleStepDrag = useCallback(
    (stepId: string, position: { x: number; y: number }) => {
      updateStep(stepId, { position })
    },
    [updateStep],
  )

  const getStepIcon = (type: WorkflowStep["type"]) => {
    const stepType = stepTypes.find((t) => t.id === type)
    return stepType?.icon || CheckCircle
  }

  const getStepColor = (type: WorkflowStep["type"]) => {
    const stepType = stepTypes.find((t) => t.id === type)
    return stepType?.color || "text-gray-600 bg-gray-100"
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Workflow Builder
              </CardTitle>
              <p className="text-sm text-muted-foreground">Design approval workflows with drag-and-drop steps</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onSave(currentWorkflow)}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => onPublish(currentWorkflow as WorkflowInstance)}
                disabled={!currentWorkflow.name || !currentWorkflow.steps?.length}
              >
                <Play className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={currentWorkflow.name || ""}
                onChange={(e) => setCurrentWorkflow((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name..."
              />
            </div>
            <div>
              <Label htmlFor="workflow-priority">Priority</Label>
              <Select
                value={currentWorkflow.priority || "normal"}
                onValueChange={(value) => setCurrentWorkflow((prev) => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Step Palette */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Step Types</CardTitle>
            <p className="text-sm text-muted-foreground">Drag to add steps</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {stepTypes.map((stepType) => {
              const StepIcon = stepType.icon
              return (
                <Card
                  key={stepType.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addStep(stepType.id as WorkflowStep["type"])}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-full", stepType.color)}>
                        <StepIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{stepType.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{stepType.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>

        {/* Workflow Canvas */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Workflow Canvas</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentWorkflow.steps?.length || 0} steps</Badge>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              ref={canvasRef}
              className="relative min-h-[400px] bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20 overflow-auto"
            >
              {currentWorkflow.steps?.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Start Building</h3>
                    <p className="text-sm text-muted-foreground">Add workflow steps from the palette to get started</p>
                  </div>
                </div>
              ) : (
                <div className="relative p-4">
                  {/* Workflow Steps */}
                  {currentWorkflow.steps?.map((step, index) => {
                    const StepIcon = getStepIcon(step.type)
                    const isSelected = selectedStep?.id === step.id

                    return (
                      <div key={step.id}>
                        {/* Connection Line */}
                        {index > 0 && (
                          <div
                            className="absolute h-px bg-border"
                            style={{
                              left: currentWorkflow.steps![index - 1].position.x + 120,
                              top: currentWorkflow.steps![index - 1].position.y + 40,
                              width: step.position.x - currentWorkflow.steps![index - 1].position.x - 120,
                            }}
                          />
                        )}

                        {/* Step Card */}
                        <Card
                          className={cn(
                            "absolute w-48 cursor-pointer transition-all duration-200",
                            isSelected && "ring-2 ring-primary shadow-lg",
                            "hover:shadow-md",
                          )}
                          style={{
                            left: step.position.x,
                            top: step.position.y,
                          }}
                          onClick={() => {
                            setSelectedStep(step)
                            setShowStepDialog(true)
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={cn("p-2 rounded-full", getStepColor(step.type))}>
                                <StepIcon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">{step.name}</h3>
                                <p className="text-xs text-muted-foreground capitalize">{step.type}</p>
                              </div>
                            </div>

                            {step.assigneeName && (
                              <div className="text-xs text-muted-foreground mb-2">Assigned to: {step.assigneeName}</div>
                            )}

                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                Step {step.order}
                              </Badge>
                              {step.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {new Date(step.dueDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step Configuration Dialog */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedStep ? `Configure ${selectedStep.name}` : "Configure Step"}</DialogTitle>
          </DialogHeader>

          {selectedStep && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="assignment">Assignment</TabsTrigger>
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="step-name">Step Name</Label>
                  <Input
                    id="step-name"
                    value={selectedStep.name}
                    onChange={(e) => updateStep(selectedStep.id, { name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="step-description">Description</Label>
                  <Textarea
                    id="step-description"
                    value={selectedStep.description || ""}
                    onChange={(e) => updateStep(selectedStep.id, { description: e.target.value })}
                    placeholder="Describe what this step does..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="due-days">Due in (days)</Label>
                    <Input
                      id="due-days"
                      type="number"
                      value={selectedStep.dueDays || ""}
                      onChange={(e) =>
                        updateStep(selectedStep.id, { dueDays: Number.parseInt(e.target.value) || undefined })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="escalation-days">Escalate after (days)</Label>
                    <Input
                      id="escalation-days"
                      type="number"
                      value={selectedStep.escalationDays || ""}
                      onChange={(e) =>
                        updateStep(selectedStep.id, { escalationDays: Number.parseInt(e.target.value) || undefined })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assignment" className="space-y-4">
                <div>
                  <Label htmlFor="assignee-type">Assign to</Label>
                  <Select
                    value={selectedStep.assigneeType}
                    onValueChange={(value) => updateStep(selectedStep.id, { assigneeType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Specific User</SelectItem>
                      <SelectItem value="role">Role</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedStep.assigneeType === "user" && (
                  <div>
                    <Label htmlFor="assignee">User</Label>
                    <Select
                      value={selectedStep.assigneeId}
                      onValueChange={(value) => {
                        const user = mockUsers.find((u) => u.id === value)
                        updateStep(selectedStep.id, {
                          assigneeId: value,
                          assigneeName: user?.name || "",
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="conditions" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Add conditions to control when this step should execute based on document properties.
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="destructive" onClick={() => selectedStep && deleteStep(selectedStep.id)}>
              Delete Step
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowStepDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowStepDialog(false)}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
