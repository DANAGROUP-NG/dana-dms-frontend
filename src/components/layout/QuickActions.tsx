"use client"

import { FolderPlus, Plus, Upload } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

export function QuickActions() {
  const navigate = useNavigate()
  const actions = [
    {
      id: "upload-document",
      label: "Upload Document",
      icon: Upload,
      action: () => navigate("/documents?upload=1"),
    },
    {
      id: "create-folder",
      label: "Create Folder",
      icon: FolderPlus,
      action: () => navigate("/documents?createFolder=1"),
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <DropdownMenuItem key={action.id} onClick={action.action}>
              <Icon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
