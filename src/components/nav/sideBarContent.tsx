import { HelpCircle, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import SideBarButton from "./sideBarButton"
import SideBarLabel from "./sideBarLabel"
import { adminItems, coreNavItems, projectItems, saItems } from "./sideBarItems"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-provider"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarContentProps {
  pendingCount: number
  onItemClick?: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

function SidebarContent({ pendingCount, onItemClick, collapsed, onToggleCollapse }: SidebarContentProps) {
  const { can } = useAuth()
  const location = useLocation()

  const visibleSAItems    = saItems.filter(item => can(item.permission as Parameters<typeof can>[0]))
  const visibleAdminItems = adminItems.filter(item => can(item.permission as Parameters<typeof can>[0]))

  return (
    <TooltipProvider delayDuration={0}>
    <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden">

      {/* Logo + collapse toggle */}
      <div className={cn(
        "flex items-center border-b border-sidebar-border shrink-0",
        collapsed ? "h-14 justify-center px-0" : "h-14 px-3 gap-2"
      )}>
        {!collapsed && (
          <>
            <div className="flex size-7 items-center justify-center rounded-md bg-white/20 shrink-0">
              <svg viewBox="0 0 24 24" className="size-4" fill="none">
                <circle cx="12" cy="12" r="5" fill="#fff"/>
                <g stroke="#F47B20" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="12" y1="1" x2="12" y2="4"/>
                  <line x1="12" y1="20" x2="12" y2="23"/>
                  <line x1="1" y1="12" x2="4" y2="12"/>
                  <line x1="20" y1="12" x2="23" y2="12"/>
                </g>
              </svg>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold leading-tight text-white truncate">Sun King</span>
              <span className="text-[9px] leading-tight text-white/55 truncate">SmartProcess</span>
            </div>
          </>
        )}
        <button
          onClick={onToggleCollapse}
          className={cn(
            "flex items-center justify-center rounded-lg transition-all text-white/60 hover:text-white hover:bg-white/10",
            collapsed ? "size-8" : "size-7 shrink-0"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight className="size-3.5" />
            : <ChevronLeft className="size-3.5" />
          }
        </button>
      </div>

      {/* New Request CTA */}
      <div className={cn("px-2 pt-3 pb-2", collapsed && "px-1.5")}>
        {collapsed ? (
          <NavTooltip label="New Request">
            <Link to="/new" onClick={onItemClick}>
              <button className={cn(
                "flex items-center justify-center rounded-lg transition-all w-full",
                "size-9 mx-auto",
                location.pathname === "/"
                  ? "bg-sk-orange text-white"
                  : "bg-white/15 text-white hover:bg-white/25"
              )}>
                <Plus className="size-4" />
              </button>
            </Link>
          </NavTooltip>
        ) : (
          <Link to="/new" onClick={onItemClick}>
            <button className={cn(
              "w-full flex items-center justify-start gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
              location.pathname === "/"
                ? "bg-sk-orange text-white shadow-sm"
                : "bg-white/15 text-white hover:bg-white/25"
            )}>
              <Plus className="size-4 shrink-0" />
              <span>New Request</span>
            </button>
          </Link>
        )}
      </div>

      {/* Nav sections */}
      <nav className={cn("flex flex-col gap-0.5 px-2", collapsed && "px-1.5")} aria-label="Main navigation">
        {coreNavItems.map(item => (
          <SideBarButton
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            link={item.link}
            isActive={location.pathname === item.link}
            badge={item.id === "pending-actions" ? pendingCount : undefined}
            onClick={onItemClick}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="mx-2 my-2 h-px bg-white/15" />

      {!collapsed && <SideBarLabel label="Projects" />}
      <nav className={cn("flex flex-col gap-0.5 px-2", collapsed && "px-1.5")} aria-label="Projects">
        {projectItems.map(item => (
          <SideBarButton
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            isActive={location.pathname === item.link}
            link={item.link}
            extraBadge={item.badge}
            onClick={onItemClick}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {visibleSAItems.length > 0 && (
        <>
          <div className="mx-2 my-2 h-px bg-white/15" />
          {!collapsed && <SideBarLabel label="Shop Assistant" />}
          <nav className={cn("flex flex-col gap-0.5 px-2", collapsed && "px-1.5")} aria-label="Shop Assistant">
            {visibleSAItems.map(item => (
              <SideBarButton
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.link}
                link={item.link}
                onClick={onItemClick}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </>
      )}

      {visibleAdminItems.length > 0 && (
        <>
          <div className="mx-2 my-2 h-px bg-white/15" />
          {!collapsed && <SideBarLabel label="Administration" />}
          <nav className={cn("flex flex-col gap-0.5 px-2", collapsed && "px-1.5")} aria-label="Administration">
            {visibleAdminItems.map(item => (
              <SideBarButton
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.link}
                link={item.link}
                onClick={onItemClick}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </>
      )}

      {/* Help box — only when expanded */}
      {!collapsed && (
        <div className="mt-auto px-2 py-3">
          <div className="rounded-lg border border-white/15 bg-white/10 p-3 flex items-start gap-2">
            <HelpCircle className="size-4 text-white/60 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-white">Need Help?</p>
              <p className="mt-0.5 text-xs text-white/60 leading-relaxed">
                Contact IT support for process questions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed: just an icon at bottom */}
      {collapsed && (
        <div className="mt-auto px-1.5 pb-3">
          <NavTooltip label="Help & Support">
            <div className="flex size-9 mx-auto items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-all">
              <HelpCircle className="size-4" />
            </div>
          </NavTooltip>
        </div>
      )}

    </div>
    </TooltipProvider>
  )
}

function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" className="text-xs font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export default SidebarContent
