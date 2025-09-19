"use client"

import type React from "react"

import { useState } from "react"
import { Eye, History, Activity, Shield, Workflow, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"
import type { DocumentDetail } from "../../types/documentDetail"

interface DocumentTabsProps {
  document: DocumentDetail
  children: React.ReactNode
  defaultTab?: string
  onTabChange?: (tab: string) => void
}

export function DocumentTabs({ document, children, defaultTab = "preview", onTabChange }: DocumentTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    onTabChange?.(tab)
  }

  const getActivityCount = () => {
    return document.activities.length
  }

  const getVersionCount = () => {
    return document.versions.length
  }

  const getPermissionCount = () => {
    return document.documentPermissions.length
  }

  const getWorkflowStepCount = () => {
    return document.workflow?.steps.length || 0
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <div className="border-b bg-background px-6">
          <TabsList className="h-12 bg-transparent p-0 gap-6">
            <TabsTrigger
              value="preview"
              className="h-12 px-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>

            <TabsTrigger
              value="versions"
              className="h-12 px-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
            >
              <History className="h-4 w-4 mr-2" />
              Versions
              <Badge variant="secondary" className="ml-2 text-xs">
                {getVersionCount()}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="activity"
              className="h-12 px-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
            >
              <Activity className="h-4 w-4 mr-2" />
              Activity
              <Badge variant="secondary" className="ml-2 text-xs">
                {getActivityCount()}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="permissions"
              className="h-12 px-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
            >
              <Shield className="h-4 w-4 mr-2" />
              Permissions
              <Badge variant="secondary" className="ml-2 text-xs">
                {getPermissionCount()}
              </Badge>
            </TabsTrigger>

            {document.workflow && (
              <TabsTrigger
                value="workflow"
                className="h-12 px-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
              >
                <Workflow className="h-4 w-4 mr-2" />
                Workflow
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getWorkflowStepCount()}
                </Badge>
              </TabsTrigger>
            )}

            <TabsTrigger
              value="metadata"
              className="h-12 px-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
            >
              <Settings className="h-4 w-4 mr-2" />
              Metadata
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0">{children}</div>
      </Tabs>
    </div>
  )
}

// Individual tab content components for better organization
export function TabContent({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <TabsContent value={value} className={cn("flex-1 m-0 p-6 focus-visible:outline-none", className)}>
      {children}
    </TabsContent>
  )
}
