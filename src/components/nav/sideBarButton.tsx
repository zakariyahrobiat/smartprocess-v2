import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { Badge } from "../ui/badge"
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip"

interface SideBarButtonProps {
  id: string
  label: string
  icon: React.ElementType
  isActive: boolean
  badge?: number
  extraBadge?: string
  link: string
  onClick?: () => void
  collapsed?: boolean
}

function SideBarButton({
  id, label, icon: Icon, isActive, badge, extraBadge, link, onClick, collapsed = false,
}: SideBarButtonProps) {
  const btn = (
    <Link to={link} onClick={onClick}>
      <button
        key={id}
        className={cn(
          "flex items-center rounded-lg text-sm font-medium w-full transition-all",
          collapsed
            ? "size-9 mx-auto justify-center"
            : "gap-3 px-3 py-2.5 border-l-[3px]",
          isActive
            ? collapsed
              ? "bg-white/25 text-white"
              : "bg-white/20 text-white border-l-white/90 shadow-sm"
            : collapsed
              ? "text-white/70 hover:bg-white/10 hover:text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white border-l-transparent"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <div className="relative shrink-0">
          <Icon className="size-4" />
          {/* Badge dot when collapsed */}
          {collapsed && badge !== undefined && badge > 0 && (
            <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-sk-orange text-[8px] font-bold text-white">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </div>
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{label}</span>
            {badge !== undefined && badge > 0 && (
              <Badge className="bg-sk-orange text-white text-[10px] px-1.5 py-0 min-w-5 flex items-center justify-center">
                {badge}
              </Badge>
            )}
            {extraBadge && (
              <Badge className="bg-white/25 text-white text-[9px] px-1.5 py-0 leading-4 border border-white/20">
                {extraBadge}
              </Badge>
            )}
          </>
        )}
      </button>
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs font-medium">
          {label}
          {badge !== undefined && badge > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-sk-orange px-1.5 text-[9px] font-bold text-white">
              {badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return btn
}

export default SideBarButton
