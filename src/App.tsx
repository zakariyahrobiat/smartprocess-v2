import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/auth-provider'
import SeedPage from "@/pages/ims/SeedPage"
import LoginPage from './pages/LoginPage'
import { AppShell } from './components/smart-process/app-shell'
import IMSPage from './pages/ims/IMSPage'
import { InverterDashboard } from './pages/inverter/inverter-dashboard'
import { MakerView } from './components/smart-process/maker-view'
import { SubmissionsList } from './components/smart-process/submissions-list'
import { CheckerView } from './components/smart-process/checker-view'
import RolesPage from './pages/admin/RolesPage'
import UsersPage from './pages/admin/UsersPage'
import AssistantPortal from './components/shop-assistant/AssistantPortal'
import HRPortal from './components/shop-assistant/HRPortal'
import SupervisorPortal from './components/shop-assistant/SupervisorPortal'
import PermissionGuard from './components/permissionGuard'
import InvoicesPage from './pages/ims/InvoicesPage'
import InvoiceForm from './components/inputs/invoiceForm'
import RefundsPage from './pages/ims/RefundsPage'
import InvoiceDetailPage from './pages/ims/invoiceDetailsPage'
import RefundForm from './components/inputs/refundForm'
import RefundDetailsPage from './pages/ims/refundDetailsPage'
import LaptopRequest from './components/requests/laptopRequest'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
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
        <Route path="/" element={<MakerView />} />
        <Route path='/request/laptop' element={<LaptopRequest/>} />
        <Route
          path="/submissions"
          element={
            <SubmissionsList
              title="My Submissions"
              description="Track the status of all your submitted requests."
            />
          }
        />
        <Route path="/pending" element={<CheckerView />} />
        <Route
          path="/history"
          element={
            <SubmissionsList
              title="History"
              description="Browse completed and archived submissions."
              filter="approved"
            />
          }
        />
        <Route
          path="/ims"
          element={
            <PermissionGuard permission="ims_view_own_invoices">
              <IMSPage />
            </PermissionGuard>
          }
        >
          <Route index element={<InvoicesPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/new" element={<InvoiceForm />} />
          <Route path="invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="refunds" element={<RefundsPage />} />
          <Route path="refunds/new" element={<RefundForm />} />
          <Route path="refunds/:id" element={<RefundDetailsPage />} />
        </Route>
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


