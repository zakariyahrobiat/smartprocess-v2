
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { User, Cpu } from "lucide-react"
import type { AuditEntry } from "@/lib/store"

interface AuditTimelineProps {
  entries: AuditEntry[]
}

export function AuditTimeline({ entries }: AuditTimelineProps) {
  return (
    <div className="flow-root" role="list" aria-label="Activity timeline">
      <ul className="-mb-8">
        {entries.map((entry, idx) => (
          <li key={entry.id}>
            <div className="relative pb-8">
              {idx < entries.length - 1 && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start gap-3">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    entry.isSystem
                      ? "bg-muted"
                      : "bg-primary/10"
                  )}
                >
                  {entry.isSystem ? (
                    <Cpu className="size-3.5 text-muted-foreground" />
                  ) : (
                    <User className="size-3.5 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{entry.actor}</span>{" "}
                    <span className="text-muted-foreground">{entry.action}</span>
                  </p>
                  {entry.comment && (
                    <p className="mt-1 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground italic">
                      {`"${entry.comment}"`}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
