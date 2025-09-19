"use client"

import { useState } from "react"
import { Clock, CheckCircle, XCircle, MessageSquare, Calendar, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Textarea } from "../ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { cn } from "../../lib/utils"

export interface AccessRequest {
  id: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  requesterAvatar?: string
  documentId: string
  documentName: string
  requestedPermissions: string[]
  reason: string
  status: "pending" | "approved" | "rejected"
  requestDate: string
  reviewedBy?: string
  reviewedDate?: string
  reviewNotes?: string
}

interface AccessRequestPanelProps {
  requests: AccessRequest[]
  onApproveRequest: (requestId: string, permissions: string[], notes?: string) => void
  onRejectRequest: (requestId: string, reason: string) => void
  canReviewRequests?: boolean
  className?: string
}

// Mock data for demonstration
const mockRequests: AccessRequest[] = [
  {
    id: "req-1",
    requesterId: "user-1",
    requesterName: "Alice Johnson",
    requesterEmail: "alice.johnson@company.com",
    requesterAvatar: "/placeholder.svg",
    documentId: "doc-1",
    documentName: "Q4 Financial Report.pdf",
    requestedPermissions: ["view", "comment"],
    reason: "I need access to review the financial data for my quarterly presentation to the board.",
    status: "pending",
    requestDate: "2024-01-15T10:30:00Z",
  },
  {
    id: "req-2",
    requesterId: "user-2",
    requesterName: "Bob Smith",
    requesterEmail: "bob.smith@company.com",
    documentId: "doc-2",
    documentName: "Marketing Strategy 2024.docx",
    requestedPermissions: ["view", "edit"],
    reason: "I'm joining the marketing team and need to contribute to the strategy document.",
    status: "approved",
    requestDate: "2024-01-14T14:20:00Z",
    reviewedBy: "John Doe",
    reviewedDate: "2024-01-14T16:45:00Z",
    reviewNotes: "Approved as part of team onboarding.",
  },
  {
    id: "req-3",
    requesterId: "user-3",
    requesterName: "Carol Davis",
    requesterEmail: "carol.davis@company.com",
    documentId: "doc-3",
    documentName: "Confidential Project Alpha.pdf",
    requestedPermissions: ["view", "edit", "share"],
    reason: "I need full access to coordinate with external partners.",
    status: "rejected",
    requestDate: "2024-01-13T09:15:00Z",
    reviewedBy: "Jane Smith",
    reviewedDate: "2024-01-13T11:30:00Z",
    reviewNotes: "Access denied due to confidentiality requirements. Please contact project lead directly.",
  },
]

export function AccessRequestPanel({
  requests = mockRequests,
  onApproveRequest,
  onRejectRequest,
  canReviewRequests = false,
  className,
}: AccessRequestPanelProps) {
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)

  const pendingRequests = requests.filter((req) => req.status === "pending")
  const reviewedRequests = requests.filter((req) => req.status !== "pending")

  const getStatusIcon = (status: AccessRequest["status"]) => {
    switch (status) {
      case "pending":
        return Clock
      case "approved":
        return CheckCircle
      case "rejected":
        return XCircle
      default:
        return AlertCircle
    }
  }

  const getStatusColor = (status: AccessRequest["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
      case "approved":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
      case "rejected":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const handleApprove = async (request: AccessRequest) => {
    setIsReviewing(true)
    try {
      await onApproveRequest(request.id, request.requestedPermissions, reviewNotes)
      setSelectedRequest(null)
      setReviewNotes("")
    } catch (error) {
      console.error("Failed to approve request:", error)
    } finally {
      setIsReviewing(false)
    }
  }

  const handleReject = async (request: AccessRequest) => {
    if (!reviewNotes.trim()) {
      return // Require reason for rejection
    }

    setIsReviewing(true)
    try {
      await onRejectRequest(request.id, reviewNotes)
      setSelectedRequest(null)
      setReviewNotes("")
    } catch (error) {
      console.error("Failed to reject request:", error)
    } finally {
      setIsReviewing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Access Requests
              <Badge variant="secondary">{pendingRequests.length}</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Review and respond to access requests for this document</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => {
              const StatusIcon = getStatusIcon(request.status)

              return (
                <Card key={request.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.requesterAvatar || "/placeholder.svg"} alt={request.requesterName} />
                        <AvatarFallback>
                          {request.requesterName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-sm">{request.requesterName}</p>
                          <Badge variant="outline" className={cn("text-xs", getStatusColor(request.status))}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {request.status}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">{request.requesterEmail}</p>

                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Requested permissions:</p>
                          <div className="flex flex-wrap gap-1">
                            {request.requestedPermissions.map((permission) => (
                              <Badge key={permission} variant="secondary" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Reason:</p>
                          <p className="text-sm text-muted-foreground">{request.reason}</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Requested {formatDate(request.requestDate)}
                        </div>
                      </div>

                      {canReviewRequests && (
                        <div className="flex flex-col gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedRequest(request)}>
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review Access Request</DialogTitle>
                                <DialogDescription>
                                  Review and respond to {request.requesterName}'s access request
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage
                                      src={request.requesterAvatar || "/placeholder.svg"}
                                      alt={request.requesterName}
                                    />
                                    <AvatarFallback>
                                      {request.requesterName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{request.requesterName}</p>
                                    <p className="text-sm text-muted-foreground">{request.requesterEmail}</p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm font-medium mb-2">Requested permissions:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {request.requestedPermissions.map((permission) => (
                                      <Badge key={permission} variant="secondary">
                                        {permission}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm font-medium mb-2">Reason:</p>
                                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                                    {request.reason}
                                  </p>
                                </div>

                                <div>
                                  <label className="text-sm font-medium mb-2 block">
                                    Review notes (optional for approval, required for rejection):
                                  </label>
                                  <Textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    placeholder="Add notes about your decision..."
                                    rows={3}
                                  />
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleReject(request)}
                                    disabled={isReviewing || !reviewNotes.trim()}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button onClick={() => handleApprove(request)} disabled={isReviewing}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent Reviewed Requests */}
      {reviewedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Reviews
            </CardTitle>
            <p className="text-sm text-muted-foreground">Previously reviewed access requests</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviewedRequests.slice(0, 5).map((request) => {
              const StatusIcon = getStatusIcon(request.status)

              return (
                <Card
                  key={request.id}
                  className={cn(
                    "border-l-4",
                    request.status === "approved" ? "border-l-green-500" : "border-l-red-500",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.requesterAvatar || "/placeholder.svg"} alt={request.requesterName} />
                        <AvatarFallback className="text-xs">
                          {request.requesterName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{request.requesterName}</p>
                          <Badge variant="outline" className={cn("text-xs", getStatusColor(request.status))}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {request.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {request.requestedPermissions.map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>

                        {request.reviewNotes && (
                          <p className="text-xs text-muted-foreground mb-2">"{request.reviewNotes}"</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Reviewed by {request.reviewedBy}</span>
                          <span>{formatDate(request.reviewedDate!)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {requests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No access requests</h3>
            <p className="text-sm text-muted-foreground">
              Access requests for this document will appear here when users request permissions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
