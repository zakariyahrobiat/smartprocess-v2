import { TopBar } from "./top-bar"
import { Outlet } from "react-router-dom"
import { useState } from "react"
import { mockSubmissions } from "@/lib/store"
import SidebarNav from "./sidebar-nav"

export function AppShell() {
     const [mobileOpen, setMobileOpen] = useState(false)
       const pendingCount = mockSubmissions.filter(
      (s) => s.status === "pending" || s.status === "needs-info"
    ).length

  return (
    <div className="flex h-dvh flex-col bg-background">
      <TopBar onToggleSidebar={() => setMobileOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <SidebarNav
          pendingCount={pendingCount}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


