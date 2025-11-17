import { createBrowserRouter, Navigate, useNavigate, useParams } from "react-router-dom"
import { AuthGuard } from "../components/auth/AuthGuard"
import { LoginForm } from "../components/auth/LoginForm"
import { AppShell } from "../components/layout/AppShell"
import { ErrorBoundary } from "../components/ui/error-boundary"
import { Assignments } from "../pages/Assignments"
import { Audit } from "../pages/Audit"
import { Dashboard } from "../pages/Dashboard"
import { DocumentDetailView } from "../pages/DocumentDetailView"
import { Documents } from "../pages/Documents"
import { Folders } from "../pages/Folders"
import FolderDetail from "../pages/FolderDetail"
import { NotFound } from "../pages/NotFound"
import { PermissionsManagement } from "../pages/PermissionsManagement"
import { WorkflowManagement } from "../pages/WorkflowManagement"

const PermissionsRoute = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <PermissionsManagement
      documentId={id ?? ""}
      documentTitle=""
      onBack={() => navigate(-1)}
    />
  )
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <ErrorBoundary>
        <LoginForm />
      </ErrorBoundary>
    ),
  },
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <AuthGuard>
          <AppShell />
        </AuthGuard>
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "permissions",
        element: (
          <PermissionsManagement documentId={""} documentTitle="" onBack={() => window.history.back()} />
        ),
      },
      {
        path: "documents",
        children: [
          {
            index: true,
            element: <Documents />,
          },
          {
            path: ":id",
            element: <DocumentDetailView />,
          },
          {
            path: ":id/permissions",
            element: <PermissionsRoute />,
          },
        ],
      },
      {
        path: "folders",
        children: [
          {
            index: true,
            element: <Folders />,
          },
          {
            path: ":id",
            element: <FolderDetail />, // Use dedicated Folder Detail page
          },
        ],
      },
      {
        path: "assignments",
        element: <Assignments />,
      },
      {
        path: "workflows",
        element: <WorkflowManagement />,
      },
      {
        path: "audit",
        element: <Audit />,
      },
      
    ],
  },
  {
    path: "/404",
    element: (
      <ErrorBoundary>
        <NotFound />
      </ErrorBoundary>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
])
