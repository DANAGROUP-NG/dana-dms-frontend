"use client"

import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import { FolderIcon, FileIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { useDragAndDrop } from "../../hooks/useDragAndDrop"

export function DragPreview() {
  const { dragState } = useDragAndDrop()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }

    if (dragState.isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [dragState.isDragging])

  if (!dragState.isDragging || !dragState.dragItem) {
    return null
  }

  const preview = (
    <div
      className={cn(
        "fixed pointer-events-none z-50 bg-background border rounded-md shadow-lg p-2 flex items-center gap-2 max-w-xs",
        "transform -translate-x-1/2 -translate-y-1/2",
      )}
      style={{
        left: mousePosition.x,
        top: mousePosition.y - 20,
      }}
    >
      {dragState.dragItem.type === "folder" ? (
        <FolderIcon className="h-4 w-4 text-blue-500" />
      ) : (
        <FileIcon className="h-4 w-4 text-gray-500" />
      )}
      <span className="text-sm font-medium truncate">{dragState.dragPreview}</span>
    </div>
  )

  return createPortal(preview, document.body)
}
