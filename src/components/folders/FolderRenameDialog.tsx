"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Edit, AlertCircle } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Alert, AlertDescription } from "../ui/alert"
import { cn } from "../../lib/utils"
import type { Folder } from "../../data/mockData"

interface FolderRenameDialogProps {
  folder: Folder | null
  isOpen: boolean
  onClose: () => void
  onRename: (folderId: string, newName: string) => Promise<void>
  existingFolders: Folder[]
  className?: string
}

export function FolderRenameDialog({
  folder,
  isOpen,
  onClose,
  onRename,
  existingFolders,
  className,
}: FolderRenameDialogProps) {
  const [newName, setNewName] = useState("")
  const [error, setError] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen && folder) {
      setNewName(folder.name)
      setError("")
    }
  }, [isOpen, folder])

  // Validate new name
  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return "Folder name is required"
    }

    if (name.trim().length < 2) {
      return "Folder name must be at least 2 characters"
    }

    if (name.trim().length > 50) {
      return "Folder name must be less than 50 characters"
    }

    if (!/^[a-zA-Z0-9\s\-_()]+$/.test(name.trim())) {
      return "Folder name contains invalid characters"
    }

    // Check for duplicates in the same parent
    const siblingFolders = existingFolders.filter((f) => f.parentId === folder?.parentId && f.id !== folder?.id)

    const isDuplicate = siblingFolders.some((f) => f.name.toLowerCase() === name.trim().toLowerCase())

    if (isDuplicate) {
      return "A folder with this name already exists in this location"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!folder) return

    const validationError = validateName(newName)
    if (validationError) {
      setError(validationError)
      return
    }

    // Don't rename if name hasn't changed
    if (newName.trim() === folder.name) {
      onClose()
      return
    }

    setIsRenaming(true)
    try {
      await onRename(folder.id, newName.trim())
      onClose()
    } catch (error) {
      setError("Failed to rename folder. Please try again.")
    } finally {
      setIsRenaming(false)
    }
  }

  const handleInputChange = (value: string) => {
    setNewName(value)
    if (error) {
      setError("")
    }
  }

  if (!folder) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Rename Folder
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={newName}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter new folder name..."
              className={error ? "border-red-500" : ""}
              autoFocus
              onFocus={(e) => e.target.select()}
            />
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Current name: <span className="font-medium">{folder.name}</span>
            </p>
            <p>Location: {folder.parentId ? "Subfolder" : "Root level"}</p>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRenaming}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isRenaming || !newName.trim() || newName.trim() === folder.name}>
            {isRenaming ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
