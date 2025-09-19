"use client"

import {
    Archive,
    Copy,
    Download,
    Edit,
    FolderPlus,
    Lock,
    MoreHorizontal,
    Move,
    Settings,
    Share,
    Star,
    Trash2,
    Users,
} from "lucide-react"
import type React from "react"
import type { Folder } from "../../data/mockData"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
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

interface FolderContextMenuProps {
  folder: Folder
  onRename: (folder: Folder) => void
  onDelete: (folder: Folder) => void
  onMove: (folder: Folder) => void
  onCopy: (folder: Folder) => void
  onShare: (folder: Folder) => void
  onCreateSubfolder: (parentFolder: Folder) => void
  onDownload: (folder: Folder) => void
  onArchive: (folder: Folder) => void
  onFavorite: (folder: Folder) => void
  onPermissions: (folder: Folder) => void
  children: React.ReactNode
  className?: string
}

export function FolderContextMenu({
  folder,
  onRename,
  onDelete,
  onMove,
  onCopy,
  onShare,
  onCreateSubfolder,
  onDownload,
  onArchive,
  onFavorite,
  onPermissions,
  children,
  className,
}: FolderContextMenuProps) {
  // Mock permissions - in real app, these would come from folder.permissions
  const canEdit = true
  const canDelete = folder.documentCount === 0 // Only allow delete if empty
  const canShare = true
  const canManagePermissions = true
  const isShared = folder.documentCount > 20 // Mock shared folder logic
  const isFavorited = false // Mock favorite status

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild className={className}>{children}</ContextMenuTrigger>

      <ContextMenuContent className="w-56">
        {/* Primary Actions */}
        <ContextMenuItem onClick={() => onCreateSubfolder(folder)}>
          <FolderPlus className="mr-2 h-4 w-4" />
          New Subfolder
        </ContextMenuItem>

        {canEdit && (
          <ContextMenuItem onClick={() => onRename(folder)}>
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        {/* Organization Actions */}
        <ContextMenuItem onClick={() => onMove(folder)}>
          <Move className="mr-2 h-4 w-4" />
          Move to...
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onCopy(folder)}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onFavorite(folder)}>
          <Star className={cn("mr-2 h-4 w-4", isFavorited && "fill-yellow-400 text-yellow-400")} />
          {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Sharing & Permissions */}
        {canShare && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Share className="mr-2 h-4 w-4" />
              Share
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => onShare(folder)}>
                <Users className="mr-2 h-4 w-4" />
                Share with users
              </ContextMenuItem>
              <ContextMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Copy share link
              </ContextMenuItem>
              {isShared && (
                <ContextMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage sharing
                </ContextMenuItem>
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        {canManagePermissions && (
          <ContextMenuItem onClick={() => onPermissions(folder)}>
            <Lock className="mr-2 h-4 w-4" />
            Permissions
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        {/* Export & Archive */}
        <ContextMenuItem onClick={() => onDownload(folder)}>
          <Download className="mr-2 h-4 w-4" />
          Download as ZIP
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onArchive(folder)}>
          <Archive className="mr-2 h-4 w-4" />
          Archive folder
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Destructive Actions */}
        {canDelete ? (
          <ContextMenuItem onClick={() => onDelete(folder)} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        ) : (
          <ContextMenuItem disabled>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete (folder not empty)
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

// Alternative trigger button for non-context menu usage
interface FolderActionsButtonProps {
  folder: Folder
  onRename: (folder: Folder) => void
  onDelete: (folder: Folder) => void
  onMove: (folder: Folder) => void
  onCopy: (folder: Folder) => void
  onShare: (folder: Folder) => void
  onCreateSubfolder: (parentFolder: Folder) => void
  onDownload: (folder: Folder) => void
  onArchive: (folder: Folder) => void
  onFavorite: (folder: Folder) => void
  onPermissions: (folder: Folder) => void
  className?: string
}

export function FolderActionsButton({
  folder,
  onRename,
  onDelete,
  onMove,
  onCopy,
  onShare,
  onCreateSubfolder,
  onDownload,
  onArchive,
  onFavorite,
  onPermissions,
  className,
}: FolderActionsButtonProps) {
  return (
    <FolderContextMenu
      folder={folder}
      onRename={onRename}
      onDelete={onDelete}
      onMove={onMove}
      onCopy={onCopy}
      onShare={onShare}
      onCreateSubfolder={onCreateSubfolder}
      onDownload={onDownload}
      onArchive={onArchive}
      onFavorite={onFavorite}
      onPermissions={onPermissions}
      className={className}
    >
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </FolderContextMenu>
  )
}
