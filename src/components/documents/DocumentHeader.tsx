"use client"
import {
  Download,
  Share,
  Edit,
  MoreHorizontal,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  Presentation,
  File,
  Star,
  StarOff,
  Copy,
  Trash2,
  ExternalLink,
  Clock,
  User,
  Calendar,
  Tag,
  FolderOpen,
} from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb"
import { cn } from "../../lib/utils"
import type { DocumentDetail } from "../../types/documentDetail"

interface DocumentHeaderProps {
  document: DocumentDetail
  onDownload: () => void
  onShare: () => void
  onEdit: () => void
  onDelete: () => void
  onFavorite: () => void
  isFavorited?: boolean
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

export function DocumentHeader({
  document,
  onDownload,
  onShare,
  onEdit,
  onDelete,
  onFavorite,
  isFavorited = false,
}: DocumentHeaderProps) {
  const FileIcon = getFileIcon(document.type)

  return (
    <div className="border-b bg-card">
      <div className="p-6 space-y-4">
        {/* Breadcrumb Navigation */}
        {document.folderPath && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/documents" className="flex items-center gap-1">
                  <FolderOpen className="h-4 w-4" />
                  Documents
                </BreadcrumbLink>
              </BreadcrumbItem>
              {document.folderPath.map((folder, index) => (
                <div key={index} className="flex items-center gap-1">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/documents/folder/${folder}`}>{folder}</BreadcrumbLink>
                  </BreadcrumbItem>
                </div>
              ))}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{document.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Document Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-foreground truncate" title={document.name}>
                  {document.name}
                </h1>
                <Button variant="ghost" size="sm" onClick={onFavorite} className="h-8 w-8 p-0 flex-shrink-0">
                  {isFavorited ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {document.description && (
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{document.description}</p>
              )}

              {/* Document Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{document.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Modified {new Date(document.modified).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Version {document.currentVersion}</span>
                </div>
                <span>{document.size}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button onClick={onDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {document.permissions.canShare && (
              <Button onClick={onShare} variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            {document.permissions.canWrite && (
              <Button onClick={onEdit} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-transparent">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {document.permissions.canDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status and Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={cn("text-xs", getStatusColor(document.status))}>
            {document.status}
          </Badge>
          {document.tags.slice(0, 5).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {document.tags.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{document.tags.length - 5} more
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
