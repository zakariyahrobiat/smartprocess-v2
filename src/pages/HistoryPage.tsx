import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-provider"
import { cn } from "@/lib/utils"
import {
  subscribeToUserSubmissions, type FirestoreSubmission,
} from "@/lib/submissionService"
import {
  subscribeToMyInvoices, subscribeToMyRefunds,
  type Invoice, type Refund,
} from "@/lib/imsService"
import FormatAmount from "@/components/formatAmount"
import FormatDate from "@/components/formatDate"
import { Receipt, RefreshCw, FileText, CheckCircle2, XCircle, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { format, isSameMonth } from "date-fns"

const FLAG: Record<string, string> = {
  Nigeria: "🇳🇬", "Sierra Leone": "🇸🇱", Cameroon: "🇨🇲",
  Togo: "🇹🇬", "Benin Republic": "🇧🇯", "South Africa": "🇿🇦",
}

function toDate(val: unknown): Date {
  if (!val) return new Date()
  if (val instanceof Date) return val
  if (typeof val === "object" && val !== null && "toDate" in val)
    return (val as { toDate: () => Date }).toDate()
  return new Date(val as string)
}

type EntryType = "invoice" | "refund" | "request"
type StatusKey = "approved" | "paid" | "rejected" | "pending" | "processing"
type FilterType = "all" | "invoice" | "refund" | "request"

interface HistoryEntry {
  id: string
  type: EntryType
  title: string
  meta: string
  amount?: string
  status: string
  statusKey: StatusKey
  date: Date
}

function getStatusKey(status: string): StatusKey {
  const s = status.toLowerCase()
  if (s === "paid")     return "paid"
  if (s === "approved" || s.includes("approved")) return "approved"
  if (s === "rejected") return "rejected"
  if (s === "processing") return "processing"
  return "pending"
}

const statusConfig: Record<StatusKey, { label: string; icon: React.ElementType; dot: string; text: string }> = {
  approved:   { label: "Approved",   icon: CheckCircle2, dot: "bg-sk-teal",   text: "text-sk-teal" },
  paid:       { label: "Paid",       icon: CheckCircle2, dot: "bg-green-500", text: "text-green-600 dark:text-green-400" },
  rejected:   { label: "Rejected",   icon: XCircle,      dot: "bg-destructive", text: "text-destructive" },
  pending:    { label: "Pending",    icon: Clock,        dot: "bg-amber-400", text: "text-amber-600 dark:text-amber-400" },
  processing: { label: "Processing", icon: Clock,        dot: "bg-sk-teal",   text: "text-sk-teal" },
}

const typeConfig: Record<EntryType, { icon: React.ElementType; accent: string; bg: string; pill: string; label: string }> = {
  invoice: { icon: Receipt,   accent: "text-sk-orange", bg: "bg-sk-orange/10", pill: "bg-sk-orange/10 text-sk-orange", label: "Invoice" },
  refund:  { icon: RefreshCw, accent: "text-sk-teal",   bg: "bg-sk-teal/10",   pill: "bg-sk-teal/10 text-sk-teal",   label: "Refund" },
  request: { icon: FileText,  accent: "text-amber-500", bg: "bg-amber-500/10", pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400", label: "Request" },
}

function groupByMonth(entries: HistoryEntry[]): { label: string; entries: HistoryEntry[] }[] {
  const groups: { label: string; entries: HistoryEntry[]; date: Date }[] = []
  for (const entry of entries) {
    const existing = groups.find(g => isSameMonth(g.date, entry.date))
    if (existing) {
      existing.entries.push(entry)
    } else {
      groups.push({
        label: format(entry.date, "MMMM yyyy"),
        date:  entry.date,
        entries: [entry],
      })
    }
  }
  return groups
}

export default function HistoryPage() {
  const { currentUser } = useAuth()
  const [invoices,  setInvoices]  = useState<Invoice[]>([])
  const [refunds,   setRefunds]   = useState<Refund[]>([])
  const [requests,  setRequests]  = useState<FirestoreSubmission[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<FilterType>("all")
  const [expanded,  setExpanded]  = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) return
    let done = 0
    const check = () => { if (++done >= 3) setLoading(false) }
    const u1 = subscribeToMyInvoices(currentUser.email,  d => { setInvoices(d);  check() })
    const u2 = subscribeToMyRefunds(currentUser.email,   d => { setRefunds(d);   check() })
    const u3 = subscribeToUserSubmissions(currentUser.uid, d => { setRequests(d); check() })
    return () => { u1(); u2(); u3() }
  }, [currentUser])

  const invEntries: HistoryEntry[] = invoices.map(inv => ({
    id: `inv-${inv.id}`, type: "invoice",
    title: inv.vendor,
    meta: `${inv.requestId} · ${FLAG[inv.country] ?? ""} ${inv.country} · ${inv.department}`,
    amount: FormatAmount(inv.amount, inv.currency),
    status: inv.status,
    statusKey: getStatusKey(inv.status),
    date: toDate(inv.createdAt),
  }))

  const refEntries: HistoryEntry[] = refunds.map(r => ({
    id: `ref-${r.id}`, type: "refund",
    title: r.customerName,
    meta: `${r.referenceNumber} · ${FLAG[r.country] ?? ""} ${r.country} · ${r.bankName}`,
    amount: FormatAmount(r.amount, r.currency),
    status: r.status,
    statusKey: getStatusKey(r.status),
    date: toDate(r.submissionDate),
  }))

  const reqEntries: HistoryEntry[] = requests.map(req => ({
    id: `req-${req.id}`, type: "request",
    title: req.title,
    meta: `${req.requestId} · ${req.department} · ${req.priority} priority`,
    status: req.status,
    statusKey: getStatusKey(req.status),
    date: toDate(req.submittedAt),
  }))

  const all: HistoryEntry[] = [
    ...invEntries, ...refEntries, ...reqEntries,
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  const shown = filter === "all" ? all :
    filter === "invoice" ? invEntries :
    filter === "refund"  ? refEntries : reqEntries

  const groups = groupByMonth(shown)

  // Stats
  const total    = all.length
  const approved = all.filter(e => e.statusKey === "approved" || e.statusKey === "paid").length
  const pending  = all.filter(e => e.statusKey === "pending" || e.statusKey === "processing").length
  const rejected = all.filter(e => e.statusKey === "rejected").length
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">History</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personal audit trail across all modules</p>
      </div>

      {/* Stats bar */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Submitted", value: total,        sub: "All time",        accent: "border-l-sk-orange", val: "text-foreground" },
            { label: "Approval Rate",   value: `${approvalRate}%`, sub: `${approved} approved`, accent: "border-l-sk-teal", val: "text-sk-teal" },
            { label: "Pending",         value: pending,      sub: "Awaiting action", accent: "border-l-amber-400", val: "text-amber-600 dark:text-amber-400" },
            { label: "Rejected",        value: rejected,     sub: "Need resubmission",accent: "border-l-destructive", val: "text-destructive" },
          ].map(s => (
            <div key={s.label} className={cn("bg-card rounded-xl border border-border border-l-4 p-4", s.accent)}>
              <p className={cn("text-2xl font-bold leading-none", s.val)}>{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1.5">{s.label}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          ["all",     "All",      all.length],
          ["invoice", "Invoices", invEntries.length],
          ["refund",  "Refunds",  refEntries.length],
          ["request", "Requests", reqEntries.length],
        ] as const).filter(([id]) => id === "all" || (id === "invoice" ? invEntries.length : id === "refund" ? refEntries.length : reqEntries.length) > 0)
         .map(([id, label, count]) => (
          <button key={id}
            onClick={() => setFilter(id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              filter === id
                ? "bg-sk-teal text-white border-sk-teal"
                : "bg-background text-muted-foreground border-border hover:border-sk-teal/50"
            )}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-8">
          {[0, 1].map(g => (
            <div key={g}>
              <div className="h-4 w-28 bg-muted rounded animate-pulse mb-4" />
              {[0,1,2].map(i => (
                <div key={i} className="flex gap-4 mb-4">
                  <div className="flex flex-col items-center">
                    <div className="size-3 rounded-full bg-muted mt-1" />
                    <div className="w-0.5 flex-1 bg-border mt-1" />
                  </div>
                  <div className="flex-1 pb-4 space-y-2">
                    <div className="h-4 w-40 bg-muted rounded" />
                    <div className="h-3 w-28 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <TrendingUp className="size-12 text-muted-foreground/30" />
          <p className="text-sm font-medium text-foreground">No history yet</p>
          <p className="text-xs text-muted-foreground">Submit your first invoice or request to see your audit trail here.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map(group => (
            <div key={group.label}>
              {/* Month header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{group.entries.length} items</span>
              </div>

              {/* Entries */}
              <div className="space-y-0">
                {group.entries.map((entry, idx) => {
                  const tc    = typeConfig[entry.type]
                  const sc    = statusConfig[entry.statusKey]
                  const Icon  = tc.icon
                  const SIcon = sc.icon
                  const isLast = idx === group.entries.length - 1
                  const isOpen = expanded === entry.id

                  return (
                    <div key={entry.id} className="flex gap-4">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <div className={cn("size-2.5 rounded-full mt-4 shrink-0 ring-2 ring-background", sc.dot)} />
                        {!isLast && <div className="w-px flex-1 bg-border mx-auto mt-1" />}
                      </div>

                      {/* Card */}
                      <div className={cn("flex-1 mb-3", !isLast && "pb-0")}>
                        <button
                          onClick={() => setExpanded(isOpen ? null : entry.id)}
                          className="w-full text-left rounded-xl border border-border bg-card hover:border-sk-teal/30 hover:bg-muted/20 transition-all p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn("flex size-8 items-center justify-center rounded-lg shrink-0", tc.bg)}>
                              <Icon className={cn("size-3.5", tc.accent)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-foreground truncate">{entry.title}</span>
                                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide", tc.pill)}>
                                  {tc.label}
                                </span>
                                <span className={cn("flex items-center gap-1 text-[10px] font-medium ml-auto", sc.text)}>
                                  <SIcon className="size-3" /> {entry.status.replace("Pending ", "").replace(" Approval", "")}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.meta}</p>
                              <div className="flex items-center justify-between mt-1.5">
                                {entry.amount && (
                                  <span className={cn("text-xs font-bold", tc.accent)}>{entry.amount}</span>
                                )}
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                  {format(entry.date, "d MMM yyyy · HH:mm")}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Expanded detail */}
                          {isOpen && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground font-mono">{entry.meta}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md", sc.text,
                                  entry.statusKey === "approved" ? "bg-sk-teal/10" :
                                  entry.statusKey === "paid"     ? "bg-green-500/10" :
                                  entry.statusKey === "rejected" ? "bg-destructive/10" :
                                  "bg-amber-500/10")}>
                                  <SIcon className="size-3" /> {entry.status}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Submitted {format(entry.date, "EEEE, d MMMM yyyy 'at' HH:mm")}
                                </span>
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
