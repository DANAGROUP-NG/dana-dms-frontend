"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Share,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  Presentation,
  File,
} from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { cn } from "../../lib/utils"
import type { Document } from "../../data/mockData"

interface DocumentCardProps {
  document: Document
  isSelected: boolean
  onSelect: (id: string) => void
  onPreview: (document: Document) => void
  onDownload: (document: Document) => void
  onShare: (document: Document) => void
  onDelete: (document: Document) => void
  onEdit: (document: Document) => void
  density?: "compact" | "comfortable" | "spacious"
}

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return FileText
    case "docx":
    case "doc":
      return FileText
    case "xlsx":
    case "xls":
      return FileSpreadsheet
    case "pptx":
    case "ppt":
      return Presentation
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return ImageIcon
    default:
      return File
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "review":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "draft":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    case "archived":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

export function DocumentCard({
  document,
  isSelected,
  onSelect,
  onPreview,
  onDownload,
  onShare,
  onDelete,
  onEdit,
  density = "comfortable",
}: DocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()
  const FileIcon = getFileIcon(document.type)

  const cardHeight = {
    compact: "h-32",
    comfortable: "h-40",
    spacious: "h-48",
  }[density]

  const iconSize = {
    compact: "h-8 w-8",
    comfortable: "h-10 w-10",
    spacious: "h-12 w-12",
  }[density]

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-all duration-200",
        cardHeight,
        isSelected && "ring-2 ring-primary",
        isHovered && "shadow-md scale-[1.02]",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/documents/${document.id}`)}
    >
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header with checkbox and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(document.id)}
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <div className={cn("rounded-lg bg-primary/10 flex items-center justify-center", iconSize)}>
              <FileIcon className="h-4 w-4 text-primary" />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/documents/${document.id}`)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onPreview(document)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Quick Preview
              </DropdownMenuItem>
              {document.permissions.canShare && (
                <DropdownMenuItem onClick={() => onShare(document)}>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
              )}
              {document.permissions.canWrite && (
                <DropdownMenuItem onClick={() => onEdit(document)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {document.permissions.canDelete && (
                <DropdownMenuItem onClick={() => onDelete(document)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Document info */}
        <div className="flex-1 min-h-0">
          <h3 className="font-medium text-sm truncate mb-1" title={document.name}>
            {document.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            {document.size} • {new Date(document.modified).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground mb-2">by {document.author}</p>

          {/* Tags and status */}
          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant="secondary" className={cn("text-xs", getStatusColor(document.status))}>
              {document.status}
            </Badge>
            {document.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {document.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{document.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
