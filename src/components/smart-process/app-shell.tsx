import { TopBar } from "./top-bar"
import { Outlet } from "react-router-dom"
import { useState } from "react"
import { mockSubmissions } from "@/lib/store"
import SidebarNav from "./sidebar-nav"

export function AppShell() {
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [collapsed,  setCollapsed]    = useState(false)

  const pendingCount = mockSubmissions.filter(
    (s) => s.status === "pending" || s.status === "needs-info"
  ).length

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <SidebarNav
        pendingCount={pendingCount}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onToggleSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
