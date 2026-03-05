"use client"

import { useState } from "react"
import { TopBar } from "./top-bar"
import { SidebarNav, type AppView } from "./sidebar-nav"
import { MakerView } from "./maker-view"
import { SubmissionsList } from "./submissions-list"
import { CheckerView } from "./checker-view"
import { InverterDashboard } from "@/components/inverter-dashboard/inverter-dashboard"
import { mockSubmissions } from "@/lib/store"
import { useAuth } from "@/context/auth-provider"
import type { Permission } from "@/lib/rbac"

// ── Pages ──────────────────────────────────────────────────────────────────────
import IMSPage from "@/pages/ims/IMSPage"
import RolesPage from "@/pages/admin/RolesPage"
import UsersPage from "@/pages/admin/UsersPage"

// ── SA portals ─────────────────────────────────────────────────────────────────
import AssistantPortal from "@/components/shop-assistant/AssistantPortal"
import SupervisorPortal from "@/components/shop-assistant/SupervisorPortal"
import HRPortal from "@/components/shop-assistant/HRPortal"

// ─── Permission guard ──────────────────────────────────────────────────────────
function PermissionGuard({
  permission,
  children,
}: {
  permission: Permission
  children: React.ReactNode
}) {
  const { can } = useAuth()
  if (!can(permission)) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-muted-foreground">
        <div className="text-4xl">🔒</div>
        <p className="text-sm font-medium">You don't have access to this module.</p>
        <p className="text-xs">Contact your administrator to request access.</p>
      </div>
    )
  }
  return <>{children}</>
}

// ─── AppShell ──────────────────────────────────────────────────────────────────
export function AppShell() {
  const [currentView, setCurrentView] = useState<AppView>("new-request")
  const [mobileOpen, setMobileOpen] = useState(false)

  const pendingCount = mockSubmissions.filter(
    (s) => s.status === "pending" || s.status === "needs-info"
  ).length

  // Max-width per view category
  const maxWidth =
    currentView === "inverter-dashboard" ? "max-w-7xl"
    : currentView === "ims"              ? "max-w-6xl"
    : currentView === "admin-roles"      ? "max-w-6xl"
    : currentView === "admin-users"      ? "max-w-4xl"
    :                                      "max-w-5xl"

  return (
    <div className="flex h-dvh flex-col bg-background">
      <TopBar onToggleSidebar={() => setMobileOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <SidebarNav
          currentView={currentView}
          onNavigate={setCurrentView}
          pendingCount={pendingCount}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className={`mx-auto p-4 lg:p-8 ${maxWidth}`}>

            {/* ── Core SmartProcess views ── */}
            {currentView === "new-request" && <MakerView />}
            {currentView === "my-submissions" && (
              <SubmissionsList
                title="My Submissions"
                description="Track the status of all your submitted requests."
              />
            )}
            {currentView === "pending-actions" && <CheckerView />}
            {currentView === "history" && (
              <SubmissionsList
                title="History"
                description="Browse completed and archived submissions."
                filter="approved"
              />
            )}

            {/* ── Inverter Dashboard ── */}
            {currentView === "inverter-dashboard" && <InverterDashboard />}

            {/* ── IMS ── */}
            {currentView === "ims" && (
              <PermissionGuard permission="ims_view_own_invoices">
                <IMSPage />
              </PermissionGuard>
            )}

            {/* ── Shop Assistant ── */}
            {currentView === "sa-checkin" && (
              <PermissionGuard permission="sa:checkin">
                <AssistantPortal />
              </PermissionGuard>
            )}
            {currentView === "sa-supervisor" && (
              <PermissionGuard permission="sa:supervisor">
                <SupervisorPortal />
              </PermissionGuard>
            )}
            {currentView === "sa-hr" && (
              <PermissionGuard permission="sa:hr">
                <HRPortal />
              </PermissionGuard>
            )}

            {/* ── Administration ── */}
            {currentView === "admin-roles" && (
              <PermissionGuard permission="admin_manage_roles">
                <RolesPage />
              </PermissionGuard>
            )}
            {currentView === "admin-users" && (
              <PermissionGuard permission="admin_manage_users">
                <UsersPage />
              </PermissionGuard>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
