"use client"

import { useCallback, useState } from "react"
import { useAppDispatch } from "../hooks/redux"
import { useUploadDocumentMutation } from "../store/api/documentsApi"
import { addToUploadQueue, removeFromUploadQueue, updateUploadProgress } from "../store/slices/documentsSlice"

export function useFileUpload() {
  const dispatch = useAppDispatch()
  const [uploadDocument] = useUploadDocumentMutation()
  const [isUploading, setIsUploading] = useState(false)

  const uploadFiles = useCallback(
    async (files: File[], folderId?: string) => {
      if (files.length === 0) return

      setIsUploading(true)

      try {
        const uploadPromises = files.map(async (file) => {
          const uploadId = Math.random().toString(36).substr(2, 9)

          // Add to upload queue
          dispatch(
            addToUploadQueue({
              id: uploadId,
              name: file.name,
              progress: 0,
              status: "uploading",
            }),
          )

          try {
            // Create FormData
            const formData = new FormData()
            formData.append("file", file)
            if (folderId) {
              formData.append("folderId", folderId)
            }

            // Simulate progress updates
            const progressInterval = setInterval(() => {
              dispatch(
                updateUploadProgress({
                  id: uploadId,
                  progress: Math.min(90, Math.random() * 80 + 10),
                }),
              )
            }, 500)

            // Upload file
            const result = await uploadDocument(formData).unwrap()

            // Clear progress interval
            clearInterval(progressInterval)

            // Update to completed
            dispatch(
              updateUploadProgress({
                id: uploadId,
                progress: 100,
                status: "completed",
              }),
            )

            // Remove from queue after delay
            setTimeout(() => {
              dispatch(removeFromUploadQueue(uploadId))
            }, 3000)

            return result
          } catch (error) {
            dispatch(
              updateUploadProgress({
                id: uploadId,
                progress: 0,
                status: "error",
              }),
            )
            throw error
          }
        })

        await Promise.all(uploadPromises)
      } catch (error) {
        console.error("Upload failed:", error)
        throw error
      } finally {
        setIsUploading(false)
      }
    },
    [dispatch, uploadDocument],
  )

  return {
    uploadFiles,
    isUploading,
  }
}
