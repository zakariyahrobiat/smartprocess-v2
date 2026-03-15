import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import SidebarContent from "../nav/sideBarContent"

interface SidebarNavProps {
  pendingCount: number
  mobileOpen: boolean
  onMobileClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

function SidebarNav({
  mobileOpen, onMobileClose, pendingCount, collapsed, onToggleCollapse,
}: SidebarNavProps) {
  return (
    <>
      {/* Desktop — collapsible */}
      <aside
        className="hidden lg:flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200"
        style={{ width: collapsed ? 56 : 256 }}
      >
        <SidebarContent
          pendingCount={pendingCount}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      {/* Mobile — sheet */}
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar">
          <SheetHeader className="border-b border-sidebar-border px-4 py-3">
            <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
              <div className="flex size-7 items-center justify-center rounded-md bg-white/20">
                <svg viewBox="0 0 24 24" className="size-4" fill="none">
                  <circle cx="12" cy="12" r="5" fill="#fff" />
                  <g stroke="#F47B20" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="12" y1="1" x2="12" y2="4"/>
                    <line x1="12" y1="20" x2="12" y2="23"/>
                    <line x1="1" y1="12" x2="4" y2="12"/>
                    <line x1="20" y1="12" x2="23" y2="12"/>
                  </g>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight text-white">Sun King</span>
                <span className="text-[10px] leading-tight text-white/60">SmartProcess</span>
              </div>
            </SheetTitle>
          </SheetHeader>
          <SidebarContent
            pendingCount={pendingCount}
            onItemClick={onMobileClose}
            collapsed={false}
            onToggleCollapse={() => {}}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}

export default SidebarNav
