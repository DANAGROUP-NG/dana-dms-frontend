"use client"

import { useState } from "react"
import { MessageSquare, Reply, MoreHorizontal, ThumbsUp, Edit, Trash, AtSign, Paperclip, Send } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Textarea } from "../ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { cn } from "../../lib/utils"
import type { Comment } from "../../types/workflow"

interface CommentThreadProps {
  comments?: Comment[]
  documentId?: string
  workflowId?: string
  assignmentId?: string
  currentUserId?: string
  onAddComment: (comment: Partial<Comment>) => void
  onUpdateComment: (id: string, updates: Partial<Comment>) => void
  onDeleteComment: (id: string) => void
  onResolveComment: (id: string) => void
  className?: string
}

const mockComments: Comment[] = [
  {
    id: "1",
    documentId: "doc-1",
    content:
      "I've reviewed the financial data and found a few discrepancies in the Q3 numbers. @sarah.johnson could you please double-check the revenue calculations?",
    authorId: "user-1",
    authorName: "Mike Chen",
    authorAvatar: "/placeholder.svg?height=32&width=32",
    createdDate: "2024-01-16T10:30:00Z",
    mentions: ["sarah.johnson"],
    reactions: [
      { emoji: "👍", users: ["user-2", "user-3"] },
      { emoji: "❤️", users: ["user-2"] },
    ],
    isResolved: false,
  },
  {
    id: "2",
    documentId: "doc-1",
    parentId: "1",
    content: "Thanks for catching that! I'll review the calculations and update the document by tomorrow.",
    authorId: "user-2",
    authorName: "Sarah Johnson",
    authorAvatar: "/placeholder.svg?height=32&width=32",
    createdDate: "2024-01-16T11:15:00Z",
    mentions: [],
    reactions: [],
    isResolved: false,
  },
  {
    id: "3",
    documentId: "doc-1",
    content: "The marketing section looks great! Ready for approval from my end.",
    authorId: "user-3",
    authorName: "Emily Davis",
    authorAvatar: "/placeholder.svg?height=32&width=32",
    createdDate: "2024-01-16T14:20:00Z",
    mentions: [],
    reactions: [{ emoji: "🎉", users: ["user-1", "user-2"] }],
    isResolved: true,
    resolvedBy: "user-3",
    resolvedDate: "2024-01-16T14:20:00Z",
  },
]

export function CommentThread({
  comments = mockComments,
  documentId,
  workflowId,
  assignmentId,
  currentUserId = "current-user",
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onResolveComment,
  className,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  // Organize comments into threads
  const organizeComments = (comments: Comment[]) => {
    const topLevel = comments.filter((c) => !c.parentId)
    const replies = comments.filter((c) => c.parentId)

    return topLevel.map((comment) => ({
      ...comment,
      replies: replies.filter((r) => r.parentId === comment.id),
    }))
  }

  const threadedComments = organizeComments(comments)

  const handleAddComment = (parentId?: string) => {
    const content = parentId ? newComment : newComment
    if (!content.trim()) return

    const comment: Partial<Comment> = {
      id: `comment-${Date.now()}`,
      documentId,
      workflowId,
      assignmentId,
      parentId,
      content: content.trim(),
      authorId: currentUserId,
      authorName: "Current User",
      createdDate: new Date().toISOString(),
      mentions: extractMentions(content),
      reactions: [],
      isResolved: false,
    }

    onAddComment(comment)
    setNewComment("")
    setReplyingTo(null)
  }

  const handleEditComment = (commentId: string) => {
    if (!editContent.trim()) return

    onUpdateComment(commentId, {
      content: editContent.trim(),
      editedDate: new Date().toISOString(),
      mentions: extractMentions(editContent),
    })

    setEditingComment(null)
    setEditContent("")
  }

  const handleReaction = (commentId: string, emoji: string) => {
    const comment = comments.find((c) => c.id === commentId)
    if (!comment) return

    const existingReaction = comment.reactions.find((r) => r.emoji === emoji)
    let updatedReactions

    if (existingReaction) {
      if (existingReaction.users.includes(currentUserId)) {
        // Remove user's reaction
        updatedReactions = comment.reactions
          .map((r) => (r.emoji === emoji ? { ...r, users: r.users.filter((u) => u !== currentUserId) } : r))
          .filter((r) => r.users.length > 0)
      } else {
        // Add user's reaction
        updatedReactions = comment.reactions.map((r) =>
          r.emoji === emoji ? { ...r, users: [...r.users, currentUserId] } : r,
        )
      }
    } else {
      // Add new reaction
      updatedReactions = [...comment.reactions, { emoji, users: [currentUserId] }]
    }

    onUpdateComment(commentId, { reactions: updatedReactions })
  }

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+(?:\.\w+)*)/g
    const mentions = []
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }

    return mentions
  }

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const renderComment = (comment: Comment & { replies?: Comment[] }, isReply = false) => (
    <div key={comment.id} className={cn("space-y-3", isReply && "ml-12")}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.authorAvatar || "/placeholder.svg"} alt={comment.authorName} />
          <AvatarFallback className="text-xs">
            {comment.authorName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">{comment.authorName}</span>
              <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdDate)}</span>
              {comment.editedDate && (
                <Badge variant="outline" className="text-xs">
                  edited
                </Badge>
              )}
              {comment.isResolved && (
                <Badge variant="outline" className="text-xs text-green-600">
                  resolved
                </Badge>
              )}
            </div>

            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Edit your comment..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingComment(null)
                      setEditContent("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-foreground whitespace-pre-wrap">
                {comment.content.split(/(@\w+(?:\.\w+)*)/g).map((part, index) =>
                  part.startsWith("@") ? (
                    <span key={index} className="text-blue-600 font-medium">
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </div>
            )}
          </div>

          {/* Reactions */}
          {comment.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {comment.reactions.map((reaction) => (
                <Button
                  key={reaction.emoji}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-xs",
                    reaction.users.includes(currentUserId) && "bg-primary/10 border-primary/20",
                  )}
                  onClick={() => handleReaction(comment.id, reaction.emoji)}
                >
                  {reaction.emoji} {reaction.users.length}
                </Button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleReaction(comment.id, "👍")}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              Like
            </Button>

            {!isReply && (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setReplyingTo(comment.id)}>
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}

            {!comment.isResolved && !isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onResolveComment(comment.id)}
              >
                Resolve
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {comment.authorId === currentUserId && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingComment(comment.id)
                        setEditContent(comment.content)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteComment(comment.id)} className="text-destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem>
                  <AtSign className="mr-2 h-4 w-4" />
                  Mention Author
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleAddComment(comment.id)}>
                  <Send className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null)
                    setNewComment("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3">{comment.replies.map((reply) => renderComment(reply, true))}</div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Discussion ({comments.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">Collaborate and provide feedback on this document</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs">CU</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment... Use @username to mention someone"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach
                  </Button>
                  <Button variant="ghost" size="sm">
                    <AtSign className="h-4 w-4 mr-2" />
                    Mention
                  </Button>
                </div>
                <Button size="sm" onClick={() => handleAddComment()} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-6">{threadedComments.map((comment) => renderComment(comment))}</div>

        {comments.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Start the discussion</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to comment on this document. Share your thoughts and feedback.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
