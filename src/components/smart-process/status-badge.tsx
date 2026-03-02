import { cn } from "@/lib/utils"
import type { ProcessStatus } from "@/lib/store"

const statusConfig: Record<ProcessStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-warning/15 text-[#92400E] dark:text-warning border-warning/30",
  },
  approved: {
    label: "Approved",
    className: "bg-success/15 text-[#065F46] dark:text-success border-success/30",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  "needs-info": {
    label: "Needs Info",
    className: "bg-info/15 text-[#0369A1] dark:text-info border-info/30",
  },
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
}

interface StatusBadgeProps {
  status: ProcessStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      <span
        className={cn(
          "mr-1.5 size-1.5 rounded-full",
          status === "pending" && "bg-warning",
          status === "approved" && "bg-success",
          status === "rejected" && "bg-destructive",
          status === "needs-info" && "bg-info",
          status === "draft" && "bg-muted-foreground"
        )}
      />
      {config.label}
    </span>
  )
}
