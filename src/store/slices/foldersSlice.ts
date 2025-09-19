import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface FoldersState {
  currentFolderId: string | null
  expandedFolders: string[]
  navigationHistory: string[]
  historyIndex: number
  sidebarOpen: boolean
  favoritefolders: string[]
  watchedFolders: string[]
  recentFolders: string[]
}

const initialState: FoldersState = {
  currentFolderId: null,
  expandedFolders: [],
  navigationHistory: ["/"],
  historyIndex: 0,
  sidebarOpen: false,
  favoritefolders: [],
  watchedFolders: [],
  recentFolders: [],
}

const foldersSlice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    setCurrentFolder: (state, action: PayloadAction<string | null>) => {
      const newPath = action.payload ? `/folder/${action.payload}` : "/"
      const newHistory = state.navigationHistory.slice(0, state.historyIndex + 1)
      newHistory.push(newPath)

      state.currentFolderId = action.payload
      state.navigationHistory = newHistory
      state.historyIndex = newHistory.length - 1
      if (action.payload) {
        // track recent folders (unique, max 8)
        const id = action.payload
        state.recentFolders = [id, ...state.recentFolders.filter((x) => x !== id)].slice(0, 8)
      }
    },

    navigateBack: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex -= 1
        const path = state.navigationHistory[state.historyIndex]
        state.currentFolderId = path === "/" ? null : path.split("/").pop() || null
      }
    },

    navigateForward: (state) => {
      if (state.historyIndex < state.navigationHistory.length - 1) {
        state.historyIndex += 1
        const path = state.navigationHistory[state.historyIndex]
        state.currentFolderId = path === "/" ? null : path.split("/").pop() || null
      }
    },

    toggleFolderExpansion: (state, action: PayloadAction<string>) => {
      const folderId = action.payload
      const index = state.expandedFolders.indexOf(folderId)

      if (index > -1) {
        state.expandedFolders.splice(index, 1)
      } else {
        state.expandedFolders.push(folderId)
      }
    },

    setExpandedFolders: (state, action: PayloadAction<string[]>) => {
      state.expandedFolders = action.payload
    },

    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },

    toggleFavoriteFolder: (state, action: PayloadAction<string>) => {
      const folderId = action.payload
      const index = state.favoritefolders.indexOf(folderId)

      if (index > -1) {
        state.favoritefolders.splice(index, 1)
      } else {
        state.favoritefolders.push(folderId)
      }
    },

    toggleWatchFolder: (state, action: PayloadAction<string>) => {
      const folderId = action.payload
      const index = state.watchedFolders.indexOf(folderId)

      if (index > -1) {
        state.watchedFolders.splice(index, 1)
      } else {
        state.watchedFolders.push(folderId)
      }
    },

    clearRecentFolders: (state) => {
      state.recentFolders = []
    },
  },
})

export const {
  setCurrentFolder,
  navigateBack,
  navigateForward,
  toggleFolderExpansion,
  setExpandedFolders,
  toggleSidebar,
  setSidebarOpen,
  toggleFavoriteFolder,
  toggleWatchFolder,
  clearRecentFolders,
} = foldersSlice.actions

export default foldersSlice.reducer
