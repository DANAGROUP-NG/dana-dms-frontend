"use client"

import type React from "react"
import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { Menu, Plus, Upload } from "lucide-react"
import { useState } from "react"
import { BulkActions } from "../components/documents/BulkActions"
import { DocumentContextMenu } from "../components/documents/DocumentContextMenu"
import { DocumentList } from "../components/documents/DocumentList"
import { DocumentPreview } from "../components/documents/DocumentPreview"
import { FolderBreadcrumbs } from "../components/documents/FolderBreadcrumbs"
import { UploadDropzone } from "../components/documents/UploadDropzone"
import { DragPreview } from "../components/folders/DragPreview"
import { DropZone } from "../components/folders/DropZone"
import { FolderCreator, type CreateFolderData } from "../components/folders/FolderCreator"
import { FolderMover } from "../components/folders/FolderMover"
import { FolderRenameDialog } from "../components/folders/FolderRenameDialog"
import { FolderSidebar } from "../components/folders/FolderSidebar"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import type { Document, Folder } from "../data/mockData"
import { mockDocuments } from "../data/mockData"
import { useAppDispatch, useAppSelector } from "../hooks/redux"
import { useDocumentSearch } from "../hooks/useDocumentSearch"
import type { DragItem, DropTarget } from "../hooks/useDragAndDrop"
import { useFileUpload } from "../hooks/useFileUpload"
import { useFolderMover } from "../hooks/useFolderMover"
import { useFolderNavigation } from "../hooks/useFolderNavigation"
import { useSearchHistory } from "../hooks/useSearchHistory"
import {
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useGetFolderTreeQuery,
  useMoveItemsMutation,
  useRenameFolderMutation,
} from "../store/api/foldersApi"
import { clearSelection, selectAllDocuments } from "../store/slices/documentsSlice"
import { navigateBack, navigateForward, setCurrentFolder, toggleFavoriteFolder, toggleSidebar } from "../store/slices/foldersSlice"

export function Documents() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { viewMode, selectedDocuments } = useAppSelector((state: any) => state.documents)
  const { currentFolderId, sidebarOpen } = useAppSelector((state: any) => state.folders)

  const [filters] = useState<{ search?: string }>({})
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showFolderCreator, setShowFolderCreator] = useState(false)
  const [parentFolderForCreation, setParentFolderForCreation] = useState<Folder | null>(null)
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null)

  const { addToHistory: _addToHistory } = useSearchHistory()
  const { uploadFiles } = useFileUpload()
  const folderMover = useFolderMover()

  const { data: folders = [] } = useGetFolderTreeQuery(undefined, { pollingInterval: 10000 })
  const [createFolder] = useCreateFolderMutation()
  const [renameFolder] = useRenameFolderMutation()
  const [moveItems] = useMoveItemsMutation()
  const [deleteFolder] = useDeleteFolderMutation()

  const { breadcrumbPath, canGoBack, canGoForward } = useFolderNavigation(folders)

  const documents = mockDocuments
  const filteredDocuments = useDocumentSearch(documents, filters)

  const breadcrumbItems = breadcrumbPath.map((item) => ({
    ...item,
    documentCount: folders.find((f) => f.id === item.id)?.documentCount ?? 0,
    isShared: (folders.find((f) => f.id === item.id)?.documentCount ?? 0) > 20,
  }))

  // Search helpers handled where inputs exist; keep filters local

  // selection handlers are wired in DocumentList props below

  // select all handled in DocumentList props

  const handleDocumentPreview = (document: Document) => {
    setPreviewDocument(document)
  }

  const handleDocumentAction = (action: string, document: Document) => {
    switch (action) {
      case "download":
        console.log("Download document:", document.name)
        break
      case "share":
        console.log("Share document:", document.name)
        break
      case "edit":
        console.log("Edit document:", document.name)
        break
      case "delete":
        console.log("Delete document:", document.name)
        break
    }
  }

  const handleBulkOperation = (operation: string, data?: any) => {
    const selectedDocs = documents.filter((doc) => selectedDocuments.includes(doc.id))
    console.log(`Bulk ${operation}:`, selectedDocs, data)
    dispatch(clearSelection())
  }

  // Upload handled via DropZone and upload UI

  // navigation helpers handled by breadcrumbs inline

  const handleFolderSelect = (folderId: string | null) => {
    dispatch(setCurrentFolder(folderId))
  }

  // Expansion handled in tree components

  const handleCreateFolder = (parentFolder?: Folder) => {
    setParentFolderForCreation(parentFolder || null)
    setShowFolderCreator(true)
  }

  const handleFolderCreation = async (folderData: CreateFolderData) => {
    await createFolder(folderData).unwrap()
  }

  const handleFolderRename = async (folder: Folder) => {
    setFolderToRename(folder)
  }

  const handleFolderDelete = async (folder: Folder) => {
    await deleteFolder(folder.id).unwrap()
  }

  const handleFolderShare = (folder: Folder) => {
    console.log("Share folder:", folder.name)
    // In real app, this would open a sharing dialog
  }

  const handleFolderDownload = (folder: Folder) => {
    console.log("Download folder:", folder.name)
    // In real app, this would trigger a ZIP download
  }

  const handleFolderArchive = (folder: Folder) => {
    console.log("Archive folder:", folder.name)
    // In real app, this would archive the folder
  }

  const handleFolderPermissions = (folder: Folder) => {
    console.log("Manage permissions for folder:", folder.name)
    // In real app, this would open a permissions dialog
  }

  const handleFolderContextMenu = (folder: Folder, _event: React.MouseEvent) => {
    console.log("Folder context menu:", folder)
  }

  const handleFolderMove = (folder: Folder) => {
    folderMover.moveFolder(folder)
  }

  const handleFolderCopy = (folder: Folder) => {
    folderMover.copyFolder(folder)
  }

  const handleDocumentMove = (document: Document) => {
    folderMover.moveDocument(document)
  }

  const handleDocumentCopy = (document: Document) => {
    folderMover.copyDocument(document)
  }

  const handleDragAndDrop = async (item: DragItem, target: DropTarget) => {
    const operation = {
      itemType: item.type,
      itemId: item.id,
      targetFolderId: target.id,
    }

    await moveItems([operation]).unwrap()
  }

  const handleFolderFavorite = (folder: Folder) => {
    dispatch(toggleFavoriteFolder(folder.id))
  }

  // Watch action not wired in this screen

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path)
  }

  const handleGoBack = () => {
    dispatch(navigateBack())
  }

  const handleGoForward = () => {
    dispatch(navigateForward())
  }

  // Query param dialog logic
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get("upload") === "1") setShowUpload(true)
    if (params.get("createFolder") === "1") setShowFolderCreator(true)
  }, [location.search])

  // Remove query param on dialog close
  const handleCloseUpload = () => {
    setShowUpload(false)
    const params = new URLSearchParams(location.search)
    params.delete("upload")
    navigate({ search: params.toString() }, { replace: true })
  }
  const handleCloseFolderCreator = () => {
    setShowFolderCreator(false)
    const params = new URLSearchParams(location.search)
    params.delete("createFolder")
    navigate({ search: params.toString() }, { replace: true })
  }

  return (
    // Use full-height container with safe scroll regions. Avoid using viewport height inside AppShell twice.
    <div className="flex h-full min-h-0 bg-background">
      <FolderSidebar
        folders={folders}
        currentFolderId={currentFolderId}
        isOpen={sidebarOpen}
        onClose={() => dispatch(toggleSidebar())}
        onFolderSelect={handleFolderSelect}
        onFolderCreate={(parentId?: string) => {
          if (parentId) {
            const parent = folders.find((f) => f.id === parentId) || null
            setParentFolderForCreation(parent)
          } else {
            setParentFolderForCreation(null)
          }
          setShowFolderCreator(true)
        }}
        onFolderContextMenu={handleFolderContextMenu}
        onFolderRename={handleFolderRename}
        onFolderDelete={handleFolderDelete}
        onFolderMove={handleFolderMove}
        onFolderCopy={handleFolderCopy}
        onFolderShare={handleFolderShare}
        onFolderDownload={handleFolderDownload}
        onFolderArchive={handleFolderArchive}
        onFolderFavorite={handleFolderFavorite}
        onFolderPermissions={handleFolderPermissions}
        className="hidden lg:block lg:w-80 flex-shrink-0"
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <DropZone
          folder={currentFolderId ? folders.find((f) => f.id === currentFolderId) : null}
          onMove={handleDragAndDrop}
          onUpload={(files, folderId) => uploadFiles(files, folderId)}
          className="flex-1 flex flex-col"
        >
          {/* Header stays sticky within the scroll container for better UX */}
          <div className="flex-1 min-h-0 overflow-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => dispatch(toggleSidebar())} className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                  <p className="text-muted-foreground">Manage and organize your documents</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setShowUpload(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button variant="outline" onClick={() => handleCreateFolder()}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              </div>
            </div>

            {breadcrumbItems.length > 0 && (
              <FolderBreadcrumbs
                items={breadcrumbItems}
                onNavigate={(path) => {
                  if (path === "/") {
                    handleFolderSelect(null)
                  } else {
                    const folderId = path.split("/").pop()
                    handleFolderSelect(folderId || null)
                  }
                }}
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                onGoBack={handleGoBack}
                onGoForward={handleGoForward}
                onCopyPath={handleCopyPath}
              />
            )}

            {selectedDocuments.length > 0 && (
              <BulkActions
                selectedDocuments={documents.filter((doc) => selectedDocuments.includes(doc.id))}
                folders={folders}
                onClearSelection={() => dispatch(clearSelection())}
                onBulkOperation={handleBulkOperation}
              />
            )}

            {filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                    <p className="text-muted-foreground mb-4">
                      {filters.search || Object.keys(filters).length > 1
                        ? "Try adjusting your search or filters"
                        : "Upload your first document to get started"}
                    </p>
                    <Button onClick={() => setShowUpload(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((document) => (
                  <DocumentContextMenu
                    key={document.id}
                    document={document}
                    isFavorited={false}
                    onPreview={handleDocumentPreview}
                    onDownload={(doc) => handleDocumentAction("download", doc)}
                    onShare={(doc) => handleDocumentAction("share", doc)}
                    onEdit={(doc) => handleDocumentAction("edit", doc)}
                    onMove={handleDocumentMove}
                    onCopy={handleDocumentCopy}
                    onTag={(doc) => console.log("Tag document:", doc)}
                    onArchive={(doc) => console.log("Archive document:", doc)}
                    onDelete={(doc) => handleDocumentAction("delete", doc)}
                    onFavorite={(doc) => console.log("Favorite document:", doc)}
                    onViewHistory={(doc) => console.log("View history:", doc)}
                    onPermissions={(doc) => console.log("Permissions:", doc)}
                  >
                    <div className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer h-full">
                      <h3 className="font-medium truncate">{document.name}</h3>
                      <p className="text-sm text-muted-foreground">{document.size}</p>
                    </div>
                  </DocumentContextMenu>
                ))}
              </div>
            ) : (
              <DocumentList
                documents={filteredDocuments}
                selectedDocuments={selectedDocuments}
                onSelectDocument={(id) => {
                  const isSelected = selectedDocuments.includes(id)
                  const next = isSelected
                    ? selectedDocuments.filter((x: string) => x !== id)
                    : [...selectedDocuments, id]
                  dispatch(selectAllDocuments(next))
                }}
                onSelectAll={(ids: string[]) => dispatch(selectAllDocuments(ids))}
                onPreview={handleDocumentPreview}
                onDownload={(doc) => handleDocumentAction("download", doc)}
                onShare={(doc) => handleDocumentAction("share", doc)}
                onDelete={(doc) => handleDocumentAction("delete", doc)}
                onEdit={(doc) => handleDocumentAction("edit", doc)}
                onSort={() => {}}
                sortBy={"name"}
                sortOrder={"asc"}
              />
            )}
          </div>
        </DropZone>
      </div>

      <FolderCreator
        isOpen={showFolderCreator}
        onClose={handleCloseFolderCreator}
        onCreateFolder={handleFolderCreation}
        parentFolder={parentFolderForCreation}
        existingFolders={folders}
      />

      {/* Upload Dialog (if you have one) */}
      {showUpload && (
        <UploadDropzone onUpload={uploadFiles} onClose={handleCloseUpload} />
      )}

      {/* Document Preview Dialog */}
      {previewDocument && (
        <DocumentPreview
          document={previewDocument}
          isOpen={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
          onDownload={(doc) => handleDocumentAction("download", doc)}
          onShare={(doc) => handleDocumentAction("share", doc)}
          onEdit={(doc) => handleDocumentAction("edit", doc)}
          onDelete={(doc) => handleDocumentAction("delete", doc)}
        />
      )}

      <FolderRenameDialog
        folder={folderToRename}
        isOpen={!!folderToRename}
        onClose={() => setFolderToRename(null)}
        onRename={async (newName) => {
          if (folderToRename) {
            await renameFolder({ id: folderToRename.id, name: newName }).unwrap()
          }
        }}
        existingFolders={folders}
      />

      <FolderMover
        open={folderMover.isOpen}
        onOpenChange={folderMover.closeMover}
        items={folderMover.items}
        operation={folderMover.operation}
        onComplete={() => {
          // Refresh data or show success message
          console.log("Move/copy operation completed")
        }}
      />

      <DragPreview />
    </div>
  )
}
