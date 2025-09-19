"use client"

import { CalendarClock, Files, HardDrive } from "lucide-react"
import type { Folder } from "../../data/mockData"

interface FolderStatsProps {
  folder: Folder
  totalSizeBytes?: number
}

export default function FolderStats({ folder, totalSizeBytes }: FolderStatsProps) {
  const sizeDisplay = totalSizeBytes ? formatBytes(totalSizeBytes) : undefined

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <Files className="h-3.5 w-3.5" />
        <span>{folder.documentCount} docs</span>
      </div>
      {sizeDisplay && (
        <div className="flex items-center gap-1">
          <HardDrive className="h-3.5 w-3.5" />
          <span>{sizeDisplay}</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <CalendarClock className="h-3.5 w-3.5" />
        <span>Updated {folder.modified}</span>
      </div>
    </div>
  )
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}


