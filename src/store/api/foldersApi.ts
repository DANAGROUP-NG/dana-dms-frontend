import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import type { CreateFolderData } from "../../components/folders/FolderCreator"
import type { Folder } from "../../data/mockData"

export interface FolderFilters {
  search?: string
  parentId?: string | null
  includeEmpty?: boolean
}

export interface MoveOperation {
  itemType: "document" | "folder"
  itemId: string
  targetFolderId: string | null
}

export const foldersApi = createApi({
  reducerPath: "foldersApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Folder", "FolderTree"],
  endpoints: (builder) => ({
    // Get folder tree
    getFolderTree: builder.query<Folder[], void>({
      providesTags: ["FolderTree"],
      // Mock implementation
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
        const { mockFolders } = await import("../../data/mockData")
        return { data: mockFolders }
      },
    }),

    // Get folder by ID
    getFolder: builder.query<Folder, string>({
      providesTags: (_result, _error, id) => [{ type: "Folder", id }],
      // Mock implementation
      queryFn: async (id) => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const { mockFolders } = await import("../../data/mockData")

        const findFolder = (folders: Folder[]): Folder | null => {
          for (const folder of folders) {
            if (folder.id === id) return folder
            if (folder.children) {
              const found = findFolder(folder.children)
              if (found) return found
            }
          }
          return null
        }

        const folder = findFolder(mockFolders)
        if (!folder) {
          return { error: { status: 404, data: "Folder not found" } }
        }

        return { data: folder }
      },
    }),

    // Create folder
    createFolder: builder.mutation<Folder, CreateFolderData>({
      // Optimistic update: insert into cached tree
      async onQueryStarted(folderData, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          foldersApi.util.updateQueryData("getFolderTree", undefined, (draft) => {
            const newFolder: Folder = {
              id: `tmp-${Date.now()}`,
              name: folderData.name,
              documentCount: 0,
              modified: new Date().toISOString().split("T")[0],
              created: new Date().toISOString().split("T")[0],
              color: folderData.color,
              parentId: folderData.parentId,
              permissions: folderData.permissions,
              children: [],
            }

            if (!folderData.parentId) {
              draft.push(newFolder)
              return
            }

            const addToParent = (nodes: Folder[]): boolean => {
              for (const node of nodes) {
                if (node.id === folderData.parentId) {
                  node.children = node.children || []
                  node.children.push(newFolder)
                  return true
                }
                if (node.children && addToParent(node.children)) return true
              }
              return false
            }
            addToParent(draft)
          }),
        )

        try {
          const { data } = await queryFulfilled
          // Replace temp id with real id
          dispatch(
            foldersApi.util.updateQueryData("getFolderTree", undefined, (draft) => {
              const replaceId = (nodes: Folder[]) => {
                nodes.forEach((n) => {
                  if (n.id.startsWith("tmp-") && n.name === folderData.name && n.parentId === folderData.parentId) {
                    n.id = data.id
                  }
                  if (n.children) replaceId(n.children)
                })
              }
              replaceId(draft)
            }),
          )
        } catch {
          patchResult.undo()
        }
      },
      // Mock implementation
      queryFn: async (folderData) => {
        await new Promise((resolve) => setTimeout(resolve, 800))

        const newFolder: Folder = {
          id: `folder-${Date.now()}`,
          name: folderData.name,
          documentCount: 0,
          modified: new Date().toISOString().split("T")[0],
          created: new Date().toISOString().split("T")[0],
          color: folderData.color,
          parentId: folderData.parentId,
          permissions: folderData.permissions,
          children: [],
        }

        return { data: newFolder }
      },
    }),

    // Rename folder
    renameFolder: builder.mutation<Folder, { id: string; name: string }>({
      async onQueryStarted({ id, name }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          foldersApi.util.updateQueryData("getFolderTree", undefined, (draft) => {
            const updateName = (nodes: Folder[]) => {
              nodes.forEach((n) => {
                if (n.id === id) {
                  n.name = name
                  n.modified = new Date().toISOString().split("T")[0]
                }
                if (n.children) updateName(n.children)
              })
            }
            updateName(draft)
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
      // Mock implementation
      queryFn: async ({ id, name }) => {
        await new Promise((resolve) => setTimeout(resolve, 600))
        const updatedFolder: Folder = {
          id,
          name,
          documentCount: 0,
          modified: new Date().toISOString().split("T")[0],
          color: "blue",
        }
        return { data: updatedFolder }
      },
    }),

    // Move items (documents or folders)
    moveItems: builder.mutation<void, MoveOperation[]>({
      invalidatesTags: ["FolderTree"],
      // Mock implementation
      queryFn: async (operations) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        console.log("Moving items:", operations)
        return { data: undefined }
      },
    }),

    // Delete folder
    deleteFolder: builder.mutation<void, string>({
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          foldersApi.util.updateQueryData("getFolderTree", undefined, (draft) => {
            const removeById = (nodes: Folder[]): Folder[] => {
              return nodes
                .filter((n) => n.id !== id)
                .map((n) => ({ ...n, children: n.children ? removeById(n.children) : undefined }))
            }
            const updated = removeById(draft)
            draft.splice(0, draft.length, ...updated)
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
      // Mock implementation
      queryFn: async (id) => {
        await new Promise((resolve) => setTimeout(resolve, 700))
        console.log("Deleting folder:", id)
        return { data: undefined }
      },
    }),

    // Archive folder
    archiveFolder: builder.mutation<Folder, string>({
      invalidatesTags: (_result, _error, id) => [{ type: "Folder", id }, "FolderTree"],
      // Mock implementation
      queryFn: async (id) => {
        await new Promise((resolve) => setTimeout(resolve, 600))

        const archivedFolder: Folder = {
          id,
          name: "Archived Folder",
          documentCount: 0,
          modified: new Date().toISOString().split("T")[0],
          color: "gray",
        }

        return { data: archivedFolder }
      },
    }),
  }),
})

export const {
  useGetFolderTreeQuery,
  useGetFolderQuery,
  useCreateFolderMutation,
  useRenameFolderMutation,
  useMoveItemsMutation,
  useDeleteFolderMutation,
  useArchiveFolderMutation,
} = foldersApi
