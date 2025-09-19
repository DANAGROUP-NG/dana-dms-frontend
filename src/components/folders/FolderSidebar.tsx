"use client"

import type React from "react"

import { Search, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { Folder } from "../../data/mockData"
import { useAppDispatch, useAppSelector } from "../../hooks/redux"
import { cn } from "../../lib/utils"
import { setExpandedFolders, toggleFolderExpansion } from "../../store/slices/foldersSlice"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { FolderContextMenu } from "./FolderContextMenu"
import FolderPermissions from "./FolderPermissions"
import FolderStats from "./FolderStats"
import { FolderTree } from "./FolderTree"

interface FolderSidebarProps {
  folders: Folder[]
  currentFolderId?: string | null
  isOpen: boolean
  onClose: () => void
  onFolderSelect: (folderId: string | null) => void
  onFolderCreate: (parentId?: string) => void
  onFolderContextMenu: (folder: Folder, event: React.MouseEvent) => void
  onFolderRename?: (folder: Folder) => void
  onFolderDelete?: (folder: Folder) => void
  onFolderMove?: (folder: Folder) => void
  onFolderCopy?: (folder: Folder) => void
  onFolderShare?: (folder: Folder) => void
  onFolderDownload?: (folder: Folder) => void
  onFolderArchive?: (folder: Folder) => void
  onFolderFavorite?: (folder: Folder) => void
  onFolderPermissions?: (folder: Folder) => void
  className?: string
}

export function FolderSidebar({
  folders,
  currentFolderId,
  isOpen,
  onClose,
  onFolderSelect,
  onFolderCreate,
  onFolderContextMenu,
  onFolderRename = () => {},
  onFolderDelete = () => {},
  onFolderMove = () => {},
  onFolderCopy = () => {},
  onFolderShare = () => {},
  onFolderDownload = () => {},
  onFolderArchive = () => {},
  onFolderFavorite = () => {},
  onFolderPermissions = () => {},
  className,
}: FolderSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const dispatch = useAppDispatch()
  const expandedIds = useAppSelector((s: any) => s.folders.expandedFolders) as string[]
  const recentFolderIds = useAppSelector((s: any) => s.folders.recentFolders) as string[]
  const expandedFolders = useMemo(() => new Set(expandedIds), [expandedIds])

  // Load expanded state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("folder-tree-expanded")
    if (saved) {
      try {
        const ids = JSON.parse(saved)
        dispatch(setExpandedFolders(ids))
      } catch (error) {
        console.error("Failed to load expanded folders:", error)
      }
    }
  }, [dispatch])

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem("folder-tree-expanded", JSON.stringify(expandedIds))
  }, [expandedIds])

  const handleFolderExpand = (folderId: string, _expanded: boolean) => {
    dispatch(toggleFolderExpansion(folderId))
  }

  const handleFolderContextMenuWithActions = (folder: Folder, event: React.MouseEvent) => {
    // Call the original handler for any custom logic
    onFolderContextMenu(folder, event)
  }

  // Filter folders based on search query
  const filterFolders = (folders: Folder[], query: string): Folder[] => {
    if (!query.trim()) return folders

    const filtered: Folder[] = []

    for (const folder of folders) {
      const matchesQuery = folder.name.toLowerCase().includes(query.toLowerCase())
      const filteredChildren = folder.children ? filterFolders(folder.children, query) : []

      if (matchesQuery || filteredChildren.length > 0) {
        filtered.push({
          ...folder,
          children: filteredChildren.length > 0 ? filteredChildren : folder.children,
        })
      }
    }

    return filtered
  }

  const filteredFolders = filterFolders(folders, searchQuery)

  const renderFolderTreeWithContextMenu = () => (
    <div className="space-y-1">
      {filteredFolders.map((folder) => (
        <FolderContextMenu
          key={folder.id}
          folder={folder}
          onRename={onFolderRename}
          onDelete={onFolderDelete}
          onMove={onFolderMove}
          onCopy={onFolderCopy}
          onShare={onFolderShare}
          onCreateSubfolder={(parentFolder) => onFolderCreate(parentFolder.id)}
          onDownload={onFolderDownload}
          onArchive={onFolderArchive}
          onFavorite={onFolderFavorite}
          onPermissions={onFolderPermissions}
        >
          <div className="w-full">
            <FolderTree
              folders={[folder]}
              currentFolderId={currentFolderId}
              expandedFolders={expandedFolders}
              onFolderSelect={onFolderSelect}
              onFolderExpand={handleFolderExpand}
              onFolderCreate={onFolderCreate}
              onFolderContextMenu={handleFolderContextMenuWithActions}
            />
            <div className="pl-6 pr-2 pb-2 flex items-center gap-2">
              <FolderPermissions folder={folder} size="sm" />
              <FolderStats folder={folder} />
            </div>
          </div>
        </FolderContextMenu>
      ))}
    </div>
  )

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-background border-r z-50 transform transition-transform duration-200 ease-in-out lg:relative lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className,
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Folders</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Folder Tree */}
          <ScrollArea className="flex-1 p-4">
            {/* All Documents (Root) */}
            <div
              className={cn(
                "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-accent/50 transition-colors mb-2",
                !currentFolderId && "bg-accent text-accent-foreground",
              )}
              onClick={() => onFolderSelect(null)}
            >
              <div className="h-6 w-6 mr-1" /> {/* Spacer for alignment */}
              <span className="flex-1 text-sm font-medium">All Documents</span>
            </div>

            {/* Folder Tree with Context Menus */}
            {renderFolderTreeWithContextMenu()}
          </ScrollArea>

          {/* Footer Stats */}
          <div className="p-4 border-t text-xs text-muted-foreground">
            <div className="space-y-1">
              <div>Total Folders: {folders.length}</div>
              <div>Current: {currentFolderId ? "Selected Folder" : "All Documents"}</div>
              {recentFolderIds.length > 0 && (
                <div className="pt-2">
                  <div className="font-medium text-foreground mb-1">Recent</div>
                  <div className="space-y-1">
                    {recentFolderIds.slice(0, 6).map((id) => {
                      const f = folders.find((x) => x.id === id)
                      if (!f) return null
                      return (
                        <div
                          key={id}
                          className={cn(
                            "flex items-center py-1 px-2 rounded cursor-pointer hover:bg-accent/50",
                            currentFolderId === id && "bg-accent text-accent-foreground",
                          )}
                          onClick={() => onFolderSelect(id)}
                        >
                          <span className="truncate text-xs">{f.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
