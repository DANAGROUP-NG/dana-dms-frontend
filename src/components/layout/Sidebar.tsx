"use client"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  FileText,
  Folder,
  ClipboardList,
  Workflow,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { TenantSwitcher } from "./TenantSwitcher"
import type { NavigationItem } from "../../types"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
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
    id: "audit",
    label: "Audit",
    icon: "Shield",
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
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header with Tenant Switcher */}
      <div className="border-b p-4">
        {!collapsed && <TenantSwitcher />}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <span className="text-sm font-bold">D</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap]
            const isActive = location.pathname === item.path

            return (
              <Link key={item.id} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 px-3 py-2",
                    collapsed && "px-2",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Toggle Button */}
      <div className="border-t p-3">
        <Button variant="ghost" size="sm" onClick={onToggle} className="w-full justify-center">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
