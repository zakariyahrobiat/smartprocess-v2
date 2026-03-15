import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-provider"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Timestamp } from "firebase/firestore"
import {
  subscribeToPendingSubmissions, updateSubmissionStatus,
  type FirestoreSubmission,
} from "@/lib/submissionService"
import {
  subscribeToAllInvoices, subscribeToAllRefunds,
  subscribeToMyInvoices, subscribeToMyRefunds,
  updateInvoiceStatus, updateRefundStatus,
  AMOUNT_THRESHOLDS,
  type Invoice, type Refund, type RefundStatus,
} from "@/lib/imsService"
import {
  processFlows, stepLabels,
} from "@/lib/store"
import { Stepper } from "@/components/shared/stepper"
import { InvoiceStepper } from "@/components/ims/invoiceWorkFlow"
import { RefundStepper } from "@/components/ims/RefundWorkFlow"
import StatusBadge from "@/components/ims/statusBadge"
import { StatusBadge as SPBadge } from "@/components/smart-process/status-badge"
import FormatAmount from "@/components/formatAmount"
import FormatDate from "@/components/formatDate"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2, XCircle, MessageSquare, Loader2,
  Receipt, RefreshCw, FileText, AlertCircle, X,
  ClipboardCheck, Building2, DollarSign, User, MapPin, Hash, Calendar,
  Laptop, Plane, CalendarDays, Package, Users, Wallet,
} from "lucide-react"

const FLAG: Record<string, string> = {
  Nigeria: "🇳🇬", "Sierra Leone": "🇸🇱", Cameroon: "🇨🇲",
  Togo: "🇹🇬", "Benin Republic": "🇧🇯", "South Africa": "🇿🇦",
}
const iconMap: Record<string, React.ElementType> = {
  laptop: Laptop, plane: Plane, calendar: CalendarDays,
  box: Package, users: Users, wallet: Wallet,
}
function toDate(val: unknown): Date {
  if (!val) return new Date()
  if (val instanceof Date) return val
  if (typeof val === "object" && val !== null && "toDate" in val)
    return (val as { toDate: () => Date }).toDate()
  return new Date(val as string)
}

type ItemType = "invoice" | "refund" | "request"
type SourceFilter = "all" | "invoice" | "refund" | "request"

interface PendingItem {
  id: string
  type: ItemType
  title: string
  subtitle: string
  action: string
  amount?: string
  time: Date
  raw: Invoice | Refund | FirestoreSubmission
}

export default function PendingActionsPage() {
  const { currentUser, can } = useAuth()
  const [invoices,   setInvoices]   = useState<Invoice[]>([])
  const [refunds,    setRefunds]    = useState<Refund[]>([])
  const [requests,   setRequests]   = useState<FirestoreSubmission[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState<SourceFilter>("all")
  const [selected,   setSelected]   = useState<PendingItem | null>(null)
  const [comment,    setComment]    = useState("")
  const [isActing,   setIsActing]   = useState(false)

  const canApproveInv = can("ims_approve_invoice_finance") || can("ims_approve_invoice_senior") || can("ims_approve_invoice_line_manager")
  const canMarkInvPaid = can("ims_mark_invoice_paid")
  const canApproveRec  = can("ims_approve_refund_receivable")
  const canApproveFin  = can("ims_approve_refund_final")
  const canMarkRefPaid = can("ims_mark_refund_paid")

  useEffect(() => {
    if (!currentUser) return
    let done = 0
    const check = () => { if (++done >= 3) setLoading(false) }
    const canViewAll = can("ims_view_all_invoices")

    const u1 = canViewAll
      ? subscribeToAllInvoices(d => { setInvoices(d); check() })
      : subscribeToMyInvoices(currentUser.email, d => { setInvoices(d); check() })
    const u2 = canViewAll
      ? subscribeToAllRefunds(d => { setRefunds(d); check() })
      : subscribeToMyRefunds(currentUser.email, d => { setRefunds(d); check() })
    const u3 = subscribeToPendingSubmissions(d => { setRequests(d); check() })
    return () => { u1(); u2(); u3() }
  }, [currentUser])

  // ── Build unified pending list ────────────────────────────────────────────
  const isMyTurnInvoice = (inv: Invoice) => {
    if (!canApproveInv && !canMarkInvPaid) return false
    if (inv.status === "Pending Line Manager Approval") {
      if (!currentUser?.email) return false
      const emails = inv.lineManagerEmail.split(",").map(e => e.trim().toLowerCase())
      return emails[inv.approvalIndex] === currentUser.email.toLowerCase()
    }
    if (inv.status === "Pending Finance Approval")  return can("ims_approve_invoice_finance")
    if (inv.status === "Pending Manager Approval")  return can("ims_approve_invoice_senior")
    if (inv.status === "Processing")                return canMarkInvPaid
    return false
  }

  const isMyTurnRefund = (r: Refund) => {
    if (r.status === "Pending Receivable Approval") return canApproveRec
    if (r.status === "Pending Approval")            return canApproveFin
    if (r.status === "Processing")                  return canMarkRefPaid
    return false
  }

  const actionLabel = {
    "Pending Line Manager Approval":  "Line Manager approval",
    "Pending Finance Approval":       "Finance approval",
    "Pending Manager Approval":       "Senior Manager approval",
    "Processing":                     "Mark as paid",
    "Pending Receivable Approval":    "Receivable approval",
    "Pending Approval":               "Final approval",
  } as Record<string, string>

  const pendingInvoices: PendingItem[] = invoices
    .filter(isMyTurnInvoice)
    .map(inv => ({
      id: inv.id!, type: "invoice" as const,
      title: inv.vendor,
      subtitle: `${inv.requestId} · ${FLAG[inv.country] ?? ""} ${inv.country}`,
      action: actionLabel[inv.status] ?? inv.status,
      amount: FormatAmount(inv.amount, inv.currency),
      time: toDate(inv.createdAt),
      raw: inv,
    }))

  const pendingRefunds: PendingItem[] = refunds
    .filter(isMyTurnRefund)
    .map(r => ({
      id: r.id!, type: "refund" as const,
      title: r.customerName,
      subtitle: `${r.referenceNumber} · ${FLAG[r.country] ?? ""} ${r.country}`,
      action: actionLabel[r.status] ?? r.status,
      amount: FormatAmount(r.amount, r.currency),
      time: toDate(r.submissionDate),
      raw: r,
    }))

  const pendingRequests: PendingItem[] = requests.map(req => ({
    id: req.id!, type: "request" as const,
    title: req.title,
    subtitle: `${req.requestId} · by ${req.submittedBy}`,
    action: "Review & approve",
    time: toDate(req.submittedAt),
    raw: req,
  }))

  const all: PendingItem[] = [
    ...pendingInvoices, ...pendingRefunds, ...pendingRequests,
  ].sort((a, b) => b.time.getTime() - a.time.getTime())

  const shown = filter === "all" ? all :
    filter === "invoice" ? pendingInvoices :
    filter === "refund"  ? pendingRefunds  : pendingRequests

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleInvoiceApprove = async (inv: Invoice) => {
    if (!inv.id) return
    setIsActing(true)
    try {
      const managers  = inv.lineManagerEmail.split(",").map(e => e.trim())
      let newStatus: Invoice["status"]
      let newIndex    = inv.approvalIndex
      const exceeds   = inv.amount >= (AMOUNT_THRESHOLDS[inv.country] ?? Infinity)
      if (inv.status === "Pending Line Manager Approval") {
        newIndex++
        newStatus = newIndex < managers.length ? "Pending Line Manager Approval" : "Pending Finance Approval"
      } else if (inv.status === "Pending Finance Approval") {
        newStatus = exceeds ? "Pending Manager Approval" : "Approved"
        newIndex  = managers.length + 1
      } else { newStatus = "Approved" }
      await updateInvoiceStatus(inv.id, { status: newStatus, approvalIndex: newIndex })
      toast.success("Invoice approved", { description: `New status: ${newStatus}` })
      setSelected(null); setComment("")
    } catch(e) { toast.error(e instanceof Error ? e.message : "Failed") }
    finally { setIsActing(false) }
  }

  const handleInvoiceReject = async (inv: Invoice) => {
    if (!comment.trim()) { toast.error("Add a rejection reason"); return }
    if (!inv.id) return
    setIsActing(true)
    try {
      await updateInvoiceStatus(inv.id, { status: "Rejected", rejectionReason: comment })
      toast.success("Invoice rejected")
      setSelected(null); setComment("")
    } catch { toast.error("Failed") } finally { setIsActing(false) }
  }

  const handleInvoicePaid = async (inv: Invoice) => {
    if (!inv.id) return
    setIsActing(true)
    try {
      await updateInvoiceStatus(inv.id, { status: "Paid" })
      toast.success("Marked as paid")
      setSelected(null)
    } catch { toast.error("Failed") } finally { setIsActing(false) }
  }

  const handleRefundApprove = async (r: Refund) => {
    if (!r.id) return
    setIsActing(true)
    try {
      const isRec     = r.status === "Pending Receivable Approval"
      const newStatus: RefundStatus = isRec ? "Pending Approval" : "Approved"
      await updateRefundStatus(r.id, {
        status: newStatus,
        ...(isRec ? { receivableApprovalDate: Timestamp.now() } : { approvalDate: Timestamp.now() })
      })
      toast.success(isRec ? "Forwarded for final approval" : "Refund approved")
      setSelected(null); setComment("")
    } catch { toast.error("Failed") } finally { setIsActing(false) }
  }

  const handleRefundReject = async (r: Refund) => {
    if (!comment.trim()) { toast.error("Add a rejection reason"); return }
    if (!r.id) return
    setIsActing(true)
    try {
      await updateRefundStatus(r.id, { status: "Rejected", rejectionReason: comment })
      toast.success("Refund rejected")
      setSelected(null); setComment("")
    } catch { toast.error("Failed") } finally { setIsActing(false) }
  }

  const handleRequestAction = async (req: FirestoreSubmission, action: "approve"|"reject"|"clarify") => {
    if (!comment.trim() && action !== "approve") { toast.error("Add a comment"); return }
    if (!req.id) return
    setIsActing(true)
    try {
      const statusMap = { approve: "approved" as const, reject: "rejected" as const, clarify: "needs-info" as const }
      await updateSubmissionStatus(req.id, statusMap[action], comment)
      toast.success(action === "approve" ? "Request approved" : action === "reject" ? "Request rejected" : "Clarification sent")
      setSelected(null); setComment("")
    } catch { toast.error("Failed") } finally { setIsActing(false) }
  }

  // ── Item row ───────────────────────────────────────────────────────────────
  const typeConfig = {
    invoice: { label: "Invoice", icon: Receipt,    accent: "text-sk-orange", bg: "bg-sk-orange/10", pill: "bg-sk-orange/10 text-sk-orange" },
    refund:  { label: "Refund",  icon: RefreshCw,  accent: "text-sk-teal",   bg: "bg-sk-teal/10",   pill: "bg-sk-teal/10 text-sk-teal" },
    request: { label: "Request", icon: FileText,   accent: "text-amber-500", bg: "bg-amber-500/10", pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left list */}
      <div className={cn(
        "flex flex-col border-r border-border bg-card shrink-0 transition-all duration-200",
        selected ? "w-[360px]" : "w-full max-w-2xl"
      )}>
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-foreground">Pending Actions</h1>
                {!loading && all.length > 0 && (
                  <span className="flex items-center justify-center rounded-full bg-sk-orange text-white text-[10px] font-bold min-w-5 h-5 px-1.5">
                    {all.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Items across all modules requiring your action</p>
            </div>
          </div>
          {/* Source filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {([
              ["all",     "All",          all.length],
              ["invoice", "Invoices",     pendingInvoices.length],
              ["refund",  "Refunds",      pendingRefunds.length],
              ["request", "Requests",     pendingRequests.length],
            ] as const).filter(([id]) => id === "all" || (id === "invoice" ? pendingInvoices.length : id === "refund" ? pendingRefunds.length : pendingRequests.length) > 0)
             .map(([id, label, count]) => (
              <button key={id}
                onClick={() => setFilter(id)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  filter === id
                    ? "bg-sk-orange text-white border-sk-orange"
                    : "bg-background text-muted-foreground border-border hover:border-sk-orange/50"
                )}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 py-4 space-y-2 animate-pulse">
                <div className="h-3.5 w-40 bg-muted rounded" />
                <div className="h-3 w-28 bg-muted rounded" />
              </div>
            ))
          ) : shown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <CheckCircle2 className="size-10 text-muted-foreground/30" />
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground">No pending items require your attention.</p>
            </div>
          ) : (
            shown.map(item => {
              const cfg  = typeConfig[item.type]
              const Icon = cfg.icon
              const isSelected = selected?.id === item.id && selected?.type === item.type
              return (
                <button key={`${item.type}-${item.id}`}
                  onClick={() => { setSelected(item); setComment("") }}
                  className={cn(
                    "w-full text-left px-4 py-3.5 border-l-[3px] transition-all hover:bg-muted/40",
                    isSelected ? "border-l-sk-orange bg-sk-orange/5" : "border-l-transparent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("flex size-8 items-center justify-center rounded-lg shrink-0 mt-0.5", cfg.bg)}>
                      <Icon className={cn("size-3.5", cfg.accent)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-foreground truncate">{item.title}</span>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0", cfg.pill)}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] text-muted-foreground">
                          ⚡ {item.action}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.amount && <span className={cn("text-xs font-bold", cfg.accent)}>{item.amount}</span>}
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(item.time, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right panel */}
      {selected && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-border shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">{selected.title}</h2>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide", typeConfig[selected.type].pill)}>
                  {typeConfig[selected.type].label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{selected.subtitle}</p>
            </div>
            <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 hover:bg-muted transition-colors shrink-0">
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {selected.type === "invoice" && (() => {
              const inv = selected.raw as Invoice
              return (
                <>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Workflow Progress</p>
                    <InvoiceStepper invoice={inv} />
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Invoice Details</p>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {[
                        { icon: DollarSign, label: "Amount",     value: `${FormatAmount(inv.amount, inv.currency)} ${inv.currency}` },
                        { icon: Building2,  label: "Department", value: inv.department },
                        { icon: Hash,       label: "Invoice No.", value: inv.invoiceNumber },
                        { icon: MapPin,     label: "Country",    value: `${FLAG[inv.country] ?? ""} ${inv.country}` },
                        { icon: User,       label: "Submitted",  value: inv.submitterName || inv.submitterEmail },
                        { icon: Calendar,   label: "Date",       value: FormatDate(inv.createdAt).toLocaleDateString("en-GB") },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-2">
                          <Icon className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                          <div>
                            <dt className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</dt>
                            <dd className="text-sm font-medium text-foreground mt-0.5">{value}</dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>
                </>
              )
            })()}

            {selected.type === "refund" && (() => {
              const r = selected.raw as Refund
              return (
                <>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Workflow Progress</p>
                    <RefundStepper refund={r} />
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Refund Details</p>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {[
                        { icon: User,       label: "Customer", value: r.customerName },
                        { icon: DollarSign, label: "Amount",   value: `${FormatAmount(r.amount, r.currency)} ${r.currency}` },
                        { icon: Building2,  label: "Bank",     value: r.bankName },
                        { icon: Hash,       label: "Account",  value: r.accountNumber },
                        { icon: MapPin,     label: "Country",  value: `${FLAG[r.country] ?? ""} ${r.country}` },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-2">
                          <Icon className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                          <div>
                            <dt className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</dt>
                            <dd className="text-sm font-medium text-foreground mt-0.5">{value}</dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>
                </>
              )
            })()}

            {selected.type === "request" && (() => {
              const req = selected.raw as FirestoreSubmission
              const flow = processFlows.find(p => p.id === req.processType)
              return (
                <>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Progress</p>
                    <Stepper steps={stepLabels} currentStep={req.currentStep} />
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Request Details</p>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {[
                        { label: "Process",    value: flow?.title ?? req.processType },
                        { label: "Department", value: req.department },
                        { label: "Priority",   value: req.priority },
                        { label: "Submitted",  value: formatDistanceToNow(toDate(req.submittedAt), { addSuffix: true }) },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <dt className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</dt>
                          <dd className="text-sm font-medium text-foreground mt-0.5 capitalize">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    {req.description && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <dt className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Description</dt>
                        <dd className="text-sm text-foreground leading-relaxed">{req.description}</dd>
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </div>

          {/* Action bar */}
          <div className="shrink-0 border-t border-border px-6 py-4 bg-card space-y-3">
            {(selected.type === "invoice" && (selected.raw as Invoice).status !== "Processing") ||
             (selected.type === "refund"  && (selected.raw as Refund).status !== "Processing")  ||
              selected.type === "request" ? (
              <input
                type="text"
                placeholder="Add a comment (required for rejection)"
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-sk-teal focus:outline-none"
              />
            ) : null}
            <div className="flex gap-2">
              {selected.type === "invoice" && (() => {
                const inv = selected.raw as Invoice
                if (inv.status === "Processing") return (
                  <Button onClick={() => handleInvoicePaid(inv)} disabled={isActing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    {isActing ? <Loader2 className="size-4 animate-spin"/> : <CheckCircle2 className="size-4"/>}
                    Mark as Paid
                  </Button>
                )
                const label = inv.status === "Pending Line Manager Approval" ? "Approve (Line Mgr)" :
                              inv.status === "Pending Finance Approval"      ? "Approve (Finance)" :
                              "Approve (Senior Mgr)"
                return (<>
                  <Button onClick={() => handleInvoiceApprove(inv)} disabled={isActing}
                    className="flex-1 bg-sk-orange hover:bg-sk-orange-hover text-white gap-2">
                    {isActing ? <Loader2 className="size-4 animate-spin"/> : <CheckCircle2 className="size-4"/>}
                    {label}
                  </Button>
                  <Button onClick={() => handleInvoiceReject(inv)} disabled={isActing}
                    variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-2">
                    <XCircle className="size-4"/> Reject
                  </Button>
                </>)
              })()}
              {selected.type === "refund" && (() => {
                const r = selected.raw as Refund
                if (r.status === "Processing") return (
                  <Button onClick={() => updateRefundStatus(r.id!, { status: "Paid" }).then(() => { toast.success("Paid"); setSelected(null) })}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <CheckCircle2 className="size-4"/> Mark as Paid
                  </Button>
                )
                return (<>
                  <Button onClick={() => handleRefundApprove(r)} disabled={isActing}
                    className="flex-1 bg-sk-teal hover:bg-sk-teal-hover text-white gap-2">
                    {isActing ? <Loader2 className="size-4 animate-spin"/> : <CheckCircle2 className="size-4"/>}
                    {r.status === "Pending Receivable Approval" ? "Approve & Forward" : "Final Approve"}
                  </Button>
                  <Button onClick={() => handleRefundReject(r)} disabled={isActing}
                    variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-2">
                    <XCircle className="size-4"/> Reject
                  </Button>
                </>)
              })()}
              {selected.type === "request" && (() => {
                const req = selected.raw as FirestoreSubmission
                return (<>
                  <Button onClick={() => handleRequestAction(req, "approve")} disabled={isActing}
                    className="flex-1 bg-sk-teal hover:bg-sk-teal-hover text-white gap-2">
                    {isActing ? <Loader2 className="size-4 animate-spin"/> : <CheckCircle2 className="size-4"/>}
                    Approve
                  </Button>
                  <Button onClick={() => handleRequestAction(req, "reject")} disabled={isActing}
                    variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-2">
                    <XCircle className="size-4"/> Reject
                  </Button>
                  <Button onClick={() => handleRequestAction(req, "clarify")} disabled={isActing}
                    variant="outline" className="gap-2">
                    <MessageSquare className="size-4"/> Clarify
                  </Button>
                </>)
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
