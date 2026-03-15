import { cn } from "@/lib/utils"
interface AnalyticsItems {
  status: string,
  amount: number
}
interface AnalyticsCardsProps {
  items: AnalyticsItems[],
  label: string
}
function AnalyticsCards({ items, label }: AnalyticsCardsProps) {
  const stats = {
    total: items.length,
    pending: items.filter(i => i.status.startsWith("Pending")).length,
    approved: items.filter(i => i.status === "Approved" || i.status === "Processing").length,
    paid: items.filter(i => i.status === "Paid").length,
    rejected: items.filter(i => i.status === "Rejected").length,
    totalAmount: items.reduce((s, i) => s + i.amount, 0),
  }
  const cards = [
    { label: label,  value: stats.total, sub: "", color: "text-foreground" },
    { label: "Pending Approval", value: stats.pending, sub: "", color: "text-yellow-400" },
    { label: "Approved / Processing", value: stats.approved, sub: "", color: "text-green-400" },
    { label: "Paid", value: stats.paid, sub: "", color: "text-emerald-400" },
    { label: "Rejected", value: stats.rejected, sub: "", color: "text-red-400" },
  ]
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

