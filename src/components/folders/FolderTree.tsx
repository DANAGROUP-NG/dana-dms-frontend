"use client"

import type React from "react"

import {
    ChevronDown,
    ChevronRight,
    FolderIcon,
    FolderOpen,
    Globe,
    Lock,
    MoreHorizontal,
    Plus,
    Users,
} from "lucide-react"
import { useCallback, useMemo } from "react"
import type { Folder } from "../../data/mockData"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import FolderPermissions from "./FolderPermissions"

interface FolderTreeProps {
  folders: Folder[]
  currentFolderId?: string | null
  expandedFolders: Set<string>
  onFolderSelect: (folderId: string | null) => void
  onFolderExpand: (folderId: string, expanded: boolean) => void
  onFolderCreate: (parentId?: string) => void
  onFolderContextMenu: (folder: Folder, event: React.MouseEvent) => void
  className?: string
}

interface FolderNodeProps {
  folder: Folder
  level: number
  isExpanded: boolean
  isSelected: boolean
  onSelect: (folderId: string) => void
  onExpand: (folderId: string, expanded: boolean) => void
  onContextMenu: (folder: Folder, event: React.MouseEvent) => void
  onCreateChild: (parentId: string) => void
  expandedFolders: Set<string>
  currentFolderId?: string | null
  onInlineRename?: (folder: Folder) => void
}

function FolderNode({
  folder,
  level,
  isExpanded,
  isSelected,
  onSelect,
  onExpand,
  onContextMenu,
  onCreateChild,
  expandedFolders,
  currentFolderId,
  onInlineRename,
}: FolderNodeProps) {
  const hasChildren = folder.children && folder.children.length > 0
  const paddingLeft = level * 16 + 8

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (hasChildren) {
        onExpand(folder.id, !isExpanded)
      }
    },
    [folder.id, hasChildren, isExpanded, onExpand],
  )

  const handleSelect = useCallback(() => {
    onSelect(folder.id)
  }, [folder.id, onSelect])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onContextMenu(folder, e)
    },
    [folder, onContextMenu],
  )

  const handleCreateChild = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onCreateChild(folder.id)
    },
    [folder.id, onCreateChild],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Keyboard navigation and actions
      if (e.key === "Enter") {
        onSelect(folder.id)
      } else if (e.key === "ArrowRight") {
        if (hasChildren && !isExpanded) {
          onExpand(folder.id, true)
        }
      } else if (e.key === "ArrowLeft") {
        if (hasChildren && isExpanded) {
          onExpand(folder.id, false)
        }
      } else if (e.key.toLowerCase() === "n") {
        onCreateChild(folder.id)
      } else if (e.key === "F2") {
        onInlineRename?.(folder)
      }
    },
    [folder.id, hasChildren, isExpanded, onExpand, onSelect, onCreateChild, onInlineRename],
  )

  // Determine folder icon based on state and permissions
  const getFolderIcon = () => {
    if (isExpanded && hasChildren) {
      return <FolderOpen className="h-4 w-4" />
    }
    return <FolderIcon className="h-4 w-4" />
  }

  // Get permission indicator
  const getPermissionIcon = () => {
    // Mock permission logic - in real app, this would come from folder.permissions
    const isShared = folder.documentCount > 20 // Mock shared folder logic
    const isRestricted = folder.name.toLowerCase().includes("security") || folder.name.toLowerCase().includes("hr")

    if (isRestricted) {
      return <Lock className="h-3 w-3 text-red-500" />
    }
    if (isShared) {
      return <Users className="h-3 w-3 text-blue-500" />
    }
    return <Globe className="h-3 w-3 text-gray-400" />
  }

  return (
    <div>
      <div
        className={cn(
          "group flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-accent/50 transition-colors",
          isSelected && "bg-accent text-accent-foreground",
          "relative",
        )}
        style={{ paddingLeft }}
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 mr-1 hover:bg-accent"
          onClick={handleToggle}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          ) : (
            <div className="h-3 w-3" />
          )}
        </Button>

        {/* Folder Icon */}
        <div className="mr-2 flex-shrink-0">{getFolderIcon()}</div>

        {/* Folder Name */}
        <span className="flex-1 text-sm font-medium truncate">{folder.name}</span>

        {/* Document Count */}
        <span className="text-xs text-muted-foreground mr-2 flex-shrink-0">{folder.documentCount}</span>

        {/* Permission Indicator */}
        <div className="flex-shrink-0 mr-1">
          {folder.permissions ? <FolderPermissions folder={folder} size="sm" /> : getPermissionIcon()}
        </div>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleCreateChild}
            title="Create subfolder"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleContextMenu} title="More options">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {folder.children!.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              level={level + 1}
              isExpanded={expandedFolders.has(child.id)}
              isSelected={currentFolderId === child.id}
              onSelect={onSelect}
              onExpand={onExpand}
              onContextMenu={onContextMenu}
              onCreateChild={onCreateChild}
              expandedFolders={expandedFolders}
              currentFolderId={currentFolderId}
              onInlineRename={onInlineRename}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FolderTree({
  folders,
  currentFolderId,
  expandedFolders,
  onFolderSelect,
  onFolderExpand,
  onFolderCreate,
  onFolderContextMenu,
  className,
}: FolderTreeProps) {
  const expandedSet = useMemo(() => expandedFolders, [expandedFolders])
  const handleRootCreate = useCallback(() => {
    onFolderCreate()
  }, [onFolderCreate])

  const handleFolderSelect = useCallback(
    (folderId: string) => {
      onFolderSelect(folderId)
    },
    [onFolderSelect],
  )

  return (
    <div className={cn("space-y-1", className)} role="tree">
      {/* Root Level Header */}
      <div className="flex items-center justify-between px-2 py-1">
        <h3 className="text-sm font-semibold text-muted-foreground">Folders</h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleRootCreate} title="Create new folder">
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* All Documents (Root) */}
      <div
        className={cn(
          "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-accent/50 transition-colors",
          !currentFolderId && "bg-accent text-accent-foreground",
        )}
        onClick={() => onFolderSelect(null)}
      >
        <div className="h-6 w-6 mr-1" /> {/* Spacer for alignment */}
        <FolderIcon className="h-4 w-4 mr-2" />
        <span className="flex-1 text-sm font-medium">All Documents</span>
      </div>

      {/* Folder Tree */}
      {folders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          level={0}
          isExpanded={expandedSet.has(folder.id)}
          isSelected={currentFolderId === folder.id}
          onSelect={handleFolderSelect}
          onExpand={onFolderExpand}
          onContextMenu={onFolderContextMenu}
          onCreateChild={onFolderCreate}
          expandedFolders={expandedSet}
          currentFolderId={currentFolderId}
        />
      ))}
    </div>
  )
}
