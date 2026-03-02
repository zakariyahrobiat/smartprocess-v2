
import { useState } from "react"
import { mockAnalyticsSummary, mockProspects } from "@/lib/inverter-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  RefreshCw,
  Download,
  HourglassIcon,
  AlertTriangle,
  Flame,
  Unlink,
  Truck,
  CalendarDays,
  Globe,
} from "lucide-react"
import { toast } from "sonner"

interface AnalyticsCard {
  label: string
  value: number
  icon: typeof HourglassIcon
  colorClass: string
  bgClass: string
}

export function AnalyticsTab() {
  const [cutoffDate, setCutoffDate] = useState("2025-11-20")

  const cards: AnalyticsCard[] = [
    {
      label: "Pending Assignments",
      value: mockAnalyticsSummary.totalPending,
      icon: HourglassIcon,
      colorClass: "text-[#92400E] dark:text-warning",
      bgClass: "bg-warning/15",
    },
    {
      label: "Assigned Unpaid",
      value: mockAnalyticsSummary.totalUnpaid,
      icon: AlertTriangle,
      colorClass: "text-destructive",
      bgClass: "bg-destructive/15",
    },
    {
      label: "Overdue (>72h)",
      value: mockAnalyticsSummary.totalOverdue,
      icon: Flame,
      colorClass: "text-destructive",
      bgClass: "bg-destructive/15",
    },
    {
      label: "Unmatched",
      value: mockAnalyticsSummary.totalUnmatched,
      icon: Unlink,
      colorClass: "text-muted-foreground",
      bgClass: "bg-muted",
    },
    {
      label: "Paid Not Delivered",
      value: mockAnalyticsSummary.totalPaidNotDelivered,
      icon: Truck,
      colorClass: "text-[#0369A1] dark:text-info",
      bgClass: "bg-info/15",
    },
  ]

  // Mock category data
  const pendingByCategory = [
    { category: "PowerHub Pro", count: 2 },
    { category: "PowerHub Max", count: 1 },
    { category: "PowerHub Ultra", count: 1 },
    { category: "PowerPlay Pro", count: 1 },
  ]

  const unpaidList = mockProspects.filter((p) => p.isAssigned && !p.paymentConfirmed)

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
          Analytics
        </Badge>
        <span className="text-xs text-muted-foreground">
          Last updated: just now
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Data from:</Label>
            <Input
              type="date"
              className="h-8 w-36 text-xs"
              value={cutoffDate}
              onChange={(e) => setCutoffDate(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="size-8" aria-label="Filter by region">
            <Globe className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Refresh"
            onClick={() => toast.info("Analytics refreshed.")}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.label}
              className="rounded-xl border border-border bg-card p-4 text-left transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-lg ${card.bgClass}`}>
                  <Icon className={`size-4 ${card.colorClass}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{card.value}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Pending by Category */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <HourglassIcon className="size-4 text-[#92400E] dark:text-warning" />
            Pending Assignments by Product Category
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {mockAnalyticsSummary.totalPending} total
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => toast.info("Export feature coming soon.")}
            >
              <Download className="size-3" />
              Export
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          {pendingByCategory.map((cat) => (
            <button
              key={cat.category}
              className="rounded-lg border border-border bg-muted/30 p-3 text-left transition-all hover:border-primary/30 hover:bg-accent"
            >
              <p className="text-xl font-bold text-foreground">{cat.count}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{cat.category}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Assigned Unpaid Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="size-4 text-destructive" />
            Assigned Units - Payment Unconfirmed
          </h3>
          <Badge variant="outline" className="text-[10px]">
            {unpaidList.length} total
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Prospect ID</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Unit #</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Area</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Approval Date</th>
              </tr>
            </thead>
            <tbody>
              {unpaidList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                    No unpaid assigned units.
                  </td>
                </tr>
              ) : (
                unpaidList.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-foreground">{p.id}</td>
                    <td className="px-4 py-2.5 text-xs font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-2.5 text-xs text-foreground max-w-[200px] truncate">{p.productName}</td>
                    <td className="px-4 py-2.5 font-mono text-xs font-medium text-foreground">{p.unitNumber}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className="text-[10px]">{p.area}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.approvalDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overdue Placeholder */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Flame className="size-4 text-destructive" />
            {"Overdue Assignments (>72h)"}
          </h3>
          <Badge variant="outline" className="text-[10px]">
            {mockAnalyticsSummary.totalOverdue} total
          </Badge>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <Flame className="mx-auto size-8 text-destructive/40" />
          <p className="mt-2 text-sm">{mockAnalyticsSummary.totalOverdue} overdue assignment(s) require attention</p>
        </div>
      </div>
    </div>
  )
}
