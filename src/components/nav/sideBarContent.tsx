import { HelpCircle, Plus } from "lucide-react"
import SideBarButton from "./sideBarButton"
import SideBarLabel from "./sideBarLabel"
import { Separator } from "../ui/separator"
import { adminItems, coreNavItems, projectItems, saItems } from "./sideBarItems"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-provider"
import { Button } from "../ui/button"


interface SidebarContentProps {
  pendingCount: number,
  onItemClick?: () => void
}

function SidebarContent({ pendingCount, onItemClick }: SidebarContentProps) {
  const { can } = useAuth()
const location = useLocation()
 

  // SA items the current user can see
  const visibleSAItems = saItems.filter((item) => can(item.permission as Parameters<typeof can>[0]))

  // Admin items the current user can see
  const visibleAdminItems = adminItems.filter((item) => can(item.permission as Parameters<typeof can>[0]))
  

  return (
    <div className="flex h-full flex-col gap-1 py-4 overflow-y-auto">

      <div className="px-3 pb-3">
        <Link to="/" onClick={onItemClick}>
  <Button className={cn(
            "w-full justify-start gap-2 font-semibold shadow-sm",
            location.pathname === "/"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}>
    <Plus className="size-4" />
    New Request
  </Button>
</Link>

      </div>

      <nav className="flex flex-col gap-0.5 px-3" aria-label="Main navigation">
        {coreNavItems.map((item) => (
  <SideBarButton
    key={item.id}
    id={item.id}
    label={item.label}
    icon={item.icon}
    link={item.link}
    isActive={location.pathname === item.link}
    badge={item.id === "pending-actions" ? pendingCount : undefined}
    onClick={onItemClick}
  />
))}
      </nav>

      <Separator className="mx-3 my-1 w-auto" />


      <div className="px-3">
        <SideBarLabel label="Projects" />
        <nav className="flex flex-col gap-0.5" aria-label="Projects">
          {projectItems.map((item) => (
            <SideBarButton
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              isActive={location.pathname === item.link}
              link={item.link}
              extraBadge={item.badge}
              onClick={onItemClick}
            />
          ))}
        </nav>
      </div>

      {visibleSAItems.length > 0 && (
        <>
          <Separator className="mx-3 my-1 w-auto" />
          <div className="px-3">
            <SideBarLabel label="Shop Assistant" />
            <nav className="flex flex-col gap-0.5" aria-label="Shop Assistant">
              {visibleSAItems.map((item) => (
                <SideBarButton
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  icon={item.icon}
                  isActive={location.pathname === item.link}
                  link={item.link}
                  onClick={onItemClick}
                />
              ))}
            </nav>
          </div>
        </>
      )}

      
      {visibleAdminItems.length > 0 && (
        <>
          <Separator className="mx-3 my-1 w-auto" />
          <div className="px-3">
            <SideBarLabel label="Administration" />
            <nav className="flex flex-col gap-0.5" aria-label="Administration">
              {visibleAdminItems.map((item) => (
                <SideBarButton
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  icon={item.icon}
                  isActive={location.pathname === item.link}
                  link={item.link}
                  onClick={onItemClick}
                />
              ))}
            </nav>
          </div>
        </>
      )}

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
export default SidebarContent