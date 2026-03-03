import { cn } from "@/lib/utils"
import { Plus, FileText, ClipboardCheck, Clock, Zap, Shield, Users, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-provider"

export type AppView =
  | "new-request"
  | "my-submissions"
  | "pending-actions"
  | "history"
  | "inverter-dashboard"
  | "ims"
  | "admin-roles"
  | "admin-users"

interface SidebarNavProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
  pendingCount: number
  mobileOpen: boolean
  onMobileClose: () => void
}

const navItems: { id: AppView; label: string; icon: typeof FileText }[] = [
  { id: "my-submissions",  label: "My Submissions",  icon: FileText        },
  { id: "pending-actions", label: "Pending Actions", icon: ClipboardCheck  },
  { id: "history",         label: "History",         icon: Clock           },
]

const adminItems: { id: AppView; label: string; icon: typeof FileText }[] = [
  { id: "admin-roles",  label: "Roles & Permissions", icon: Shield },
  { id: "admin-users",  label: "User Management",     icon: Users  },
]

function SidebarContent({
  currentView, onNavigate, pendingCount, onMobileClose,
}: Omit<SidebarNavProps, "mobileOpen">) {
  const { can } = useAuth()
  const isAdmin          = can("admin_manage_roles") || can("admin_manage_users")
  const canAccessIMS     = can("ims_view_own_invoices") || can("ims_view_all_invoices") || can("ims_submit_refund")
  const canAccessInverter = can("view_unit_assignment") || can("view_analytics") || can("view_sales_tracking")

  const handleNav = (view: AppView) => { onNavigate(view); onMobileClose() }

  return (
    <div className="flex h-full flex-col py-4">

      {/* ── New Request CTA ── */}
      <div className="px-3 pb-3">
        <Button
          onClick={() => handleNav("new-request")}
          className="w-full justify-start gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold shadow-sm"
        >
          <Plus className="size-4" />
          New Request
        </Button>
      </div>

      {/* ── Main Nav ── */}
      <nav className="flex flex-col gap-0.5 px-3" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === "pending-actions" && pendingCount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0 min-w-5 flex items-center justify-center">
                  {pendingCount}
                </Badge>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Projects ── */}
      <div className="px-3 pt-4">
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Projects
        </p>
        <nav className="flex flex-col gap-0.5" aria-label="Projects">
          {canAccessInverter && (
            <button
              onClick={() => handleNav("inverter-dashboard")}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                currentView === "inverter-dashboard"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Zap className="size-4 shrink-0" />
              <span className="flex-1 text-left">Inverter Dashboard</span>
            </button>
          )}
          {canAccessIMS && (
            <button
              onClick={() => handleNav("ims")}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                currentView === "ims"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Receipt className="size-4 shrink-0" />
              <span className="flex-1 text-left">IMS</span>
              <Badge className="bg-secondary text-muted-foreground border border-border text-[9px] px-1.5 py-0 font-semibold">
                NEW
              </Badge>
            </button>
          )}
        </nav>
      </div>

      {/* ── Separator + Admin ── deliberately spaced apart from Projects */}
      {isAdmin && (
        <>
          <div className="px-3 pt-5 pb-1">
            <Separator className="bg-border" />
          </div>
          <div className="px-3 pt-2">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Admin Console
            </p>
            <nav className="flex flex-col gap-0.5" aria-label="Admin">
              {adminItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </>
      )}

      {/* ── Footer ── */}
      <div className="mt-auto px-3 pt-4">
        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs font-medium text-foreground">Need Help?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Contact IT support for process questions.
          </p>
        </div>
      </div>

    </div>
  )
}

export function SidebarNav(props: SidebarNavProps) {
  const { mobileOpen, onMobileClose, ...rest } = props

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <SidebarContent {...rest} onMobileClose={() => {}} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary">
                <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" fill="#00A651" />
                  <g stroke="#F9D926" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="12" y1="1"  x2="12" y2="4"  />
                    <line x1="12" y1="20" x2="12" y2="23" />
                    <line x1="1"  y1="12" x2="4"  y2="12" />
                    <line x1="20" y1="12" x2="23" y2="12" />
                  </g>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">Sun King</span>
                <span className="text-[10px] leading-tight text-muted-foreground">SmartProcess</span>
              </div>
            </SheetTitle>
          </SheetHeader>
          <SidebarContent {...rest} onMobileClose={onMobileClose} />
        </SheetContent>
      </Sheet>
    </>
  )
}