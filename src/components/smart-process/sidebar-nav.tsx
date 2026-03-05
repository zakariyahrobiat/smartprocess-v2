"use client"

import { cn } from "@/lib/utils"
import {
  Plus, FileText, ClipboardCheck, Clock,
  Zap, Receipt, Fingerprint, Users, ShieldCheck,
  Shield, UserCog, HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-provider"

// ─── AppView union ────────────────────────────────────────────────────────────
export type AppView =
  | "new-request"
  | "my-submissions"
  | "pending-actions"
  | "history"
  // Projects
  | "inverter-dashboard"
  | "ims"
  // Shop Assistant
  | "sa-checkin"
  | "sa-supervisor"
  | "sa-hr"
  // Administration
  | "admin-roles"
  | "admin-users"

interface SidebarNavProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
  pendingCount: number
  mobileOpen: boolean
  onMobileClose: () => void
}

// ─── Nav item definitions ─────────────────────────────────────────────────────

const coreNavItems: { id: AppView; label: string; icon: React.ElementType }[] = [
  { id: "my-submissions",  label: "My Submissions",  icon: FileText },
  { id: "pending-actions", label: "Pending Actions", icon: ClipboardCheck },
  { id: "history",         label: "History",         icon: Clock },
]

const projectItems: { id: AppView; label: string; icon: React.ElementType; badge?: string; permission?: string }[] = [
  { id: "inverter-dashboard", label: "Inverter Dashboard", icon: Zap },
  { id: "ims",                label: "IMS",                icon: Receipt, badge: "NEW" },
]

const saItems: { id: AppView; label: string; icon: React.ElementType; permission: string }[] = [
  { id: "sa-checkin",    label: "My Check-In",    icon: Fingerprint, permission: "sa:checkin" },
  { id: "sa-supervisor", label: "Team Attendance", icon: Users,       permission: "sa:supervisor" },
  { id: "sa-hr",         label: "HR Portal",       icon: ShieldCheck, permission: "sa:hr" },
]

const adminItems: { id: AppView; label: string; icon: React.ElementType; permission: string }[] = [
  { id: "admin-roles", label: "Roles & Permissions", icon: Shield,   permission: "admin_manage_roles" },
  { id: "admin-users", label: "User Management",     icon: UserCog,  permission: "admin_manage_users" },
]

// ─── Shared nav button ────────────────────────────────────────────────────────

function NavButton({
  id, label, icon: Icon, isActive, onClick, badge, extraBadge,
}: {
  id: string
  label: string
  icon: React.ElementType
  isActive: boolean
  onClick: () => void
  badge?: number
  extraBadge?: string
}) {
  return (
    <button
      key={id}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium w-full transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0 min-w-5 flex items-center justify-center">
          {badge}
        </Badge>
      )}
      {extraBadge && (
        <Badge className="bg-green-600 text-white text-[9px] px-1.5 py-0 leading-4">
          {extraBadge}
        </Badge>
      )}
    </button>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </p>
  )
}

// ─── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({
  currentView,
  onNavigate,
  pendingCount,
  onMobileClose,
}: Omit<SidebarNavProps, "mobileOpen">) {
  const { can } = useAuth()

  const handleNav = (view: AppView) => {
    onNavigate(view)
    onMobileClose()
  }

  // SA items the current user can see
  const visibleSAItems = saItems.filter((item) => can(item.permission as Parameters<typeof can>[0]))

  // Admin items the current user can see
  const visibleAdminItems = adminItems.filter((item) => can(item.permission as Parameters<typeof can>[0]))

  return (
    <div className="flex h-full flex-col gap-1 py-4 overflow-y-auto">

      {/* ── New Request button ── */}
      <div className="px-3 pb-3">
        <Button
          onClick={() => handleNav("new-request")}
          className={cn(
            "w-full justify-start gap-2 font-semibold shadow-sm",
            currentView === "new-request"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <Plus className="size-4" />
          New Request
        </Button>
      </div>

      {/* ── Core nav ── */}
      <nav className="flex flex-col gap-0.5 px-3" aria-label="Main navigation">
        {coreNavItems.map((item) => (
          <NavButton
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            isActive={currentView === item.id}
            onClick={() => handleNav(item.id)}
            badge={item.id === "pending-actions" ? pendingCount : undefined}
          />
        ))}
      </nav>

      <Separator className="mx-3 my-1 w-auto" />

      {/* ── Projects ── */}
      <div className="px-3">
        <SectionLabel label="Projects" />
        <nav className="flex flex-col gap-0.5" aria-label="Projects">
          {projectItems.map((item) => (
            <NavButton
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              isActive={currentView === item.id}
              onClick={() => handleNav(item.id)}
              extraBadge={item.badge}
            />
          ))}
        </nav>
      </div>

      {/* ── Shop Assistant (permission-gated) ── */}
      {visibleSAItems.length > 0 && (
        <>
          <Separator className="mx-3 my-1 w-auto" />
          <div className="px-3">
            <SectionLabel label="Shop Assistant" />
            <nav className="flex flex-col gap-0.5" aria-label="Shop Assistant">
              {visibleSAItems.map((item) => (
                <NavButton
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  icon={item.icon}
                  isActive={currentView === item.id}
                  onClick={() => handleNav(item.id)}
                />
              ))}
            </nav>
          </div>
        </>
      )}

      {/* ── Administration (permission-gated) ── */}
      {visibleAdminItems.length > 0 && (
        <>
          <Separator className="mx-3 my-1 w-auto" />
          <div className="px-3">
            <SectionLabel label="Administration" />
            <nav className="flex flex-col gap-0.5" aria-label="Administration">
              {visibleAdminItems.map((item) => (
                <NavButton
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  icon={item.icon}
                  isActive={currentView === item.id}
                  onClick={() => handleNav(item.id)}
                />
              ))}
            </nav>
          </div>
        </>
      )}

      {/* ── Help footer ── */}
      <div className="mt-auto px-3 pt-4">
        <div className="rounded-lg border border-border bg-accent/50 p-3 flex items-start gap-2">
          <HelpCircle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-accent-foreground">Need Help?</p>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
              Contact IT support for process questions.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Sun King logo mark ───────────────────────────────────────────────────────

function SKLogoMark({ size = 7 }: { size?: number }) {
  return (
    <div className={`flex size-${size} items-center justify-center rounded-md bg-secondary`}>
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
  )
}

// ─── Exported component ───────────────────────────────────────────────────────

export function SidebarNav(props: SidebarNavProps) {
  const { mobileOpen, onMobileClose, ...rest } = props

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <SidebarContent {...rest} onMobileClose={() => {}} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
              <SKLogoMark />
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
