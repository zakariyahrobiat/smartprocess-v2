import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  "Pending Line Manager Approval": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Pending Finance Approval": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Pending Manager Approval": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Approved": "bg-green-500/10 text-green-400 border-green-500/20",
  "Processing": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Paid": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Rejected": "bg-red-500/10 text-red-400 border-red-500/20",
  "Resubmitted": "bg-orange-500/10 text-orange-400 border-orange-500/20",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", STATUS_COLORS[status] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20")}>
      {status}
    </span>
  )
}

export default StatusBadge