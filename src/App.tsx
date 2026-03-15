import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/auth-provider'
import SeedPage from "@/pages/ims/SeedPage"
import LoginPage from './pages/LoginPage'
import { AppShell } from './components/smart-process/app-shell'
import IMSPage from './pages/ims/IMSPage'
import { InverterDashboard } from './pages/inverter/inverter-dashboard'
import { MakerView } from './components/smart-process/maker-view'
import DashboardPage from './pages/DashboardPage'
import PendingActionsPage from './pages/PendingActionsPage'
import HistoryPage from './pages/HistoryPage'
import { SubmissionsList } from './components/smart-process/submissions-list'
import { CheckerView } from './components/smart-process/checker-view'
import RolesPage from './pages/admin/roles/RolesPage'
import UsersPage from './pages/admin/UsersPage'
import AssistantPortal from './components/shop-assistant/AssistantPortal'
import HRPortal from './components/shop-assistant/HRPortal'
import SupervisorPortal from './components/shop-assistant/SupervisorPortal'
import PermissionGuard from './components/permissionGuard'
import InvoiceForm from './components/inputs/invoiceForm'
import InvoiceDetailPage from './pages/ims/invoiceDetailsPage'
import RefundForm from './components/inputs/refundForm'
import RefundDetailsPage from './pages/ims/refundDetailsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-8 h-8 border-4 border-sk-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/seed" element={<SeedPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/new" element={<MakerView />} />

        <Route path="/pending" element={<PendingActionsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        {/* IMS master-detail — self-contained, no Outlet */}
        <Route
          path="/ims"
          element={
            <PermissionGuard permission="ims_view_own_invoices">
              <IMSPage />
            </PermissionGuard>
          }
        />

        {/* IMS forms — rendered at AppShell level with scrollable wrapper */}
        <Route path="/ims/invoices/new" element={
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <PermissionGuard permission="ims_submit_invoice"><InvoiceForm /></PermissionGuard>
          </div>
        } />
        <Route path="/ims/invoices/:id" element={
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <InvoiceDetailPage />
          </div>
        } />
        <Route path="/ims/refunds/new" element={
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <PermissionGuard permission="ims_submit_refund"><RefundForm /></PermissionGuard>
          </div>
        } />
        <Route path="/ims/refunds/:id" element={
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <RefundDetailsPage />
          </div>
        } />
        <Route path="/inverter" element={<InverterDashboard />} />

        <Route
          path="/admin/roles"
          element={
            <PermissionGuard permission="admin_manage_roles">
              <RolesPage />
            </PermissionGuard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PermissionGuard permission="admin_manage_users">
              <UsersPage />
            </PermissionGuard>
          }
        />

        <Route
          path="/sa/checkin"
          element={
            <PermissionGuard permission="sa:checkin">
              <AssistantPortal />
            </PermissionGuard>
          }
        />
        <Route
          path="/sa/supervisor"
          element={
            <PermissionGuard permission="sa:supervisor">
              <SupervisorPortal />
            </PermissionGuard>
          }
        />
        <Route
          path="/sa/hr"
          element={
            <PermissionGuard permission="sa:hr">
              <HRPortal />
            </PermissionGuard>
          }
        />
      </Route>
    </Routes>
  );
}


