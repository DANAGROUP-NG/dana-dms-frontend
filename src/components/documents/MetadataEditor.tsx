"use client"

import { Calendar, Clock, Edit, FileText, Hash, Plus, Save, Tag, Trash2, User, X } from "lucide-react"
import { useState } from "react"
import { cn } from "../../lib/utils"
import type { DocumentDetail } from "../../types/documentDetail"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"

interface MetadataEditorProps {
  document: DocumentDetail
  canEdit?: boolean
  onSave?: (metadata: Partial<DocumentDetail>) => void
  className?: string
}

export function MetadataEditor({ document, canEdit = false, onSave, className }: MetadataEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({
    name: document.name,
    description: document.description || "",
    tags: [...document.tags],
    metadata: { ...document.metadata },
  })
  const [newTag, setNewTag] = useState("")
  const [newCustomField, setNewCustomField] = useState({ key: "", value: "" })

  const handleSave = () => {
    onSave?.(editedData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedData({
      name: document.name,
      description: document.description || "",
      tags: [...document.tags],
      metadata: { ...document.metadata },
    })
    setIsEditing(false)
  }

  const addTag = () => {
    if (newTag.trim() && !editedData.tags.includes(newTag.trim())) {
      setEditedData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditedData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const addCustomField = () => {
    if (newCustomField.key.trim() && newCustomField.value.trim()) {
      setEditedData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          customFields: {
            ...prev.metadata.customFields,
            [newCustomField.key]: newCustomField.value,
          },
        },
      }))
      setNewCustomField({ key: "", value: "" })
    }
  }

  const removeCustomField = (key: string) => {
    setEditedData((prev) => {
      const newCustomFields = { ...prev.metadata.customFields }
      delete newCustomFields[key]
      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          customFields: newCustomFields,
        },
      }
    })
  }

  const updateCustomField = (key: string, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        customFields: {
          ...prev.metadata.customFields,
          [key]: value,
        },
      },
    }))
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Basic Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Basic Information</CardTitle>
          {canEdit && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document-name">Document Name</Label>
              {isEditing ? (
                <Input
                  id="document-name"
                  value={editedData.name}
                  onChange={(e) => setEditedData((prev) => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <p className="text-sm text-foreground">{document.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>File Type</Label>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground uppercase">{document.type}</span>
                <Badge variant="outline" className="text-xs">
                  {document.mimeType}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-description">Description</Label>
            {isEditing ? (
              <Textarea
                id="document-description"
                value={editedData.description}
                onChange={(e) => setEditedData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Add a description for this document..."
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{document.description || "No description provided"}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(isEditing ? editedData.tags : document.tags).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  {isEditing && (
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add new tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  className="flex-1"
                />
                <Button onClick={addTag} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">File Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">File Size</p>
                <p className="text-sm font-medium">{document.size}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{new Date(document.created).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Modified</p>
                <p className="text-sm font-medium">{new Date(document.modified).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Author</p>
                <p className="text-sm font-medium">{document.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Version</p>
                <p className="text-sm font-medium">v{document.currentVersion}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(document.metadata).map(([key, value]) => {
              if (key === "customFields") return null

              return (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <p className="text-sm text-foreground">{Array.isArray(value) ? value.join(", ") : String(value)}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Custom Fields</CardTitle>
          {isEditing && (
            <Button onClick={addCustomField} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {document.metadata.customFields &&
            Object.entries(document.metadata.customFields).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Field Name</Label>
                    <p className="text-sm font-medium">{key}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Value</Label>
                    {isEditing ? (
                      <Input
                        value={editedData.metadata.customFields?.[key] || ""}
                        onChange={(e) => updateCustomField(key, e.target.value)}
                      />
                    ) : (
                      <p className="text-sm text-foreground">{String(value)}</p>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <Button
                    onClick={() => removeCustomField(key)}
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

          {isEditing && (
            <div className="flex items-end gap-4 pt-4 border-t">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-field-key">Field Name</Label>
                  <Input
                    id="new-field-key"
                    placeholder="Enter field name..."
                    value={newCustomField.key}
                    onChange={(e) => setNewCustomField((prev) => ({ ...prev, key: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-field-value">Value</Label>
                  <Input
                    id="new-field-value"
                    placeholder="Enter value..."
                    value={newCustomField.value}
                    onChange={(e) => setNewCustomField((prev) => ({ ...prev, value: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {(!document.metadata.customFields || Object.keys(document.metadata.customFields).length === 0) &&
            !isEditing && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No custom fields defined for this document.
              </p>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
