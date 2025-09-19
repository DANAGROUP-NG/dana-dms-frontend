"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FolderPlus, AlertCircle, Check } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Alert, AlertDescription } from "../ui/alert"
import { cn } from "../../lib/utils"
import type { Folder } from "../../data/mockData"

interface FolderCreatorProps {
  isOpen: boolean
  onClose: () => void
  onCreateFolder: (folderData: CreateFolderData) => Promise<void>
  parentFolder?: Folder | null
  existingFolders: Folder[]
  className?: string
}

export interface CreateFolderData {
  name: string
  description?: string
  color: string
  parentId?: string
  permissions: {
    isPublic: boolean
    allowSharing: boolean
    restrictedAccess: boolean
  }
}

const FOLDER_COLORS = [
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Orange", value: "orange", class: "bg-orange-500" },
  { name: "Red", value: "red", class: "bg-red-500" },
  { name: "Yellow", value: "yellow", class: "bg-yellow-500" },
  { name: "Pink", value: "pink", class: "bg-pink-500" },
  { name: "Gray", value: "gray", class: "bg-gray-500" },
]

export function FolderCreator({
  isOpen,
  onClose,
  onCreateFolder,
  parentFolder,
  existingFolders,
  className,
}: FolderCreatorProps) {
  const [formData, setFormData] = useState<CreateFolderData>({
    name: "",
    description: "",
    color: "blue",
    parentId: parentFolder?.id,
    permissions: {
      isPublic: true,
      allowSharing: true,
      restrictedAccess: false,
    },
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        color: "blue",
        parentId: parentFolder?.id,
        permissions: {
          isPublic: true,
          allowSharing: true,
          restrictedAccess: false,
        },
      })
      setErrors({})
    }
  }, [isOpen, parentFolder])

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Folder name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Folder name must be at least 2 characters"
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Folder name must be less than 50 characters"
    } else if (!/^[a-zA-Z0-9\s\-_()]+$/.test(formData.name.trim())) {
      newErrors.name = "Folder name contains invalid characters"
    }

    // Check for duplicate names in the same parent
    const siblingFolders = parentFolder?.children || existingFolders.filter((f) => !f.parentId)
    const isDuplicate = siblingFolders.some(
      (folder) => folder.name.toLowerCase() === formData.name.trim().toLowerCase(),
    )

    if (isDuplicate) {
      newErrors.name = "A folder with this name already exists in this location"
    }

    // Description validation (optional)
    if (formData.description && formData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsCreating(true)
    try {
      await onCreateFolder({
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      })
      onClose()
    } catch (error) {
      setErrors({ submit: "Failed to create folder. Please try again." })
    } finally {
      setIsCreating(false)
    }
  }

  const handleInputChange = (field: keyof CreateFolderData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePermissionChange = (permission: keyof CreateFolderData["permissions"], value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [permission]: value },
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create New Folder
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parent Folder Info */}
          {parentFolder && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Creating folder in: <span className="font-medium">{parentFolder.name}</span>
              </p>
            </div>
          )}

          {/* Folder Name */}
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name *</Label>
            <Input
              id="folder-name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter folder name..."
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="folder-description">Description</Label>
            <Textarea
              id="folder-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Folder Color</Label>
            <div className="flex flex-wrap gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange("color", color.value)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    color.class,
                    formData.color === color.value
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105",
                  )}
                  title={color.name}
                >
                  {formData.color === color.value && <Check className="h-4 w-4 text-white mx-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.isPublic}
                  onChange={(e) => handlePermissionChange("isPublic", e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Public folder (visible to all users)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.allowSharing}
                  onChange={(e) => handlePermissionChange("allowSharing", e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Allow sharing</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.restrictedAccess}
                  onChange={(e) => handlePermissionChange("restrictedAccess", e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Restricted access</span>
              </label>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating || !formData.name.trim()}>
            {isCreating ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
