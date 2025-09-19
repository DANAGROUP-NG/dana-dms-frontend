"use client"

import type React from "react"

import {
  Download,
  Share,
  Edit,
  Trash2,
  Copy,
  Move,
  Tag,
  Archive,
  Star,
  Eye,
  FileText,
  ExternalLink,
  History,
  Lock,
} from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../ui/context-menu"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"
import type { Document } from "../../data/mockData"

interface DocumentContextMenuProps {
  document: Document
  isFavorited?: boolean
  onPreview: (document: Document) => void
  onDownload: (document: Document) => void
  onShare: (document: Document) => void
  onEdit: (document: Document) => void
  onMove: (document: Document) => void
  onCopy: (document: Document) => void
  onTag: (document: Document) => void
  onArchive: (document: Document) => void
  onDelete: (document: Document) => void
  onFavorite: (document: Document) => void
  onViewHistory: (document: Document) => void
  onPermissions: (document: Document) => void
  children: React.ReactNode
  className?: string
}

export function DocumentContextMenu({
  document,
  isFavorited = false,
  onPreview,
  onDownload,
  onShare,
  onEdit,
  onMove,
  onCopy,
  onTag,
  onArchive,
  onDelete,
  onFavorite,
  onViewHistory,
  onPermissions,
  children,
  className,
}: DocumentContextMenuProps) {
  const { permissions } = document

  return (
    <ContextMenu>
      <ContextMenuTrigger className={className}>{children}</ContextMenuTrigger>

      <ContextMenuContent className="w-56">
        {/* Primary Actions */}
        <ContextMenuItem onClick={() => onPreview(document)}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onDownload(document)}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </ContextMenuItem>

        {permissions.canWrite && (
          <ContextMenuItem onClick={() => onEdit(document)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
            {document.status === "draft" && (
              <Badge variant="secondary" className="ml-auto text-xs">
                Draft
              </Badge>
            )}
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        {/* Organization Actions */}
        <ContextMenuItem onClick={() => onMove(document)}>
          <Move className="mr-2 h-4 w-4" />
          Move to folder
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onCopy(document)}>
          <Copy className="mr-2 h-4 w-4" />
          Make a copy
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onFavorite(document)}>
          <Star className={cn("mr-2 h-4 w-4", isFavorited && "fill-yellow-400 text-yellow-400")} />
          {isFavorited ? "Remove from favorites" : "Add to favorites"}
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onTag(document)}>
          <Tag className="mr-2 h-4 w-4" />
          Manage tags
          {document.tags.length > 0 && (
            <Badge variant="outline" className="ml-auto text-xs">
              {document.tags.length}
            </Badge>
          )}
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Sharing & Permissions */}
        {permissions.canShare && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Share className="mr-2 h-4 w-4" />
              Share
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => onShare(document)}>
                <Share className="mr-2 h-4 w-4" />
                Share with users
              </ContextMenuItem>
              <ContextMenuItem>
                <ExternalLink className="mr-2 h-4 w-4" />
                Get shareable link
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onPermissions(document)}>
                <Lock className="mr-2 h-4 w-4" />
                Manage permissions
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        <ContextMenuSeparator />

        {/* Information & History */}
        <ContextMenuItem onClick={() => onViewHistory(document)}>
          <History className="mr-2 h-4 w-4" />
          Version history
          <Badge variant="outline" className="ml-auto text-xs">
            v{document.version}
          </Badge>
        </ContextMenuItem>

        <ContextMenuItem disabled>
          <FileText className="mr-2 h-4 w-4" />
          Properties
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Archive & Delete */}
        <ContextMenuItem onClick={() => onArchive(document)}>
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </ContextMenuItem>

        {permissions.canDelete && (
          <ContextMenuItem onClick={() => onDelete(document)} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
