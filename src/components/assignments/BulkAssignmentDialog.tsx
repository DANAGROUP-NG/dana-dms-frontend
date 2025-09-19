"use client"

import { useState } from "react"
import { Users, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Checkbox } from "../ui/checkbox"
import type { Assignment } from "../../types/workflow"

interface BulkAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documents: { id: string; name: string; type: string }[]
  users: { id: string; name: string; email: string; avatar?: string }[]
  onCreateAssignments: (assignments: Partial<Assignment>[]) => void
}

export function BulkAssignmentDialog({
  open,
  onOpenChange,
  documents,
  users,
  onCreateAssignments,
}: BulkAssignmentDialogProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
    priority: "normal" as Assignment["priority"],
    type: "review" as Assignment["type"],
    dueDate: "",
  })

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId) ? prev.filter((id) => id !== documentId) : [...prev, documentId],
    )
  }

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleCreateBulkAssignments = () => {
    if (!assignmentData.title || selectedDocuments.length === 0 || selectedUsers.length === 0) {
      return
    }

    const assignments: Partial<Assignment>[] = []

    selectedDocuments.forEach((documentId) => {
      const document = documents.find((d) => d.id === documentId)
      selectedUsers.forEach((userId) => {
        const user = users.find((u) => u.id === userId)
        if (document && user) {
          assignments.push({
            id: `assignment-${Date.now()}-${documentId}-${userId}`,
            documentId,
            documentName: document.name,
            title: assignmentData.title,
            description: assignmentData.description,
            assigneeId: userId,
            assigneeName: user.name,
            assigneeEmail: user.email,
            assigneeAvatar: user.avatar,
            assignedBy: "Current User",
            assignedDate: new Date().toISOString(),
            dueDate: assignmentData.dueDate || undefined,
            priority: assignmentData.priority,
            status: "pending",
            type: assignmentData.type,
            tags: [],
          })
        }
      })
    })

    onCreateAssignments(assignments)

    // Reset form
    setSelectedDocuments([])
    setSelectedUsers([])
    setAssignmentData({
      title: "",
      description: "",
      priority: "normal",
      type: "review",
      dueDate: "",
    })
    onOpenChange(false)
  }

  const totalAssignments = selectedDocuments.length * selectedUsers.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Assignment Creation
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Create multiple assignments across documents and users</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bulk-title">Title</Label>
                <Input
                  id="bulk-title"
                  value={assignmentData.title}
                  onChange={(e) => setAssignmentData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter assignment title..."
                />
              </div>

              <div>
                <Label htmlFor="bulk-description">Description</Label>
                <Textarea
                  id="bulk-description"
                  value={assignmentData.description}
                  onChange={(e) => setAssignmentData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what needs to be done..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bulk-priority">Priority</Label>
                  <Select
                    value={assignmentData.priority}
                    onValueChange={(value) => setAssignmentData((prev) => ({ ...prev, priority: value as any }))}
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

                <div>
                  <Label htmlFor="bulk-type">Type</Label>
                  <Select
                    value={assignmentData.type}
                    onValueChange={(value) => setAssignmentData((prev) => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="approval">Approval</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                      <SelectItem value="comment">Comment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bulk-due-date">Due Date</Label>
                  <Input
                    id="bulk-due-date"
                    type="datetime-local"
                    value={assignmentData.dueDate}
                    onChange={(e) => setAssignmentData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Documents</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose documents to assign ({selectedDocuments.length} selected)
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {documents.map((document) => (
                    <div key={document.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`doc-${document.id}`}
                        checked={selectedDocuments.includes(document.id)}
                        onCheckedChange={() => handleDocumentToggle(document.id)}
                      />
                      <label
                        htmlFor={`doc-${document.id}`}
                        className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="truncate">{document.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {document.type}
                          </Badge>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setSelectedDocuments(documents.map((d) => d.id))}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedDocuments([])}>
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Users</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose users to assign to ({selectedUsers.length} selected)
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                      />
                      <label
                        htmlFor={`user-${user.id}`}
                        className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback className="text-xs">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{user.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setSelectedUsers(users.map((u) => u.id))}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedUsers([])}>
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          {totalAssignments > 0 && (
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Ready to create {totalAssignments} assignment{totalAssignments !== 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDocuments.length} document{selectedDocuments.length !== 1 ? "s" : ""} ×{" "}
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Validation Warnings */}
          {(!assignmentData.title || selectedDocuments.length === 0 || selectedUsers.length === 0) && (
            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Missing required information</span>
                </div>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  {!assignmentData.title && <li>• Assignment title is required</li>}
                  {selectedDocuments.length === 0 && <li>• Select at least one document</li>}
                  {selectedUsers.length === 0 && <li>• Select at least one user</li>}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateBulkAssignments}
            disabled={!assignmentData.title || selectedDocuments.length === 0 || selectedUsers.length === 0}
          >
            Create {totalAssignments} Assignment{totalAssignments !== 1 ? "s" : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
