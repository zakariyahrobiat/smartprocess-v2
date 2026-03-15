import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/context/auth-provider"
import { useNavigate } from "react-router-dom"
import {
  subscribeToAllInvoices, subscribeToMyInvoices,
  subscribeToAllRefunds, subscribeToMyRefunds,
  getInvoiceById, getRefundById,
  updateInvoiceStatus, updateRefundStatus,
  AMOUNT_THRESHOLDS,
  type Invoice, type Refund, type RefundStatus,
} from "@/lib/imsService"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Timestamp } from "firebase/firestore"
import {
  Receipt, RefreshCw, ShieldAlert, Plus, Download, Search, X,
  DollarSign, Building2, FileText, User, MapPin, Calendar,
  Hash, CheckCircle2, XCircle, Loader2, AlertCircle,
} from "lucide-react"
import StatusBadge from "@/components/ims/statusBadge"
import { InvoiceStepper } from "@/components/ims/invoiceWorkFlow"
import { RefundStepper } from "@/components/ims/RefundWorkFlow"
import FormatAmount from "@/components/formatAmount"
import FormatDate from "@/components/formatDate"
import { Button } from "@/components/ui/button"

// ── Country flag emoji ────────────────────────────────────────────────────────
const FLAG: Record<string, string> = {
  Nigeria: "🇳🇬", "Sierra Leone": "🇸🇱", Cameroon: "🇨🇲",
  Togo: "🇹🇬", "Benin Republic": "🇧🇯", "South Africa": "🇿🇦",
}

// ── Invoice filter pills ──────────────────────────────────────────────────────
type InvFilter = "all" | "line_manager" | "finance" | "senior_manager" | "approved" | "paid" | "rejected"
type RefFilter = "all" | "receivable" | "approval" | "approved" | "paid" | "rejected"

function invoiceMatchesFilter(inv: Invoice, f: InvFilter) {
  if (f === "all")            return true
  if (f === "line_manager")   return inv.status === "Pending Line Manager Approval"
  if (f === "finance")        return inv.status === "Pending Finance Approval"
  if (f === "senior_manager") return inv.status === "Pending Manager Approval"
  if (f === "approved")       return inv.status === "Approved" || inv.status === "Processing"
  if (f === "paid")           return inv.status === "Paid"
  if (f === "rejected")       return inv.status === "Rejected"
  return true
}

function refundMatchesFilter(r: Refund, f: RefFilter) {
  if (f === "all")        return true
  if (f === "receivable") return r.status === "Pending Receivable Approval"
  if (f === "approval")   return r.status === "Pending Approval"
  if (f === "approved")   return r.status === "Approved" || r.status === "Processing"
  if (f === "paid")       return r.status === "Paid"
  if (f === "rejected")   return r.status === "Rejected"
  return true
}

// ── Compact list row ──────────────────────────────────────────────────────────
function InvoiceRow({ inv, selected, onClick }: {
  inv: Invoice; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 border-l-[3px] transition-all hover:bg-muted/40",
        selected
          ? "border-l-sk-orange bg-sk-orange/5"
          : "border-l-transparent"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-foreground leading-tight truncate">
          {inv.vendor}
        </span>
        <StatusBadge status={inv.status} type="invoice" />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <span className="font-mono">{inv.requestId}</span>
        <span>·</span>
        <span>{FLAG[inv.country] ?? ""} {inv.country}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-sk-orange">
          {FormatAmount(inv.amount, inv.currency)}
        </span>
        <span className="text-xs text-muted-foreground">
          {FormatDate(inv.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </div>
    </button>
  )
}

function RefundRow({ r, selected, onClick }: {
  r: Refund; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 border-l-[3px] transition-all hover:bg-muted/40",
        selected
          ? "border-l-sk-teal bg-sk-teal/5"
          : "border-l-transparent"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-foreground leading-tight truncate">
          {r.customerName}
        </span>
        <StatusBadge status={r.status} type="refund" />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <span className="font-mono">{r.referenceNumber}</span>
        <span>·</span>
        <span>{FLAG[r.country] ?? ""} {r.country}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-sk-teal">
          {FormatAmount(r.amount, r.currency)}
        </span>
        <span className="text-xs text-muted-foreground">
          {FormatDate(r.submissionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </div>
    </button>
  )
}

// ── Invoice detail panel ──────────────────────────────────────────────────────
function InvoiceDetailPanel({ invoice, onClose, userEmail, canApprove, canMarkPaid, onRefresh }: {
  invoice: Invoice
  onClose: () => void
  userEmail: string
  canApprove: boolean
  canMarkPaid: boolean
  onRefresh: () => void
}) {
  const [comment, setComment]   = useState("")
  const [isActing, setIsActing] = useState(false)

  const exceedsThreshold = invoice.amount >= (AMOUNT_THRESHOLDS[invoice.country] ?? Infinity)

  const isMyTurnToApprove = () => {
    if (invoice.status === "Pending Line Manager Approval") {
      const emails = invoice.lineManagerEmail.split(",").map(e => e.trim().toLowerCase())
      return emails[invoice.approvalIndex] === userEmail.toLowerCase()
    }
    return canApprove && (
      invoice.status === "Pending Finance Approval" ||
      invoice.status === "Pending Manager Approval"
    )
  }

  const showApprovalBar =
    (isMyTurnToApprove() && invoice.status !== "Processing") ||
    (canMarkPaid && invoice.status === "Processing")

  const approveLabel = () => {
    if (invoice.status === "Pending Line Manager Approval") return "Approve (Line Manager)"
    if (invoice.status === "Pending Finance Approval")      return "Approve (Finance)"
    if (invoice.status === "Pending Manager Approval")      return "Approve (Senior Mgr)"
    return "Approve"
  }

  const handleApprove = async () => {
    if (!invoice.id) return
    setIsActing(true)
    try {
      const managers   = invoice.lineManagerEmail.split(",").map(e => e.trim())
      let newStatus: Invoice["status"]
      let newIndex     = invoice.approvalIndex
      if (invoice.status === "Pending Line Manager Approval") {
        newIndex++
        newStatus = newIndex < managers.length ? "Pending Line Manager Approval" : "Pending Finance Approval"
      } else if (invoice.status === "Pending Finance Approval") {
        newStatus = exceedsThreshold ? "Pending Manager Approval" : "Approved"
        newIndex  = managers.length + 1
      } else {
        newStatus = "Approved"
      }
      await updateInvoiceStatus(invoice.id, {
        status: newStatus, approvalIndex: newIndex,
        ...(newStatus === "Approved" ? { approvalDate: new Date() } : {}),
      })
      toast.success("Invoice approved", { description: `Status: ${newStatus}` })
      onRefresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approval failed")
    } finally {
      setIsActing(false)
    }
  }

  const handleReject = async () => {
    if (!comment.trim()) { toast.error("Add a rejection reason"); return }
    if (!invoice.id) return
    setIsActing(true)
    try {
      await updateInvoiceStatus(invoice.id, { status: "Rejected", rejectionReason: comment })
      toast.success("Invoice rejected")
      onRefresh()
    } catch { toast.error("Failed") } finally { setIsActing(false) }
  }

  const handleMarkPaid = async () => {
    if (!invoice.id) return
    setIsActing(true)
    try {
      await updateInvoiceStatus(invoice.id, { status: "Paid" })
      toast.success("Marked as paid")
      onRefresh()
    } catch { toast.error("Failed") } finally { setIsActing(false) }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-border shrink-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-foreground">{invoice.vendor}</h2>
            <StatusBadge status={invoice.status} type="invoice" />
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {invoice.requestId} · {invoice.invoiceNumber} · {FLAG[invoice.country]} {invoice.country}
          </p>
        </div>
        <button onClick={onClose} className="shrink-0 rounded-lg p-1.5 hover:bg-muted transition-colors">
          <X className="size-4 text-muted-foreground" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Workflow stepper */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Workflow Progress
          </p>
          <InvoiceStepper invoice={invoice} />
        </div>

        {/* Invoice details grid */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Invoice Details
          </p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            {[
              { icon: DollarSign, label: "Amount",       value: `${FormatAmount(invoice.amount, invoice.currency)} ${invoice.currency}` },
              { icon: Building2,  label: "Department",   value: invoice.department },
              { icon: Hash,       label: "Invoice Number", value: invoice.invoiceNumber },
              { icon: MapPin,     label: "Country",      value: `${FLAG[invoice.country] ?? ""} ${invoice.country}` },
              { icon: User,       label: "Submitted By", value: invoice.submitterName || invoice.submitterEmail },
              { icon: User,       label: "Line Manager", value: invoice.managers?.[0]?.name ?? invoice.lineManagerEmail },
              { icon: Calendar,   label: "Submitted",    value: FormatDate(invoice.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) },
              ...(invoice.costCenter ? [{ icon: FileText, label: "Cost Centre", value: invoice.costCenter }] : []),
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
          {invoice.description && (
            <div className="mt-4 pt-4 border-t border-border">
              <dt className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <FileText className="size-3.5" /> Description
              </dt>
              <dd className="text-sm text-foreground">{invoice.description}</dd>
            </div>
          )}
        </div>

        {/* Approval chain */}
        {invoice.managers?.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Approval Chain
            </p>
            <div className="space-y-2">
              {invoice.managers.map((m, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                  i < invoice.approvalIndex
                    ? "bg-sk-teal/10 border border-sk-teal/20"
                    : i === invoice.approvalIndex && invoice.status.includes("Line Manager")
                      ? "bg-sk-orange/10 border border-sk-orange/20"
                      : "bg-muted/40"
                )}>
                  <div className={cn(
                    "size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    i < invoice.approvalIndex ? "bg-sk-teal text-white" :
                    i === invoice.approvalIndex ? "bg-sk-orange text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {i < invoice.approvalIndex ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-xs">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {invoice.attachmentLinks?.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Attachments</p>
            <div className="space-y-2">
              {invoice.attachmentLinks.map((link, i) => (
                <a key={i} href={link} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-primary hover:bg-muted/80 transition-colors">
                  <FileText className="size-4 shrink-0" /> Attachment {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Rejection reason */}
        {invoice.rejectionReason && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-2">
            <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-destructive">Rejection Reason</p>
              <p className="text-sm text-foreground mt-1">{invoice.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Threshold warning */}
        {exceedsThreshold && invoice.status === "Pending Finance Approval" && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-2">
            <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Amount exceeds threshold. Approval will escalate to Senior Manager.
            </p>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {showApprovalBar && (
        <div className="shrink-0 border-t border-border px-6 py-4 bg-card">
          {invoice.status !== "Processing" ? (
            <div className="flex gap-3 items-start">
              <input
                type="text"
                placeholder="Add a comment (optional for approval, required for rejection)"
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-sk-teal focus:outline-none"
              />
              <Button
                onClick={handleApprove}
                disabled={isActing}
                className="shrink-0 bg-sk-orange hover:bg-sk-orange-hover text-white gap-2"
              >
                {isActing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                {approveLabel()}
              </Button>
              <Button
                onClick={handleReject}
                disabled={isActing}
                variant="outline"
                className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 gap-2"
              >
                <XCircle className="size-4" /> Reject
              </Button>
            </div>
          ) : (
            <Button onClick={handleMarkPaid} disabled={isActing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              {isActing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Mark as Paid
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Refund detail panel ────────────────────────────────────────────────────────
function RefundDetailPanel({ refund, onClose, canApproveReceivable, canApproveFinal, canMarkPaid, onRefresh }: {
  refund: Refund; onClose: () => void
  canApproveReceivable: boolean; canApproveFinal: boolean; canMarkPaid: boolean
  onRefresh: () => void
}) {
  const [comment, setComment]   = useState("")
  const [isActing, setIsActing] = useState(false)

  const showApproveReceivable = refund.status === "Pending Receivable Approval" && canApproveReceivable
  const showApproveFinal      = refund.status === "Pending Approval"            && canApproveFinal
  const showMarkPaid          = refund.status === "Processing"                  && canMarkPaid
  const showPanel             = showApproveReceivable || showApproveFinal || showMarkPaid

  const handleApprove = async () => {
    if (!refund.id) return
    setIsActing(true)
    try {
      const newStatus: RefundStatus = showApproveReceivable ? "Pending Approval" : "Approved"
      await updateRefundStatus(refund.id, {
        status: newStatus,
        ...(showApproveReceivable ? { receivableApprovalDate: Timestamp.now() } : { approvalDate: Timestamp.now() }),
      })
      toast.success(showApproveReceivable ? "Forwarded for final approval" : "Refund approved")
      onRefresh()
    } catch { toast.error("Approval failed") } finally { setIsActing(false) }
  }
  const handleReject = async () => {
    if (!comment.trim()) { toast.error("Add a rejection reason"); return }
    if (!refund.id) return
    setIsActing(true)
    try {
      await updateRefundStatus(refund.id, { status: "Rejected", rejectionReason: comment })
      toast.success("Refund rejected")
      onRefresh()
    } catch { toast.error("Failed") } finally { setIsActing(false) }
  }
  const handleMarkPaid = async () => {
    if (!refund.id) return
    setIsActing(true)
    try {
      await updateRefundStatus(refund.id, { status: "Paid" })
      toast.success("Marked as paid")
      onRefresh()
    } catch { toast.error("Failed") } finally { setIsActing(false) }
  }

  const approveLabel = showApproveReceivable ? "Approve & Forward" : "Final Approve"

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-border shrink-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-foreground">{refund.customerName}</h2>
            <StatusBadge status={refund.status} type="refund" />
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {refund.referenceNumber} · {FLAG[refund.country]} {refund.country}
          </p>
        </div>
        <button onClick={onClose} className="shrink-0 rounded-lg p-1.5 hover:bg-muted transition-colors">
          <X className="size-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Workflow Progress</p>
          <RefundStepper refund={refund} />
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Refund Details</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            {[
              { icon: User,       label: "Customer",    value: refund.customerName },
              { icon: DollarSign, label: "Amount",      value: `${FormatAmount(refund.amount, refund.currency)} ${refund.currency}` },
              { icon: Building2,  label: "Bank",        value: refund.bankName },
              { icon: Hash,       label: "Account No.", value: refund.accountNumber },
              { icon: MapPin,     label: "Country",     value: `${FLAG[refund.country] ?? ""} ${refund.country}` },
              { icon: User,       label: "Submitted By", value: refund.submitterName || refund.submitterEmail },
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
          {refund.reason && (
            <div className="mt-4 pt-4 border-t border-border">
              <dt className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Reason</dt>
              <dd className="text-sm text-foreground">{refund.reason}</dd>
            </div>
          )}
        </div>
        {refund.rejectionReason && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-2">
            <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-destructive">Rejection Reason</p>
              <p className="text-sm text-foreground mt-1">{refund.rejectionReason}</p>
            </div>
          </div>
        )}
      </div>

      {showPanel && (
        <div className="shrink-0 border-t border-border px-6 py-4 bg-card">
          {!showMarkPaid ? (
            <div className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Add a comment (required for rejection)"
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-sk-teal focus:outline-none"
              />
              <Button onClick={handleApprove} disabled={isActing}
                className="shrink-0 bg-sk-teal hover:bg-sk-teal-hover text-white gap-2">
                {isActing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                {approveLabel}
              </Button>
              <Button onClick={handleReject} disabled={isActing}
                variant="outline"
                className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 gap-2">
                <XCircle className="size-4" /> Reject
              </Button>
            </div>
          ) : (
            <Button onClick={handleMarkPaid} disabled={isActing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              {isActing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Mark as Paid
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyDetail({ type }: { type: "invoice" | "refund" }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 p-8">
      {type === "invoice"
        ? <Receipt className="size-10 text-muted-foreground/30" />
        : <RefreshCw className="size-10 text-muted-foreground/30" />}
      <p className="text-sm text-muted-foreground">
        Select a {type === "invoice" ? "invoice" : "refund"} from the list to view details
      </p>
    </div>
  )
}

// ── Main IMSPage ──────────────────────────────────────────────────────────────
export default function IMSPage() {
  const { currentUser, can } = useAuth()
  const navigate = useNavigate()

  const canViewInvoices = can("ims_view_own_invoices") || can("ims_view_all_invoices")
  const canViewRefunds  = can("ims_submit_refund")     || can("ims_view_all_refunds")
  const canViewAll      = can("ims_view_all_invoices")
  const canApproveInv   = can("ims_approve_invoice_finance") || can("ims_approve_invoice_senior") || can("ims_approve_invoice_line_manager")
  const canMarkInvPaid  = can("ims_mark_invoice_paid")
  const canApproveRec   = can("ims_approve_refund_receivable")
  const canApproveFin   = can("ims_approve_refund_final")
  const canMarkRefPaid  = can("ims_mark_refund_paid")

  const [activeTab,    setActiveTab]    = useState<"invoices" | "refunds">("invoices")
  const [invoices,     setInvoices]     = useState<Invoice[]>([])
  const [refunds,      setRefunds]      = useState<Refund[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState("")
  const [invFilter,    setInvFilter]    = useState<InvFilter>("all")
  const [refFilter,    setRefFilter]    = useState<RefFilter>("all")
  const [selectedInv,  setSelectedInv]  = useState<Invoice | null>(null)
  const [selectedRef,  setSelectedRef]  = useState<Refund | null>(null)
  const [detailKey,    setDetailKey]    = useState(0)   // force re-mount after action

  // Subscribe to live data
  useEffect(() => {
    if (!currentUser || !canViewInvoices) { setLoading(false); return }
    let done = 0
    const check = () => { if (++done === 2) setLoading(false) }
    const u1 = canViewAll
      ? subscribeToAllInvoices(d => { setInvoices(d); check() })
      : subscribeToMyInvoices(currentUser.email, d => { setInvoices(d); check() })
    const u2 = canViewAll
      ? subscribeToAllRefunds(d => { setRefunds(d); check() })
      : subscribeToMyRefunds(currentUser.email, d => { setRefunds(d); check() })
    return () => { u1(); u2() }
  }, [currentUser, canViewAll, canViewInvoices])

  // Keep selected item in sync with live data
  useEffect(() => {
    if (selectedInv) {
      const fresh = invoices.find(i => i.id === selectedInv.id)
      if (fresh) setSelectedInv(fresh)
    }
  }, [invoices])
  useEffect(() => {
    if (selectedRef) {
      const fresh = refunds.find(r => r.id === selectedRef.id)
      if (fresh) setSelectedRef(fresh)
    }
  }, [refunds])

  const refreshDetail = useCallback(() => setDetailKey(k => k + 1), [])

  // Access denied
  if (!canViewInvoices && !canViewRefunds) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center gap-4">
        <ShieldAlert className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground">You don't have permission to access IMS.</p>
      </div>
    )
  }

  // ── Filtered lists ────────────────────────────────────────────────────────
  const filteredInvoices = invoices.filter(inv => {
    const matchFilter = invoiceMatchesFilter(inv, invFilter)
    const matchSearch = search.length < 2 ? true :
      inv.vendor.toLowerCase().includes(search.toLowerCase()) ||
      inv.requestId.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const filteredRefunds = refunds.filter(r => {
    const matchFilter = refundMatchesFilter(r, refFilter)
    const matchSearch = search.length < 2 ? true :
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.referenceNumber.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  // ── Smart filter pills ────────────────────────────────────────────────────
  const invPills: { id: InvFilter; label: string; count: number }[] = [
    { id: "all",            label: "All",            count: invoices.length },
    { id: "line_manager",   label: "Line Manager",   count: invoices.filter(i => i.status === "Pending Line Manager Approval").length },
    { id: "finance",        label: "Finance",        count: invoices.filter(i => i.status === "Pending Finance Approval").length },
    { id: "senior_manager", label: "Senior Manager", count: invoices.filter(i => i.status === "Pending Manager Approval").length },
    { id: "approved",       label: "Approved",       count: invoices.filter(i => i.status === "Approved" || i.status === "Processing").length },
    { id: "paid",           label: "Paid",           count: invoices.filter(i => i.status === "Paid").length },
    { id: "rejected",       label: "Rejected",       count: invoices.filter(i => i.status === "Rejected").length },
  ].filter((p): p is { id: InvFilter; label: string; count: number } => p.id === "all" || p.count > 0)

  const refPills: { id: RefFilter; label: string; count: number }[] = [
    { id: "all",        label: "All",        count: refunds.length },
    { id: "receivable", label: "Receivable", count: refunds.filter(r => r.status === "Pending Receivable Approval").length },
    { id: "approval",   label: "Approval",   count: refunds.filter(r => r.status === "Pending Approval").length },
    { id: "approved",   label: "Approved",   count: refunds.filter(r => r.status === "Approved" || r.status === "Processing").length },
    { id: "paid",       label: "Paid",       count: refunds.filter(r => r.status === "Paid").length },
    { id: "rejected",   label: "Rejected",   count: refunds.filter(r => r.status === "Rejected").length },
  ].filter((p): p is { id: RefFilter; label: string; count: number } => p.id === "all" || p.count > 0)

  const showDetail = activeTab === "invoices" ? !!selectedInv : !!selectedRef

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <div className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-200 shrink-0",
        showDetail ? "w-[360px]" : "w-full max-w-2xl"
      )}>
        {/* Panel header */}
        <div className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-base font-bold text-foreground">
                {activeTab === "invoices" ? "All Invoices" : "Refund Requests"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {activeTab === "invoices" ? filteredInvoices.length : filteredRefunds.length} records
              </p>
            </div>
            <div className="flex items-center gap-2">
              {can("ims_submit_invoice") && activeTab === "invoices" && (
                <button
                  onClick={() => navigate("/ims/invoices/new")}
                  className="flex items-center gap-1.5 bg-sk-orange hover:bg-sk-orange-hover text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus className="size-3.5" /> New
                </button>
              )}
              {can("ims_submit_refund") && activeTab === "refunds" && (
                <button
                  onClick={() => navigate("/ims/refunds/new")}
                  className="flex items-center gap-1.5 bg-sk-teal hover:bg-sk-teal-hover text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus className="size-3.5" /> New
                </button>
              )}
              <button className="flex items-center justify-center size-8 rounded-lg border border-border hover:bg-muted transition-colors">
                <Download className="size-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Tab switcher */}
          {canViewInvoices && canViewRefunds && (
            <div className="flex gap-1 mb-3">
              {([["invoices", <Receipt className="size-3.5" />, "Invoices"],
                 ["refunds",  <RefreshCw className="size-3.5" />, "Refunds"]] as const).map(([tab, icon, label]) => (
                <button key={tab}
                  onClick={() => { setActiveTab(tab as "invoices"|"refunds"); setSelectedInv(null); setSelectedRef(null) }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    activeTab === tab
                      ? "bg-sk-teal/10 text-sk-teal"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {icon}{label}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              placeholder={activeTab === "invoices" ? "Search vendor, request ID..." : "Search customer, ref..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-9 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:border-sk-teal focus:outline-none"
            />
          </div>

          {/* Filter dropdown */}
          {activeTab === "invoices" ? (
            <select
              value={invFilter}
              onChange={e => setInvFilter(e.target.value as InvFilter)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-sk-orange focus:outline-none"
            >
              {invPills.map(p => (
                <option key={p.id} value={p.id}>{p.label} ({p.count})</option>
              ))}
            </select>
          ) : (
            <select
              value={refFilter}
              onChange={e => setRefFilter(e.target.value as RefFilter)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-sk-teal focus:outline-none"
            >
              {refPills.map(p => (
                <option key={p.id} value={p.id}>{p.label} ({p.count})</option>
              ))}
            </select>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-4 space-y-2 animate-pulse">
                <div className="h-3.5 w-32 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            ))
          ) : activeTab === "invoices" ? (
            filteredInvoices.length === 0
              ? <div className="p-8 text-center text-sm text-muted-foreground">No invoices match your filter</div>
              : filteredInvoices.map(inv => (
                <InvoiceRow key={inv.id} inv={inv}
                  selected={selectedInv?.id === inv.id}
                  onClick={() => { setSelectedInv(inv); setSelectedRef(null) }}
                />
              ))
          ) : (
            filteredRefunds.length === 0
              ? <div className="p-8 text-center text-sm text-muted-foreground">No refunds match your filter</div>
              : filteredRefunds.map(r => (
                <RefundRow key={r.id} r={r}
                  selected={selectedRef?.id === r.id}
                  onClick={() => { setSelectedRef(r); setSelectedInv(null) }}
                />
              ))
          )}
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────── */}
      {showDetail && (
        <div className="flex-1 overflow-hidden">
          {selectedInv && (
            <InvoiceDetailPanel
              key={`inv-${selectedInv.id}-${detailKey}`}
              invoice={selectedInv}
              onClose={() => setSelectedInv(null)}
              userEmail={currentUser?.email ?? ""}
              canApprove={canApproveInv}
              canMarkPaid={canMarkInvPaid}
              onRefresh={refreshDetail}
            />
          )}
          {selectedRef && (
            <RefundDetailPanel
              key={`ref-${selectedRef.id}-${detailKey}`}
              refund={selectedRef}
              onClose={() => setSelectedRef(null)}
              canApproveReceivable={canApproveRec}
              canApproveFinal={canApproveFin}
              canMarkPaid={canMarkRefPaid}
              onRefresh={refreshDetail}
            />
          )}
        </div>
      )}
    </div>
  )
}
