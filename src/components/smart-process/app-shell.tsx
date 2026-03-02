import { useState, useEffect } from "react"
import { TopBar } from "./top-bar"
import { SidebarNav, type AppView } from "./sidebar-nav"
import { MakerView } from "./maker-view"
import { SubmissionsList } from "./submissions-list"
import { CheckerView } from "./checker-view"
import { InverterDashboard } from "@/components/inverter-dashboard/inverter-dashboard"
import AdminRolesPage from "@/pages/admin/RolesPage"
import AdminUsersPage from "@/pages/admin/UsersPage"
import IMSPage from "@/pages/ims/IMSPage"
import { useAuth } from "@/context/auth-provider"
import { subscribeToPendingSubmissions } from "@/lib/submissionService"

export function AppShell() {
  const { currentUser, can } = useAuth()
  const [currentView, setCurrentView] = useState<AppView>("new-request")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Live pending count from Firestore
  useEffect(() => {
    if (!currentUser || !can("approve_requests")) return
    const unsub = subscribeToPendingSubmissions((submissions) => {
      setPendingCount(submissions.length)
    })
    return () => unsub()
  }, [currentUser, can])

  const isWide = ["inverter-dashboard", "admin-roles", "admin-users", "ims"].includes(currentView)

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
          <div className={`mx-auto p-4 lg:p-8 ${isWide ? "max-w-7xl" : "max-w-5xl"}`}>
            {currentView === "new-request" && <MakerView />}
            {currentView === "my-submissions" && (
              <SubmissionsList
                mode="my"
                title="My Submissions"
                description="Track the status of all your submitted requests."
              />
            )}
            {currentView === "pending-actions" && <CheckerView />}
            {currentView === "history" && (
              <SubmissionsList
                mode="my"
                title="History"
                description="Browse completed and archived submissions."
                filter="approved"
              />
            )}
            {currentView === "inverter-dashboard" && <InverterDashboard />}
            {currentView === "ims" && <IMSPage />}
            {currentView === "admin-roles" && <AdminRolesPage />}
            {currentView === "admin-users" && <AdminUsersPage />}
          </div>
        </main>
      </div>
    </div>
  )
}
