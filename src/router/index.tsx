import { createBrowserRouter, Navigate, useNavigate, useParams } from "react-router-dom"
import { AuthGuard } from "../components/auth/AuthGuard"
import { LoginForm } from "../components/auth/LoginForm"
import { AppShell } from "../components/layout/AppShell"
import { ErrorBoundary } from "../components/ui/error-boundary"
import { Assignments } from "../pages/Assignments"
import { Dashboard } from "../pages/Dashboard"
import { DocumentDetailView } from "../pages/DocumentDetailView"
import { Documents } from "../pages/Documents"
import { Folders } from "../pages/Folders"
import { NotFound } from "../pages/NotFound"
import { PermissionsManagement } from "../pages/PermissionsManagement"

// Placeholder components for remaining routes
const Workflows = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
      <p className="text-muted-foreground">Manage document workflows and approval processes</p>
    </div>
    <div className="text-center py-12 text-muted-foreground">Workflows feature coming soon...</div>
  </div>
)

const Audit = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Audit</h1>
      <p className="text-muted-foreground">View audit logs and document access history</p>
    </div>
    <div className="text-center py-12 text-muted-foreground">Audit feature coming soon...</div>
  </div>
)

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
            element: <Folders />, // In a real app, this would be a FolderDetail component
          },
        ],
      },
      {
        path: "assignments",
        element: <Assignments />,
      },
      {
        path: "workflows",
        element: <Workflows />,
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
