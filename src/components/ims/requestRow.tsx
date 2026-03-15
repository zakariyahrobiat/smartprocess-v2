import { ChevronRight, FileText } from "lucide-react";
import StatusBadge from "./statusBadge";

interface RequestRowProps {
  title: string;
  id: string;
  meta: (string | number)[];
  status: string;
  iconColor?: string;
  iconBg?: string;
  onClick: () => void;
}

export default function RequestRow({
  title,
 id,
  meta,
  status,
  iconColor = "text-sk-orange",
  iconBg = "bg-sk-orange/10 border-sk-orange/20",
  onClick,
}: RequestRowProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-accent/50"
    >
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${iconBg}`}
      >
        <FileText className={`size-4 ${iconColor}`} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground font-mono">
            {id}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          {meta.map((m, i) => (
            <span key={i}>
              {i > 0 && " · "} {m}
            </span>
          ))}
        </div>
      </div>

      <StatusBadge status={status} />
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}