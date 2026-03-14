import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-provider"
import {
  subscribeToAllInvoices, subscribeToAllRefunds,
  type Invoice, type Refund,
} from "@/lib/imsService"
import {
  FileText, RefreshCw, UserCheck, CheckCircle2,
  ArrowRight, TrendingUp, Clock, AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import FormatAmount from "@/components/formatAmount"
import FormatDate from "@/components/formatDate"

function StatCard({
  icon: Icon, label, value, sub, accent, onClick,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  sub?: string
  accent: "orange" | "teal" | "green" | "gold"
  onClick?: () => void
}) {
  const colors = {
    orange: { bg: "bg-sk-orange/10", text: "text-sk-orange", border: "border-l-sk-orange" },
    teal:   { bg: "bg-sk-teal/10",   text: "text-sk-teal",   border: "border-l-sk-teal" },
    green:  { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", border: "border-l-green-500" },
    gold:   { bg: "bg-sk-gold/10",   text: "text-amber-600 dark:text-amber-400", border: "border-l-sk-gold" },
  }[accent]

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border border-border bg-card p-5 border-l-4 transition-all hover:shadow-md hover:-translate-y-0.5",
        colors.border
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("flex size-9 items-center justify-center rounded-lg", colors.bg)}>
          <Icon className={cn("size-4", colors.text)} />
        </div>
        {onClick && <ArrowRight className="size-3.5 text-muted-foreground mt-1" />}
      </div>
      <p className="text-3xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-sm text-muted-foreground mt-1.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/70 mt-1">{sub}</p>}
    </button>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { currentUser, can } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [loading, setLoading] = useState(true)

  const canViewAll = can("ims_view_all_invoices")

  useEffect(() => {
    if (!can("ims_view_own_invoices")) { setLoading(false); return }
    let done = 0
    const check = () => { done++; if (done === 2) setLoading(false) }
    const u1 = subscribeToAllInvoices(d => { setInvoices(d); check() })
    const u2 = subscribeToAllRefunds(d => { setRefunds(d); check() })
    return () => { u1(); u2() }
  }, [])

  const pendingInvoices = invoices.filter(i => i.status.startsWith("Pending"))
  const pendingRefunds  = refunds.filter(r => r.status.startsWith("Pending"))
  const paidInvoices    = invoices.filter(i => i.status === "Paid")

  const recentInvoices = [...invoices]
    .sort((a, b) => FormatDate(b.createdAt).getTime() - FormatDate(a.createdAt).getTime())
    .slice(0, 5)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const firstName = currentUser?.displayName?.split(" ")[0] ?? "there"

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening across Sun King operations today.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-sk-teal/10 border border-sk-teal/20 rounded-lg px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-sk-teal animate-pulse" />
          <span className="text-xs font-medium text-sk-teal">Live</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Pending Invoices"
          value={loading ? "—" : pendingInvoices.length}
          sub={canViewAll ? "All countries" : "Your invoices"}
          accent="orange"
          onClick={() => navigate("/ims/invoices")}
        />
        <StatCard
          icon={RefreshCw}
          label="Pending Refunds"
          value={loading ? "—" : pendingRefunds.length}
          accent="teal"
          onClick={() => navigate("/ims/refunds")}
        />
        <StatCard
          icon={UserCheck}
          label="Paid This Month"
          value={loading ? "—" : paidInvoices.length}
          sub="Invoices paid"
          accent="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Invoices"
          value={loading ? "—" : invoices.length}
          accent="gold"
          onClick={() => navigate("/ims/invoices")}
        />
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recent Invoices</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Latest submissions across all countries</p>
            </div>
            <button
              onClick={() => navigate("/ims/invoices")}
              className="text-xs font-medium text-sk-teal hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="size-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="ml-auto h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
              ))
            ) : recentInvoices.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                No invoices yet
              </div>
            ) : (
              recentInvoices.map(inv => (
                <button
                  key={inv.id}
                  onClick={() => navigate(`/ims/invoices/${inv.id}`)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-sk-orange/10 shrink-0">
                    <FileText className="size-3.5 text-sk-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{inv.vendor}</p>
                    <p className="text-xs text-muted-foreground font-mono">{inv.requestId}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">
                      {FormatAmount(inv.amount, inv.currency)}
                    </p>
                    <StatusPill status={inv.status} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions / FY27 Goals */}
        <div className="rounded-xl border border-border bg-card flex flex-col">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Common tasks for your role</p>
          </div>
          <div className="p-4 space-y-2 flex-1">
            {can("ims_submit_invoice") && (
              <QuickAction
                icon={FileText}
                label="Submit Invoice"
                sub="Raise a new vendor payment"
                onClick={() => navigate("/ims/invoices/new")}
                accent="orange"
              />
            )}
            {can("ims_submit_refund") && (
              <QuickAction
                icon={RefreshCw}
                label="Submit Refund"
                sub="Request a customer refund"
                onClick={() => navigate("/ims/refunds/new")}
                accent="teal"
              />
            )}
            {can("ims_view_all_invoices") && pendingInvoices.length > 0 && (
              <QuickAction
                icon={AlertCircle}
                label={`${pendingInvoices.length} Invoices Need Approval`}
                sub="Review and action pending items"
                onClick={() => navigate("/ims/invoices")}
                accent="orange"
                highlight
              />
            )}
            {can("approve_requests") && (
              <QuickAction
                icon={CheckCircle2}
                label="Pending Actions"
                sub="Review submissions awaiting your approval"
                onClick={() => navigate("/pending")}
                accent="teal"
              />
            )}
            {can("submit_requests") && (
              <QuickAction
                icon={Clock}
                label="My Submissions"
                sub="Track your submitted requests"
                onClick={() => navigate("/submissions")}
                accent="gold"
              />
            )}
          </div>

          {/* FY27 Banner */}
          <div className="m-4 mt-0 rounded-lg bg-[#1D3461] p-4">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">FY27 Targets</p>
            <div className="flex gap-4 flex-wrap">
              {[
                { label: "TAT", value: "<24h" },
                { label: "Manual Follow-ups", value: "0" },
                { label: "Audit Coverage", value: "100%" },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <p className="text-base font-bold text-sk-gold leading-none">{m.value}</p>
                  <p className="text-[10px] text-white/60 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const isPending  = status.startsWith("Pending")
  const isApproved = status === "Approved" || status === "Processing"
  const isPaid     = status === "Paid"
  const isRejected = status === "Rejected"
  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium mt-0.5",
      isPending  && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      isApproved && "bg-sk-teal/10 text-sk-teal",
      isPaid     && "bg-green-500/10 text-green-600 dark:text-green-400",
      isRejected && "bg-destructive/10 text-destructive",
      !isPending && !isApproved && !isPaid && !isRejected && "bg-muted text-muted-foreground",
    )}>
      {status.replace("Pending ", "").replace(" Approval", "")}
    </span>
  )
}

function QuickAction({
  icon: Icon, label, sub, onClick, accent, highlight,
}: {
  icon: React.ElementType
  label: string
  sub: string
  onClick: () => void
  accent: "orange" | "teal" | "green" | "gold"
  highlight?: boolean
}) {
  const colors = {
    orange: "bg-sk-orange/10 text-sk-orange",
    teal:   "bg-sk-teal/10 text-sk-teal",
    green:  "bg-green-500/10 text-green-600 dark:text-green-400",
    gold:   "bg-sk-gold/10 text-amber-600 dark:text-amber-400",
  }[accent]
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50",
        highlight && "border border-sk-orange/30 bg-sk-orange/5"
      )}
    >
      <div className={cn("flex size-8 items-center justify-center rounded-lg shrink-0", colors)}>
        <Icon className="size-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground leading-tight mt-0.5">{sub}</p>
      </div>
      <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
    </button>
  )
}
