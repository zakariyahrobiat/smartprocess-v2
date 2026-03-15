import { cn } from "@/lib/utils"
interface InvoiceAnalytics {
  total: number;
  pending_line_manager: number;
  pending_finance: number;
  pending_senior_manager: number;
  approved: number;
  processing: number;
  paid: number;
  rejected: number;
}
interface refundAnalytics {
  total: number;
  pending_receivable: number;
  pending_approval: number;
  approved: number;
  processing: number;
  paid: number;
  rejected: number;
}

interface AnalyticsCardsProps {
  stats: InvoiceAnalytics | refundAnalytics;
  label: string;
}
function AnalyticsCards({ stats, label }: AnalyticsCardsProps) {
   const pending =
    "pending_line_manager" in stats
      ? stats.pending_line_manager +
        stats.pending_finance +
        stats.pending_senior_manager
      : stats.pending_receivable + stats.pending_approval
    const cards = [
     { label: label, value: stats.total, color: "text-foreground" },
     {
       label: "Pending Approval",
       value: pending,
       color: "text-yellow-400",
     },
     {
       label: "Approved / Processing",
       value: stats.approved + stats.processing,
       color: "text-green-400",
     },
     { label: "Paid", value: stats.paid, color: "text-emerald-400" },
     { label: "Rejected", value: stats.rejected, color: "text-red-400" },
   ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map(c => (
        <div key={c.label} className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{c.label}</p>
          <p className={cn("text-2xl font-bold mt-1", c.color)}>{c.value}</p>
        </div>
      ))}
    </div>
  )
}

export default AnalyticsCards

