"use client"

import { ArrowLeft, ArrowRight, ChevronRight, Copy, ExternalLink, Folder, Home, MoreHorizontal } from "lucide-react"
import { } from "react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

interface BreadcrumbItem {
  id: string
  name: string
  path: string
  documentCount?: number
  isShared?: boolean
  permissions?: {
    canRead: boolean
    canWrite: boolean
  }
}

interface FolderBreadcrumbsProps {
  items: BreadcrumbItem[]
  onNavigate: (path: string) => void
  canGoBack?: boolean
  canGoForward?: boolean
  onGoBack?: () => void
  onGoForward?: () => void
  onCopyPath?: (path: string) => void
  onOpenInNewTab?: (path: string) => void
  className?: string
}

export function FolderBreadcrumbs({
  items,
  onNavigate,
  canGoBack = false,
  canGoForward = false,
  onGoBack,
  onGoForward,
  onCopyPath,
  onOpenInNewTab,
  className,
}: FolderBreadcrumbsProps) {
  const maxVisibleItems = 4
  const shouldCollapse = items.length > maxVisibleItems
  const visibleItems = shouldCollapse ? items.slice(Math.max(0, items.length - maxVisibleItems + 1)) : items

  const currentPath = items.length > 0 ? items[items.length - 1].path : "/"
  const fullPath = items.map((item) => item.name).join(" / ")

  return (
    <TooltipProvider>
      <nav className={cn("flex items-center space-x-1 text-sm", className)}>
        <div className="flex items-center space-x-1 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onGoBack} disabled={!canGoBack} className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go back</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onGoForward} disabled={!canGoForward} className="h-8 w-8 p-0">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go forward</TooltipContent>
          </Tooltip>
        </div>

        {/* Home Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("/")}
              className={cn(
                "h-8 px-2 hover:text-foreground transition-colors",
                items.length === 0 && "text-foreground font-medium",
              )}
            >
              <Home className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>All Documents</TooltipContent>
        </Tooltip>

        {shouldCollapse && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {items.slice(0, items.length - maxVisibleItems + 1).map((item) => (
                  <DropdownMenuItem key={item.id} onClick={() => onNavigate(item.path)}>
                    <Folder className="h-4 w-4 mr-2" />
                    {item.name}
                    {item.documentCount !== undefined && (
                      <span className="ml-auto text-xs text-muted-foreground">{item.documentCount}</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {/* Breadcrumb Items */}
        {visibleItems.map((item, index) => (
          <div key={item.id} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(item.path)}
                  className={cn(
                    "h-8 px-2 hover:text-foreground transition-colors max-w-32 truncate",
                    index === visibleItems.length - 1 && "text-foreground font-medium",
                  )}
                >
                  <Folder className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                  {item.documentCount !== undefined && (
                    <span className="ml-1 text-xs text-muted-foreground">({item.documentCount})</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-medium">{item.name}</div>
                  {item.documentCount !== undefined && (
                    <div className="text-xs text-muted-foreground">{item.documentCount} documents</div>
                  )}
                  {item.isShared && <div className="text-xs text-blue-400">Shared folder</div>}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}

        {(onCopyPath || onOpenInNewTab) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onCopyPath && (
                <DropdownMenuItem onClick={() => onCopyPath(fullPath)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy path
                </DropdownMenuItem>
              )}
              {onOpenInNewTab && (
                <DropdownMenuItem onClick={() => onOpenInNewTab(currentPath)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in new tab
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <span className="text-xs text-muted-foreground">
                  {items.length} level{items.length !== 1 ? "s" : ""} deep
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>
    </TooltipProvider>
  )
}
