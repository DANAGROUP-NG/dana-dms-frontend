"use client"

import { useState } from "react"
import { FolderOpen, Trash2, Download, Archive } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import type { Document, Folder } from "../../data/mockData"

interface BulkOperationsDialogProps {
  isOpen: boolean
  onClose: () => void
  operation: "move" | "tag" | "delete" | "download" | "archive" | "share" | null
  selectedDocuments: Document[]
  folders: Folder[]
  onConfirm: (operation: string, data?: any) => void
}

export function BulkOperationsDialog({
  isOpen,
  onClose,
  operation,
  selectedDocuments,
  folders,
  onConfirm,
}: BulkOperationsDialogProps) {
  const [selectedFolder, setSelectedFolder] = useState<string>("")
  const [newTags, setNewTags] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [shareSettings, setShareSettings] = useState({
    allowDownload: true,
    allowEdit: false,
    expiresIn: "7",
  })

  const handleClose = () => {
    setSelectedFolder("")
    setNewTags("")
    setSelectedTags([])
    setShareSettings({ allowDownload: true, allowEdit: false, expiresIn: "7" })
    onClose()
  }

  const handleConfirm = () => {
    switch (operation) {
      case "move":
        if (selectedFolder) {
          onConfirm("move", { folderId: selectedFolder })
        }
        break
      case "tag":
        const tagsToAdd = [
          ...selectedTags,
          ...newTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        ]
        if (tagsToAdd.length > 0) {
          onConfirm("tag", { tags: tagsToAdd })
        }
        break
      case "delete":
        onConfirm("delete")
        break
      case "download":
        onConfirm("download")
        break
      case "archive":
        onConfirm("archive")
        break
      case "share":
        onConfirm("share", shareSettings)
        break
    }
    handleClose()
  }

  // Get existing tags from selected documents
  const existingTags = Array.from(new Set(selectedDocuments.flatMap((doc) => doc.tags))).sort()

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const getDialogContent = () => {
    switch (operation) {
      case "move":
        return {
          title: "Move Documents",
          description: `Move ${selectedDocuments.length} document${selectedDocuments.length > 1 ? "s" : ""} to a folder`,
          content: (
            <div className="space-y-4">
              <div>
                <Label htmlFor="folder-select">Select destination folder</Label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4" />
                          {folder.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ),
          confirmDisabled: !selectedFolder,
        }

      case "tag":
        return {
          title: "Add Tags",
          description: `Add tags to ${selectedDocuments.length} document${selectedDocuments.length > 1 ? "s" : ""}`,
          content: (
            <div className="space-y-4">
              {existingTags.length > 0 && (
                <div>
                  <Label>Existing tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {existingTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="new-tags">Add new tags (comma-separated)</Label>
                <Input
                  id="new-tags"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
          ),
          confirmDisabled: selectedTags.length === 0 && !newTags.trim(),
        }

      case "delete":
        return {
          title: "Delete Documents",
          description: `Are you sure you want to delete ${selectedDocuments.length} document${selectedDocuments.length > 1 ? "s" : ""}? This action cannot be undone.`,
          content: (
            <div className="space-y-2">
              {selectedDocuments.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 text-sm">
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="truncate">{doc.name}</span>
                </div>
              ))}
              {selectedDocuments.length > 5 && (
                <p className="text-sm text-muted-foreground">...and {selectedDocuments.length - 5} more documents</p>
              )}
            </div>
          ),
          confirmDisabled: false,
          confirmVariant: "destructive" as const,
        }

      case "download":
        return {
          title: "Download Documents",
          description: `Download ${selectedDocuments.length} document${selectedDocuments.length > 1 ? "s" : ""} as a ZIP file`,
          content: (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">The following documents will be included in the download:</p>
              {selectedDocuments.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4 text-blue-500" />
                  <span className="truncate">{doc.name}</span>
                  <span className="text-muted-foreground">({doc.size})</span>
                </div>
              ))}
              {selectedDocuments.length > 5 && (
                <p className="text-sm text-muted-foreground">...and {selectedDocuments.length - 5} more documents</p>
              )}
            </div>
          ),
          confirmDisabled: false,
        }

      case "archive":
        return {
          title: "Archive Documents",
          description: `Archive ${selectedDocuments.length} document${selectedDocuments.length > 1 ? "s" : ""}`,
          content: (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Archived documents will be moved to the archive folder and marked as archived.
              </p>
              {selectedDocuments.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 text-sm">
                  <Archive className="h-4 w-4 text-orange-500" />
                  <span className="truncate">{doc.name}</span>
                </div>
              ))}
              {selectedDocuments.length > 5 && (
                <p className="text-sm text-muted-foreground">...and {selectedDocuments.length - 5} more documents</p>
              )}
            </div>
          ),
          confirmDisabled: false,
        }

      case "share":
        return {
          title: "Share Documents",
          description: `Create shareable links for ${selectedDocuments.length} document${selectedDocuments.length > 1 ? "s" : ""}`,
          content: (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow-download"
                    checked={shareSettings.allowDownload}
                    onCheckedChange={(checked) => setShareSettings((prev) => ({ ...prev, allowDownload: !!checked }))}
                  />
                  <Label htmlFor="allow-download">Allow download</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow-edit"
                    checked={shareSettings.allowEdit}
                    onCheckedChange={(checked) => setShareSettings((prev) => ({ ...prev, allowEdit: !!checked }))}
                  />
                  <Label htmlFor="allow-edit">Allow editing</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="expires-in">Link expires in</Label>
                <Select
                  value={shareSettings.expiresIn}
                  onValueChange={(value) => setShareSettings((prev) => ({ ...prev, expiresIn: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ),
          confirmDisabled: false,
        }

      default:
        return null
    }
  }

  const dialogContent = getDialogContent()
  if (!dialogContent) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogContent.title}</DialogTitle>
          <DialogDescription>{dialogContent.description}</DialogDescription>
        </DialogHeader>
        {dialogContent.content}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={dialogContent.confirmDisabled}
            variant={dialogContent.confirmVariant || "default"}
          >
            {operation === "delete" ? "Delete" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
