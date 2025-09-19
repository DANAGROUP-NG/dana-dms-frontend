"use client"

import type React from "react"

import { useState } from "react"
import { ChevronRight, Folder, FileText, Crown, User, Info, Lock, Unlock, ArrowDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { cn } from "../../lib/utils"

export interface InheritanceNode {
  id: string
  name: string
  type: "folder" | "document" | "role" | "user"
  permissions: {
    [key: string]: boolean
  }
  isInherited: boolean
  source?: string
  children?: InheritanceNode[]
  level: number
}

interface InheritanceIndicatorProps {
  rootNode: InheritanceNode
  currentResourceId: string
  onNodeClick?: (node: InheritanceNode) => void
  showPermissionDetails?: boolean
  className?: string
}

// Mock inheritance data
const mockInheritanceTree: InheritanceNode = {
  id: "root",
  name: "Company Root",
  type: "folder",
  permissions: {
    view: true,
    edit: false,
    share: false,
    delete: false,
    manage: true,
  },
  isInherited: false,
  level: 0,
  children: [
    {
      id: "marketing",
      name: "Marketing Department",
      type: "folder",
      permissions: {
        view: true,
        edit: true,
        share: true,
        delete: false,
        manage: false,
      },
      isInherited: true,
      source: "Company Root",
      level: 1,
      children: [
        {
          id: "campaigns",
          name: "Campaigns Folder",
          type: "folder",
          permissions: {
            view: true,
            edit: true,
            share: true,
            delete: true,
            manage: false,
          },
          isInherited: true,
          source: "Marketing Department",
          level: 2,
          children: [
            {
              id: "current-doc",
              name: "Q4 Campaign Strategy.pdf",
              type: "document",
              permissions: {
                view: true,
                edit: true,
                share: false,
                delete: false,
                manage: false,
              },
              isInherited: true,
              source: "Campaigns Folder",
              level: 3,
            },
          ],
        },
      ],
    },
  ],
}

export function InheritanceIndicator({
  rootNode = mockInheritanceTree,
  currentResourceId = "current-doc",
  onNodeClick,
  showPermissionDetails = true,
  className,
}: InheritanceIndicatorProps) {
  const [expandedNodes, setExpandedNodes] = useState<string[]>(["root", "marketing", "campaigns"])

  const getNodeIcon = (type: InheritanceNode["type"]) => {
    switch (type) {
      case "folder":
        return Folder
      case "document":
        return FileText
      case "role":
        return Crown
      case "user":
        return User
      default:
        return FileText
    }
  }

  const getNodeColor = (type: InheritanceNode["type"], isInherited: boolean) => {
    const baseColors = {
      folder: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
      document: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
      role: "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300",
      user: "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300",
    }

    return isInherited ? cn(baseColors[type], "opacity-70") : baseColors[type]
  }

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes((prev) => (prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]))
  }

  const getPermissionSummary = (permissions: { [key: string]: boolean }) => {
    const granted = Object.entries(permissions)
      .filter(([_, value]) => value)
      .map(([key]) => key)
    return granted.length > 0 ? granted.join(", ") : "No permissions"
  }

  const getEffectivePermissions = (node: InheritanceNode): { [key: string]: boolean } => {
    // In a real implementation, this would calculate the effective permissions
    // by combining inherited and explicit permissions
    return node.permissions
  }

  const renderNode = (node: InheritanceNode): React.ReactNode => {
    const NodeIcon = getNodeIcon(node.type)
    const isExpanded = expandedNodes.includes(node.id)
    const hasChildren = node.children && node.children.length > 0
    const isCurrentResource = node.id === currentResourceId
    const effectivePermissions = getEffectivePermissions(node)

    return (
      <div key={node.id} className="space-y-2">
        <Collapsible open={isExpanded} onOpenChange={() => toggleNodeExpansion(node.id)}>
          <div
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg border transition-all duration-200",
              isCurrentResource && "ring-2 ring-primary bg-primary/5",
              node.isInherited && "border-dashed",
              "hover:bg-muted/50",
            )}
            style={{ marginLeft: `${node.level * 20}px` }}
          >
            {hasChildren && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
                </Button>
              </CollapsibleTrigger>
            )}

            {!hasChildren && <div className="w-6" />}

            <div className={cn("p-1.5 rounded", getNodeColor(node.type, node.isInherited))}>
              <NodeIcon className="h-3 w-3" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-medium truncate", isCurrentResource && "text-primary")}>
                  {node.name}
                </span>

                {node.isInherited && (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          Inherited
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Inherited from {node.source}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {!node.isInherited && (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <Unlock className="h-3 w-3 text-green-600" />
                        <Badge variant="outline" className="text-xs text-green-600">
                          Explicit
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Explicitly set permissions</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {isCurrentResource && (
                  <Badge variant="secondary" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>

              {showPermissionDetails && (
                <div className="mt-1">
                  <p className="text-xs text-muted-foreground">{getPermissionSummary(effectivePermissions)}</p>
                </div>
              )}
            </div>

            {onNodeClick && (
              <Button variant="ghost" size="sm" onClick={() => onNodeClick(node)} className="h-6 w-6 p-0">
                <Info className="h-3 w-3" />
              </Button>
            )}
          </div>

          {hasChildren && (
            <CollapsibleContent className="space-y-2">
              {node.children!.map((child) => renderNode(child))}
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDown className="h-5 w-5" />
            Permission Inheritance
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            View how permissions flow from parent folders to this document
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">{renderNode(rootNode)}</div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Legend</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="h-3 w-3 text-muted-foreground" />
                <span>Inherited permissions</span>
              </div>
              <div className="flex items-center gap-2">
                <Unlock className="h-3 w-3 text-green-600" />
                <span>Explicit permissions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-dashed rounded" />
                <span>Inherited from parent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border rounded" />
                <span>Direct permissions</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
