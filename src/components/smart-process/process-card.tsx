
import { cn } from "@/lib/utils"
import {
  Laptop,
  Plane,
  CalendarDays,
  Package,
  Users,
  Wallet,
} from "lucide-react"
import type { ProcessFlow } from "@/lib/store"

const iconMap: Record<string, typeof Laptop> = {
  laptop: Laptop,
  plane: Plane,
  calendar: CalendarDays,
  box: Package,
  users: Users,
  wallet: Wallet,
}

interface ProcessCardProps {
  process: ProcessFlow
  onSelect: (id: string) => void
}

export function ProcessCard({ process, onSelect }: ProcessCardProps) {
  const Icon = iconMap[process.icon] || Package

  return (
    <button
      onClick={() => onSelect(process.id)}
      className={cn(
        "group relative flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left transition-all duration-200",
        "hover:border-secondary hover:shadow-lg hover:shadow-secondary/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-lg bg-accent transition-colors group-hover:bg-secondary/20">
        <Icon className="size-5 text-primary transition-colors group-hover:text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-card-foreground">{process.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {process.description}
        </p>
      </div>
      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        {process.category}
      </span>
    </button>
  )
}
