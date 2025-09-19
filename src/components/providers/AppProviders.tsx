import { Provider } from "react-redux"
import { RouterProvider } from "react-router-dom"
import { store } from "../../store"
import { router } from "../../router"
import { ThemeProvider } from "./ThemeProvider"
import { Toaster } from "../ui/sonner"

export function AppProviders() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="dms-ui-theme">
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </Provider>
  )
}
