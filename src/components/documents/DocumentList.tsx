"use client"

import {
    ChevronDown,
    ChevronUp,
    Download,
    Edit,
    Eye,
    File,
    FileSpreadsheet,
    FileText,
    ImageIcon,
    MoreHorizontal,
    Presentation,
    Share,
    Trash2,
} from "lucide-react"
import type React from "react"
import type { Document } from "../../data/mockData"
import { cn } from "../../lib/utils"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

interface DocumentListProps {
  documents: Document[]
  selectedDocuments: string[]
  onSelectDocument: (id: string) => void
  onSelectAll: (ids: string[]) => void
  onPreview: (document: Document) => void
  onDownload: (document: Document) => void
  onShare: (document: Document) => void
  onDelete: (document: Document) => void
  onEdit: (document: Document) => void
  onSort: (field: string) => void
  sortBy: string
  sortOrder: "asc" | "desc"
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

export function DocumentList({
  documents,
  selectedDocuments,
  onSelectDocument,
  onSelectAll,
  onPreview,
  onDownload,
  onShare,
  onDelete,
  onEdit,
  onSort,
  sortBy,
  sortOrder,
}: DocumentListProps) {
  const allSelected = documents.length > 0 && selectedDocuments.length === documents.length
  const someSelected = selectedDocuments.length > 0 && selectedDocuments.length < documents.length

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectAll([])
    } else {
      onSelectAll(documents.map((doc) => doc.id))
    }
  }

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium hover:bg-transparent"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortBy === field &&
          (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </span>
    </Button>
  )

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected ? true : someSelected ? ("indeterminate" as const) : false}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>
              <SortButton field="name">Name</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="size">Size</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="modified">Modified</SortButton>
            </TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => {
            const FileIcon = getFileIcon(document.type)
            const isSelected = selectedDocuments.includes(document.id)

            return (
              <TableRow
                key={document.id}
                className={cn("cursor-pointer hover:bg-muted/50", isSelected && "bg-muted")}
                onClick={() => onPreview(document)}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelectDocument(document.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                      <FileIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate" title={document.name}>
                        {document.name}
                      </p>
                      {document.description && (
                        <p className="text-sm text-muted-foreground truncate">{document.description}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{document.size}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(document.modified).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{document.author}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("text-xs", getStatusColor(document.status))}>
                    {document.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
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
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onPreview(document)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownload(document)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
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
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
