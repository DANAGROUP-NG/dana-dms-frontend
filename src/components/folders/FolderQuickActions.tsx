"use client"
import {
  Star,
  Share,
  Download,
  Archive,
  Trash2,
  Edit,
  FolderPlus,
  Settings,
  Users,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"
import type { Folder } from "../../data/mockData"

interface FolderQuickActionsProps {
  folder: Folder
  isFavorited?: boolean
  isWatching?: boolean
  onFavorite: (folder: Folder) => void
  onWatch: (folder: Folder) => void
  onShare: (folder: Folder) => void
  onDownload: (folder: Folder) => void
  onArchive: (folder: Folder) => void
  onDelete: (folder: Folder) => void
  onRename: (folder: Folder) => void
  onCreateSubfolder: (folder: Folder) => void
  onPermissions: (folder: Folder) => void
  className?: string
}

export function FolderQuickActions({
  folder,
  isFavorited = false,
  isWatching = false,
  onFavorite,
  onWatch,
  onShare,
  onDownload,
  onArchive,
  onDelete,
  onRename,
  onCreateSubfolder,
  onPermissions,
  className,
}: FolderQuickActionsProps) {
  // Mock permissions - in real app, these would come from folder.permissions
  const canEdit = true
  const canDelete = folder.documentCount === 0
  const canShare = true
  const canManagePermissions = true
  const isShared = folder.documentCount > 20

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        {/* Quick Favorite */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFavorite(folder)}
              className={cn("h-8 w-8 p-0", isFavorited && "text-yellow-500 hover:text-yellow-600")}
            >
              <Star className={cn("h-4 w-4", isFavorited && "fill-current")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isFavorited ? "Remove from favorites" : "Add to favorites"}</TooltipContent>
        </Tooltip>

        {/* Quick Watch */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onWatch(folder)}
              className={cn("h-8 w-8 p-0", isWatching && "text-blue-500 hover:text-blue-600")}
            >
              {isWatching ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isWatching ? "Stop watching" : "Watch for changes"}</TooltipContent>
        </Tooltip>

        {/* More Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Creation Actions */}
            <DropdownMenuItem onClick={() => onCreateSubfolder(folder)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              New subfolder
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Edit Actions */}
            {canEdit && (
              <DropdownMenuItem onClick={() => onRename(folder)}>
                <Edit className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
            )}

            {/* Sharing Actions */}
            {canShare && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                  {isShared && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Shared
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => onShare(folder)}>
                    <Users className="mr-2 h-4 w-4" />
                    Share with users
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Sharing settings
                  </DropdownMenuItem>
                  {isShared && (
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View shared users
                    </DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}

            {/* Permissions */}
            {canManagePermissions && (
              <DropdownMenuItem onClick={() => onPermissions(folder)}>
                <Lock className="mr-2 h-4 w-4" />
                Permissions
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Export Actions */}
            <DropdownMenuItem onClick={() => onDownload(folder)}>
              <Download className="mr-2 h-4 w-4" />
              Download as ZIP
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onArchive(folder)}>
              <Archive className="mr-2 h-4 w-4" />
              Archive folder
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Destructive Actions */}
            {canDelete ? (
              <DropdownMenuItem onClick={() => onDelete(folder)} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete (folder not empty)
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  )
}
