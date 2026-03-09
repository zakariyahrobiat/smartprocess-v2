import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { Badge } from "../ui/badge"

interface SideBarButtonProps {
  id: string
  label: string
  icon: React.ElementType
  isActive: boolean
  badge?: number
  extraBadge?: string
  link: string,
  onClick?: () => void
}

function SideBarButton({
  id, label, icon: Icon, isActive,  badge, extraBadge, link, onClick
}: SideBarButtonProps) {
  return (
    <Link to={link} onClick={onClick}>
    <button
      key={id}
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
    </Link>
  )
}

export default SideBarButton