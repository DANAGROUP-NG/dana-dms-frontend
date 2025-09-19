"use client"

import { Globe, Lock, Users } from "lucide-react"
import type { Folder } from "../../data/mockData"

interface FolderPermissionsProps {
  folder: Folder
  size?: "sm" | "md"
}

export default function FolderPermissions({ folder, size = "sm" }: FolderPermissionsProps) {
  const meta = folder.permissions
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4"

  if (!meta) return null

  if (meta.restrictedAccess) {
    return <Lock className={`${iconSize} text-red-500`} title="Restricted" />
  }
  if (!meta.isPublic && meta.allowSharing) {
    return <Users className={`${iconSize} text-blue-500`} title="Shared" />
  }
  return <Globe className={`${iconSize} text-gray-400`} title="Public" />
}


