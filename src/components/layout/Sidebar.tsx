"use client"

import { useState, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Folder,
  LayoutDashboard,
  Shield,
  Workflow,
  FileSearch,
  Search,
  X,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import type { NavigationItem } from "../../types"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { TenantSwitcher } from "./TenantSwitcher"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    path: "/",
  },
  {
    id: "documents",
    label: "Documents",
    icon: "FileText",
    path: "/documents",
    badge: 12,
  },
  {
    id: "folders",
    label: "Folders",
    icon: "Folder",
    path: "/folders",
  },
  {
    id: "assignments",
    label: "Assignments",
    icon: "ClipboardList",
    path: "/assignments",
    badge: 3,
  },
  {
    id: "workflows",
    label: "Workflows",
    icon: "Workflow",
    path: "/workflows",
  },
  {
    id: "permissions",
    label: "Permissions",
    icon: "Shield",
    path: "/permissions",
  },
  {
    id: "audit",
    label: "Audit",
    icon: "FileSearch",
    path: "/audit",
  },
]

const iconMap = {
  LayoutDashboard,
  FileText,
  Folder,
  ClipboardList,
  Workflow,
  Shield,
  FileSearch,
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")

  // Filter navigation items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return navigationItems
    const query = searchQuery.toLowerCase()
    return navigationItems.filter(
      (item) => item.label.toLowerCase().includes(query) || item.id.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Check if a path is active (handles nested routes)
  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && onMobileClose && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
          "md:relative md:z-auto md:translate-x-0",
          collapsed ? "w-16" : "w-64",
          // Mobile: hide by default if mobile menu is available but closed
          onMobileClose && typeof mobileOpen !== "undefined" && !mobileOpen && "-translate-x-full",
          // Mobile: show when mobileOpen is true
          typeof mobileOpen !== "undefined" && mobileOpen && "translate-x-0"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header Section */}
        <div className="flex h-16 min-h-16 items-center border-b border-sidebar-border px-4">
          {!collapsed ? (
            <div className="flex w-full items-center justify-between">
              <TenantSwitcher />
              {/* Mobile Close Button */}
              {onMobileClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMobileClose}
                  className="md:hidden h-8 w-8 text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-hover-foreground"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent">
              <span className="text-lg font-bold text-sidebar-accent-foreground">D</span>
            </div>
          )}
        </div>

        {/* Search Section - Only visible when not collapsed */}
        {!collapsed && (
          <div className="border-b border-sidebar-border px-3 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/60" />
              <Input
                type="search"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 bg-sidebar-hover/50 border-sidebar-border pl-9 pr-3 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus-visible:border-sidebar-ring focus-visible:ring-sidebar-ring/20"
                aria-label="Search navigation menu"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-hover"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3" role="navigation" aria-label="Main menu">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap]
                const isActive = isActivePath(item.path)

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => {
                      // Close mobile menu when navigating
                      if (onMobileClose) {
                        onMobileClose()
                      }
                    }}
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "group relative w-full justify-start gap-3 px-3 py-2.5 h-auto min-h-[44px] rounded-lg transition-all duration-200",
                        "text-sidebar-foreground/90 hover:bg-sidebar-hover hover:text-sidebar-foreground",
                        collapsed && "justify-center px-2",
                        isActive &&
                          "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm hover:bg-sidebar-accent/90",
                        !isActive && "hover:bg-sidebar-hover"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {/* Active indicator bar */}
                      {isActive && !collapsed && (
                        <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-accent-foreground" />
                      )}

                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-transform",
                          isActive && "text-sidebar-accent-foreground",
                          !isActive && "text-sidebar-foreground/80 group-hover:text-sidebar-foreground"
                        )}
                        aria-hidden="true"
                      />

                      {!collapsed && (
                        <>
                          <span
                            className={cn(
                              "flex-1 truncate text-left text-sm leading-tight",
                              isActive && "font-semibold"
                            )}
                          >
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={cn(
                                "ml-auto rounded-full px-2 py-0.5 text-xs font-medium leading-none",
                                isActive
                                  ? "bg-sidebar-accent-foreground/20 text-sidebar-accent-foreground"
                                  : "bg-sidebar-primary/20 text-sidebar-primary"
                              )}
                              aria-label={`${item.badge} items`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}

                      {/* Tooltip for collapsed state */}
                      {collapsed && (
                        <span className="pointer-events-none absolute left-full z-50 ml-2 hidden rounded-md bg-sidebar-accent px-2 py-1 text-xs font-medium text-sidebar-accent-foreground opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                          {item.label}
                          {item.badge && ` (${item.badge})`}
                        </span>
                      )}
                    </Button>
                  </Link>
                )
              })
            ) : (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-sidebar-foreground/60">No menu items found</p>
              </div>
            )}
          </nav>
        </ScrollArea>

        {/* Footer Section - Toggle Button */}
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full justify-center gap-2 text-sidebar-foreground/80 hover:bg-sidebar-hover hover:text-sidebar-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  )
}
