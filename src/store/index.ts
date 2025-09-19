import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { apiSlice } from "./api/apiSlice"
import { documentsApi } from "./api/documentsApi"
import { foldersApi } from "./api/foldersApi"
import authSlice from "./slices/authSlice"
import documentsSlice from "./slices/documentsSlice"
import foldersSlice from "./slices/foldersSlice"
import savedSearchesSlice from "./slices/savedSearchesSlice"
import reportsSlice from "./slices/reportsSlice"

export const store = configureStore({
  reducer: {
    auth: authSlice,
    documents: documentsSlice,
    folders: foldersSlice,
    savedSearches: savedSearchesSlice,
    reports: reportsSlice,
    [foldersApi.reducerPath]: foldersApi.reducer,
    [documentsApi.reducerPath]: documentsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    })
      .concat(apiSlice.middleware)
      .concat(foldersApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
