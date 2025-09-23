"use client"

import { ArrowLeft, Maximize2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ActivityTimeline } from "../components/documents/ActivityTimeline"
import { DocumentHeader } from "../components/documents/DocumentHeader"
import { DocumentPreview } from "../components/documents/DocumentPreview"
import { DocumentTabs, TabContent } from "../components/documents/DocumentTabs"
import { MetadataEditor } from "../components/documents/MetadataEditor"
import { PermissionsPanel } from "../components/documents/PermissionsPanel"
import { VersionHistory } from "../components/documents/VersionHistory"
import { WorkflowStatus } from "../components/documents/WorkflowStatus"
import { Button } from "../components/ui/button"
import { mockDocumentDetail } from "../data/mockDocumentDetail"
import type { DocumentDetail, DocumentPermission, DocumentVersion, RelatedDocument } from "../types/documentDetail"

export function DocumentDetailView() {
  const navigate = useNavigate()
  useParams()
  const [document] = useState(mockDocumentDetail)
  const [isFavorited, setIsFavorited] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  // Open preview when preview tab is active
  useEffect(() => {
    if (activeTab === "preview") {
      setIsPreviewOpen(true)
    }
  }, [activeTab])

  // Event handlers
  const handleOpenPreview = () => {
    setIsPreviewOpen(true)
  }

  const handleDownload = () => {
    console.log("Downloading document:", document.name)
    // Implement download logic
  }

  const handleShare = () => {
    console.log("Sharing document:", document.name)
    // Implement share logic
  }

  const handleEdit = () => {
    console.log("Editing document:", document.name)
    // Implement edit logic
  }

  const handleDelete = () => {
    console.log("Deleting document:", document.name)
    // Implement delete logic
  }

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
    console.log("Toggled favorite for:", document.name)
  }

  const handleBack = () => {
    navigate("/documents")
  }

  const handlePreviewRelated = (relatedDoc: RelatedDocument) => {
    console.log("Previewing related document:", relatedDoc.name)
  }

  const handleDownloadRelated = (relatedDoc: RelatedDocument) => {
    console.log("Downloading related document:", relatedDoc.name)
  }

  // Version handlers
  const handleDownloadVersion = (version: DocumentVersion) => {
    console.log("Downloading version:", version.version)
  }

  const handlePreviewVersion = (version: DocumentVersion) => {
    console.log("Previewing version:", version.version)
  }

  const handleRestoreVersion = (version: DocumentVersion) => {
    console.log("Restoring version:", version.version)
  }

  const handleCompareVersions = (version1: DocumentVersion, version2: DocumentVersion) => {
    console.log("Comparing versions:", version1.version, "and", version2.version)
  }

  // Permissions handlers
  const handleAddUser = () => {
    console.log("Adding user to document permissions")
  }

  const handleEditPermissions = (permission: DocumentPermission) => {
    console.log("Editing permissions for:", permission.userName)
  }

  const handleRemoveUser = (permission: DocumentPermission) => {
    console.log("Removing user:", permission.userName)
  }

  // Metadata handlers
  const handleSaveMetadata = (metadata: Partial<DocumentDetail>) => {
    console.log("Saving metadata:", metadata)
  }

  const handleOpenRelated = (relatedDoc: RelatedDocument) => {
    navigate(`/documents/${relatedDoc.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="border-b bg-card">
        <div className="p-4">
          <Button onClick={handleBack} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
        </div>
      </div>

      {/* Document Header */}
      <DocumentHeader
        document={document}
        onDownload={handleDownload}
        onShare={handleShare}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFavorite={handleFavorite}
        isFavorited={isFavorited}
      />

      {/* Main Content with Tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        <DocumentTabs document={document} defaultTab={activeTab} onTabChange={setActiveTab}>
          {/* Preview Tab */}
          <TabContent value="preview">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="p-4 border rounded-lg bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Document Preview</h3>
                    <Button onClick={handleOpenPreview} variant="outline" size="sm">
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Open Preview
                    </Button>
                  </div>
                  
                  {/* Thumbnail preview that opens the full preview when clicked */}
                  <div 
                    className="cursor-pointer flex items-center justify-center p-8 bg-muted/20 rounded-md" 
                    onClick={handleOpenPreview}
                  >
                    {document.thumbnail ? (
                      <img 
                        src={document.thumbnail} 
                        alt={document.name} 
                        className="max-h-[400px] object-contain" 
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-6xl mb-4">📄</div>
                        <p className="text-sm text-muted-foreground">Click to preview document</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Full document preview dialog */}
                <DocumentPreview
                  document={{...document, version: document.currentVersion}}
                  isOpen={isPreviewOpen}
                  onClose={() => setIsPreviewOpen(false)}
                  onDownload={() => handleDownload()}
                  onShare={() => handleShare()}
                  onEdit={() => handleEdit()}
                  onDelete={() => handleDelete()}
                />
              </div>
              {/* <div className="lg:col-span-1">
                <RelatedDocuments
                  relatedDocuments={document.relatedDocuments}
                  onPreview={handlePreviewRelated}
                  onDownload={handleDownloadRelated}
                  onOpen={handleOpenRelated}
                />
              </div> */}
            </div>
          </TabContent>

          {/* Versions Tab */}
          <TabContent value="versions">
            <VersionHistory
              versions={document.versions}
              onDownloadVersion={handleDownloadVersion}
              onPreviewVersion={handlePreviewVersion}
              onRestoreVersion={handleRestoreVersion}
              onCompareVersions={handleCompareVersions}
            />
          </TabContent>

          {/* Activity Tab */}
          <TabContent value="activity">
            <ActivityTimeline activities={document.activities} />
          </TabContent>

          {/* Permissions Tab */}
          <TabContent value="permissions">
            <PermissionsPanel
              permissions={document.documentPermissions}
              canManagePermissions={document.permissions.canWrite}
              onAddUser={handleAddUser}
              onEditPermissions={handleEditPermissions}
              onRemoveUser={handleRemoveUser}
            />
          </TabContent>

          {/* Workflow Tab */}
          {document.workflow && (
            <TabContent value="workflow">
              <WorkflowStatus workflow={document.workflow} />
            </TabContent>
          )}

          {/* Metadata Tab */}
          <TabContent value="metadata">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MetadataEditor
                  document={document}
                  canEdit={document.permissions.canWrite}
                  onSave={handleSaveMetadata}
                />
              </div>
              {/* <div className="lg:col-span-1">
                <RelatedDocuments
                  relatedDocuments={document.relatedDocuments}
                  onPreview={handlePreviewRelated}
                  onDownload={handleDownloadRelated}
                  onOpen={handleOpenRelated}
                />
              </div> */}
            </div>
          </TabContent>
        </DocumentTabs>
      </div>
    </div>
  )
}
