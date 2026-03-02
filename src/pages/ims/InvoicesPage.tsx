import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-provider"
import { toast } from "sonner"
import { Plus, ArrowLeft, Search, Filter, Download, Eye, CheckCircle2, XCircle, Clock, DollarSign, FileText, Building2, User, ChevronRight, Loader2, Upload, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  subscribeToMyInvoices, subscribeToAllInvoices,
  submitInvoice, updateInvoiceStatus,
  getVendors, getCostCenters,
  DEPARTMENTS, IMS_COUNTRIES, CURRENCY_BY_COUNTRY, AMOUNT_THRESHOLDS,
  type Invoice, type InvoiceFormData, type Vendor, type CostCenter,
  type IMSCountry, type Manager,
} from "@/lib/imsService"

// ─── Helpers ──────────────────────────────────────────────────────────

function toDate(val: unknown): Date {
  if (!val) return new Date()
  if (val instanceof Date) return val
  if (typeof val === "object" && val !== null && "toDate" in val)
    return (val as { toDate: () => Date }).toDate()
  return new Date(val as string)
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

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

// ─── Workflow Stepper ─────────────────────────────────────────────────

const WORKFLOW_STEPS = [
  "Submitted", "Line Manager", "Finance", "Senior Mgr", "Approved",
]

function WorkflowStepper({ invoice }: { invoice: Invoice }) {
  const statusToStep: Record<string, number> = {
    "Pending Line Manager Approval": 1,
    "Pending Finance Approval": 2,
    "Pending Manager Approval": 3,
    "Approved": 4, "Processing": 4, "Paid": 4,
    "Rejected": -1,
  }
  const isProcurement = invoice.department === "Operation & Procurement"
  const steps = isProcurement
    ? ["Submitted", "Finance", "Senior Mgr", "Approved"]
    : WORKFLOW_STEPS
  const currentStep = statusToStep[invoice.status] ?? 0

  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => {
        const isComplete = i < currentStep
        const isCurrent = i === currentStep
        const isRejected = invoice.status === "Rejected"
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                isRejected && isCurrent ? "bg-red-500/20 border-red-500 text-red-400" :
                isComplete ? "bg-green-500 border-green-500 text-white" :
                isCurrent ? "bg-blue-500/20 border-blue-500 text-blue-400" :
                "bg-muted border-border text-muted-foreground"
              )}>
                {isComplete ? "✓" : i + 1}
              </div>
              <span className={cn("text-[10px] text-center leading-tight w-16",
                isCurrent ? "text-blue-400 font-medium" :
                isComplete ? "text-green-400" : "text-muted-foreground"
              )}>{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-0.5 mb-4 mx-1", isComplete ? "bg-green-500" : "bg-border")} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Invoice List Item ────────────────────────────────────────────────

function InvoiceRow({ invoice, onClick }: { invoice: Invoice; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-accent/50"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-900/30 border border-green-800">
        <FileText className="size-4 text-green-400" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{invoice.vendor}</span>
          <span className="text-xs text-muted-foreground font-mono">{invoice.requestId}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <span>{invoice.department}</span>
          <span>·</span>
          <span>{formatAmount(invoice.amount, invoice.currency)}</span>
          <span>·</span>
          <span>{invoice.country}</span>
          <span>·</span>
          <span>{toDate(invoice.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <StatusBadge status={invoice.status} />
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}

// ─── Invoice Detail / Approval Panel ─────────────────────────────────

function InvoiceDetail({
  invoice, onBack, canApprove, canMarkPaid, userEmail,
}: {
  invoice: Invoice
  onBack: () => void
  canApprove: boolean
  canMarkPaid: boolean
  userEmail: string
}) {
  const [comment, setComment] = useState("")
  const [isActing, setIsActing] = useState(false)
  const exceedsThreshold = invoice.amount >= (AMOUNT_THRESHOLDS[invoice.country] ?? Infinity)

  const isMyTurnToApprove = () => {
    if (invoice.status === "Pending Line Manager Approval") {
      const emails = invoice.lineManagerEmail.split(",").map(e => e.trim().toLowerCase())
      return emails[invoice.approvalIndex] === userEmail.toLowerCase()
    }
    if (invoice.status === "Pending Finance Approval") return canApprove
    if (invoice.status === "Pending Manager Approval") return canApprove
    return false
  }

  const handleApprove = async () => {
    if (!invoice.id) return
    setIsActing(true)
    try {
      const managers = invoice.lineManagerEmail.split(",").map(e => e.trim())
      const totalManagers = managers.length
      let newStatus: Invoice["status"]
      let newIndex = invoice.approvalIndex

      if (invoice.status === "Pending Line Manager Approval") {
        newIndex = invoice.approvalIndex + 1
        if (newIndex < totalManagers) {
          newStatus = "Pending Line Manager Approval"
        } else {
          newStatus = "Pending Finance Approval"
        }
      } else if (invoice.status === "Pending Finance Approval") {
        newStatus = exceedsThreshold ? "Pending Manager Approval" : "Approved"
        newIndex = totalManagers + 1
      } else {
        newStatus = "Approved"
      }

      await updateInvoiceStatus(invoice.id, {
        status: newStatus,
        approvalIndex: newIndex,
        ...(newStatus === "Approved" ? { approvalDate: new Date() } : {}),
      })
      toast.success("Invoice approved", { description: `New status: ${newStatus}` })
      onBack()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approval failed")
    } finally {
      setIsActing(false)
    }
  }

  const handleReject = async () => {
    if (!comment.trim()) { toast.error("Please add a rejection reason"); return }
    if (!invoice.id) return
    setIsActing(true)
    try {
      await updateInvoiceStatus(invoice.id, { status: "Rejected", rejectionReason: comment })
      toast.success("Invoice rejected")
      onBack()
    } catch {
      toast.error("Failed to reject invoice")
    } finally {
      setIsActing(false)
    }
  }

  const handleMarkPaid = async () => {
    if (!invoice.id) return
    setIsActing(true)
    try {
      await updateInvoiceStatus(invoice.id, { status: "Paid" })
      toast.success("Invoice marked as paid")
      onBack()
    } catch {
      toast.error("Failed to update")
    } finally {
      setIsActing(false)
    }
  }

  const showApprovalPanel = (isMyTurnToApprove() && (
    invoice.status === "Pending Line Manager Approval" ||
    invoice.status === "Pending Finance Approval" ||
    invoice.status === "Pending Manager Approval"
  )) || (canMarkPaid && invoice.status === "Processing")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">{invoice.vendor}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-muted-foreground">{invoice.requestId} · {invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Workflow */}
      <div className="rounded-xl border border-border bg-card p-5">
        <WorkflowStepper invoice={invoice} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Details (60%) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Invoice Details</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: User, label: "Submitted By", value: invoice.submitterName || invoice.submitterEmail },
                { icon: Building2, label: "Department", value: invoice.department },
                { icon: FileText, label: "Cost Center", value: invoice.costCenter },
                { icon: DollarSign, label: "Amount", value: formatAmount(invoice.amount, invoice.currency) },
                { icon: FileText, label: "PO Number", value: invoice.poNumber || "N/A" },
                { icon: Building2, label: "Country", value: invoice.country },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                  <div>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium text-foreground">{value}</dd>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-2 sm:col-span-2">
                <FileText className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                <div>
                  <dt className="text-xs text-muted-foreground">Description</dt>
                  <dd className="text-sm text-foreground leading-relaxed">{invoice.description}</dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Approval chain */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Approval Chain</h2>
            <div className="space-y-2">
              {invoice.managers.map((m, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-3 rounded-lg p-2.5 text-sm",
                  i < invoice.approvalIndex ? "bg-green-900/20 border border-green-800" :
                  i === invoice.approvalIndex && invoice.status.includes("Line Manager") ? "bg-blue-900/20 border border-blue-800" :
                  "bg-muted/40"
                )}>
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    i < invoice.approvalIndex ? "bg-green-500 text-white" :
                    i === invoice.approvalIndex ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {i < invoice.approvalIndex ? "✓" : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {invoice.attachmentLinks.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Attachments</h2>
              <div className="space-y-2">
                {invoice.attachmentLinks.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-primary hover:bg-muted/80 transition-colors">
                    <FileText className="size-4 shrink-0" />
                    Attachment {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {invoice.rejectionReason && (
            <div className="rounded-xl border border-red-800 bg-red-900/20 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-400">Rejection Reason</p>
                  <p className="text-sm text-foreground mt-1">{invoice.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action panel (40%) */}
        {showApprovalPanel && (
          <div className="lg:col-span-2">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Action Required</h2>
              {exceedsThreshold && invoice.status === "Pending Finance Approval" && (
                <div className="flex items-start gap-2 rounded-lg bg-yellow-900/20 border border-yellow-800 p-3 text-xs text-yellow-400">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>Amount exceeds threshold ({AMOUNT_THRESHOLDS[invoice.country].toLocaleString()} {invoice.currency}). Approval will be escalated to Senior Manager.</span>
                </div>
              )}
              {(invoice.status !== "Processing") && (
                <div>
                  <label className="text-sm font-medium text-foreground">Comment</label>
                  <textarea
                    className="mt-1.5 w-full min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="Add comments (required for rejection)..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {invoice.status !== "Processing" && (
                  <>
                    <Button onClick={handleApprove} disabled={isActing} className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
                      {isActing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                      Approve
                    </Button>
                    <Button onClick={handleReject} disabled={isActing} variant="outline" className="w-full gap-2 border-red-800 text-red-400 hover:bg-red-900/20">
                      <XCircle className="size-4" />
                      Reject
                    </Button>
                  </>
                )}
                {canMarkPaid && invoice.status === "Processing" && (
                  <Button onClick={handleMarkPaid} disabled={isActing} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    {isActing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Invoice Form ─────────────────────────────────────────────────────

function InvoiceForm({ onSubmitted, onCancel }: { onSubmitted: () => void; onCancel: () => void }) {
  const { currentUser } = useAuth()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [vendorSearch, setVendorSearch] = useState("")
  const [ccSearch, setCcSearch] = useState("")
  const [showVendorSuggestions, setShowVendorSuggestions] = useState(false)
  const [showCcSuggestions, setShowCcSuggestions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [managers, setManagers] = useState<Manager[]>([{ name: "", email: "" }])

  const [form, setForm] = useState<Partial<InvoiceFormData>>({
    invoiceNo: "", vendor: "", costCenter: "", department: "", amount: 0,
    currency: "NGN", poNumber: "", description: "", location: "Nigeria",
    ccEmails: "", fileUrls: [],
  })

  useEffect(() => {
    getVendors().then(setVendors).catch(() => {})
    getCostCenters().then(setCostCenters).catch(() => {})
  }, [])

  // Auto-set currency when country changes
  useEffect(() => {
    if (form.location) {
      setForm(f => ({ ...f, currency: CURRENCY_BY_COUNTRY[form.location as IMSCountry] }))
    }
  }, [form.location])

  const isOpProc = form.department === "Operation & Procurement"

  const filteredVendors = vendorSearch.length > 1
    ? vendors.filter(v =>
        v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.code.toLowerCase().includes(vendorSearch.toLowerCase())
      ).slice(0, 8)
    : []

  const filteredCc = ccSearch.length > 1
    ? costCenters.filter(c =>
        c.name.toLowerCase().includes(ccSearch.toLowerCase()) ||
        c.code.toLowerCase().includes(ccSearch.toLowerCase())
      ).slice(0, 8)
    : []

  const addManager = () => setManagers(m => [...m, { name: "", email: "" }])
  const removeManager = (i: number) => setManagers(m => m.filter((_, idx) => idx !== i))
  const updateManager = (i: number, field: keyof Manager, val: string) =>
    setManagers(m => m.map((mgr, idx) => idx === i ? { ...mgr, [field]: val } : mgr))

  const handleSubmit = async () => {
    if (!form.invoiceNo || !form.vendor || !form.costCenter || !form.department ||
      !form.amount || !form.location || !form.currency || !form.description) {
      toast.error("Please fill in all required fields")
      return
    }
    if (!isOpProc && managers.some(m => !m.name || !m.email)) {
      toast.error("Please complete all manager fields")
      return
    }
    if (!currentUser) return

    setIsSubmitting(true)
    try {
      await submitInvoice(
        { ...form, managers: isOpProc ? [] : managers } as InvoiceFormData,
        currentUser.email,
        currentUser.displayName
      )
      toast.success("Invoice submitted successfully!")
      onSubmitted()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
  const labelClass = "block text-sm font-medium text-foreground mb-1"
  const required = <span className="text-destructive ml-0.5">*</span>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-foreground">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Submit Invoice</h1>
          <p className="text-sm text-muted-foreground">Fill in the details below to submit for approval</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">Invoice Information</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Invoice Number */}
          <div>
            <label className={labelClass}>Invoice Number{required}</label>
            <input className={inputClass} placeholder="e.g. INV-2024-001"
              value={form.invoiceNo} onChange={e => setForm(f => ({ ...f, invoiceNo: e.target.value }))} />
          </div>

          {/* Vendor autocomplete */}
          <div className="relative">
            <label className={labelClass}>Vendor{required}</label>
            <input className={inputClass} placeholder="Search vendor..."
              value={vendorSearch}
              onChange={e => { setVendorSearch(e.target.value); setShowVendorSuggestions(true); setForm(f => ({ ...f, vendor: e.target.value })) }}
              onFocus={() => setShowVendorSuggestions(true)}
              onBlur={() => setTimeout(() => setShowVendorSuggestions(false), 200)}
            />
            {showVendorSuggestions && filteredVendors.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                {filteredVendors.map(v => (
                  <li key={v.id} className="px-3 py-2.5 cursor-pointer hover:bg-accent text-sm"
                    onMouseDown={() => { setVendorSearch(v.name); setForm(f => ({ ...f, vendor: v.name })); setShowVendorSuggestions(false) }}>
                    <p className="font-medium text-foreground">{v.name}</p>
                    <p className="text-xs text-muted-foreground">Code: {v.code}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cost Center autocomplete */}
          <div className="relative">
            <label className={labelClass}>Cost Center{required}</label>
            <input className={inputClass} placeholder="Search cost center..."
              value={ccSearch}
              onChange={e => { setCcSearch(e.target.value); setShowCcSuggestions(true); setForm(f => ({ ...f, costCenter: e.target.value })) }}
              onFocus={() => setShowCcSuggestions(true)}
              onBlur={() => setTimeout(() => setShowCcSuggestions(false), 200)}
            />
            {showCcSuggestions && filteredCc.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                {filteredCc.map(c => (
                  <li key={c.id} className="px-3 py-2.5 cursor-pointer hover:bg-accent text-sm"
                    onMouseDown={() => { setCcSearch(c.name); setForm(f => ({ ...f, costCenter: `${c.code}: ${c.name}` })); setShowCcSuggestions(false) }}>
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">Code: {c.code}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Department */}
          <div>
            <label className={labelClass}>Department{required}</label>
            <select className={inputClass}
              value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className={labelClass}>Country{required}</label>
            <select className={inputClass}
              value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value as IMSCountry }))}>
              {IMS_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className={labelClass}>Currency{required}</label>
            <input className={cn(inputClass, "bg-muted cursor-not-allowed")} value={form.currency} readOnly />
          </div>

          {/* Amount */}
          <div>
            <label className={labelClass}>Amount{required}</label>
            <input className={inputClass} type="number" placeholder="0"
              value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
            {form.amount && form.location && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatAmount(form.amount, form.currency ?? "NGN")}
                {form.amount >= (AMOUNT_THRESHOLDS[form.location as IMSCountry] ?? Infinity) && (
                  <span className="ml-2 text-yellow-400">⚠ Requires Senior Manager approval</span>
                )}
              </p>
            )}
          </div>

          {/* PO Number */}
          <div>
            <label className={labelClass}>PO Number <span className="text-muted-foreground text-xs">(optional)</span></label>
            <input className={inputClass} placeholder="e.g. PO-2024-001"
              value={form.poNumber} onChange={e => setForm(f => ({ ...f, poNumber: e.target.value }))} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description{required}</label>
          <textarea className={cn(inputClass, "min-h-20")} placeholder="Describe the purpose of this invoice..."
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        {/* CC Emails */}
        <div>
          <label className={labelClass}>CC Emails <span className="text-muted-foreground text-xs">(comma-separated, optional)</span></label>
          <input className={inputClass} placeholder="e.g. manager@sunking.com, finance@sunking.com"
            value={form.ccEmails} onChange={e => setForm(f => ({ ...f, ccEmails: e.target.value }))} />
        </div>
      </div>

      {/* Managers — hidden for Operation & Procurement */}
      {!isOpProc && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-sm font-semibold text-foreground">Approval Managers{required}</h2>
            <Button variant="outline" size="sm" onClick={addManager} className="gap-1.5 text-xs">
              <Plus className="size-3" /> Add Manager
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Managers are notified sequentially — manager 1 first, then 2, etc.</p>
          {managers.map((mgr, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-2 items-end">
              <div>
                <label className={labelClass}>Manager {i + 1} Name{required}</label>
                <input className={inputClass} placeholder="Full name"
                  value={mgr.name} onChange={e => updateManager(i, "name", e.target.value)} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className={labelClass}>Email{required}</label>
                  <input className={inputClass} placeholder="email@sunking.com" type="email"
                    value={mgr.email} onChange={e => updateManager(i, "email", e.target.value)} />
                </div>
                {managers.length > 1 && (
                  <Button variant="ghost" size="icon" className="mb-0 mt-5 text-destructive hover:text-destructive"
                    onClick={() => removeManager(i)}>
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpProc && (
        <div className="rounded-xl border border-blue-800 bg-blue-900/20 p-4 flex items-start gap-3">
          <AlertCircle className="size-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-300">
            <span className="font-medium">Operation & Procurement</span> — this request goes directly to Finance, skipping Line Manager approval.
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 bg-green-600 hover:bg-green-700 text-white min-w-36">
          {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Submitting...</> : <><Upload className="size-4" /> Submit Invoice</>}
        </Button>
      </div>
    </div>
  )
}

// ─── Analytics Cards ──────────────────────────────────────────────────

function AnalyticsCards({ invoices }: { invoices: Invoice[] }) {
  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status.startsWith("Pending")).length,
    approved: invoices.filter(i => i.status === "Approved" || i.status === "Processing").length,
    paid: invoices.filter(i => i.status === "Paid").length,
    rejected: invoices.filter(i => i.status === "Rejected").length,
    totalAmount: invoices.reduce((s, i) => s + i.amount, 0),
  }
  const cards = [
    { label: "Total Invoices", value: stats.total, sub: "", color: "text-foreground" },
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

// ─── Main InvoicesPage ────────────────────────────────────────────────

type View = "list" | "detail" | "submit"
type FilterTab = "all" | "pending" | "approved" | "paid" | "rejected"

export default function InvoicesPage() {
  const { currentUser, can } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<View>("list")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [filterTab, setFilterTab] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")

  const canViewAll = can("ims_view_all_invoices")
  const canApprove = can("ims_approve_invoice_finance") || can("ims_approve_invoice_senior") || can("ims_approve_invoice_line_manager")
  const canMarkPaid = can("ims_mark_invoice_paid")

  useEffect(() => {
    if (!currentUser) return
    const unsub = canViewAll
      ? subscribeToAllInvoices(data => { setInvoices(data); setIsLoading(false) })
      : subscribeToMyInvoices(currentUser.email, data => { setInvoices(data); setIsLoading(false) })
    return () => unsub()
  }, [currentUser, canViewAll])

  const filtered = invoices.filter(inv => {
    const matchTab =
      filterTab === "all" ? true :
      filterTab === "pending" ? inv.status.startsWith("Pending") :
      filterTab === "approved" ? (inv.status === "Approved" || inv.status === "Processing") :
      filterTab === "paid" ? inv.status === "Paid" :
      inv.status === "Rejected"
    const matchSearch = search.length < 2 ? true :
      inv.requestId.toLowerCase().includes(search.toLowerCase()) ||
      inv.vendor.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  if (view === "submit") {
    return <InvoiceForm onSubmitted={() => setView("list")} onCancel={() => setView("list")} />
  }

  if (view === "detail" && selectedInvoice) {
    return (
      <InvoiceDetail
        invoice={selectedInvoice}
        onBack={() => { setView("list"); setSelectedInvoice(null) }}
        canApprove={canApprove}
        canMarkPaid={canMarkPaid}
        userEmail={currentUser?.email ?? ""}
      />
    )
  }

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "paid", label: "Paid" },
    { id: "rejected", label: "Rejected" },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Invoices</h2>
          <p className="text-sm text-muted-foreground">{canViewAll ? "All invoices across countries" : "Your submitted invoices"}</p>
        </div>
        {can("ims_submit_invoice") && (
          <Button onClick={() => setView("submit")} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Plus className="size-4" /> Submit Invoice
          </Button>
        )}
      </div>

      {/* Analytics */}
      <AnalyticsCards invoices={invoices} />

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 h-9 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="Search by ID, vendor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 border border-border rounded-lg p-1 bg-card">
          {filterTabs.map(tab => (
            <button key={tab.id} onClick={() => setFilterTab(tab.id)}
              className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors",
                filterTab === tab.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <FileText className="size-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">No invoices found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {can("ims_submit_invoice") ? "Submit your first invoice to get started." : "No invoices match your filters."}
            </p>
          </div>
        ) : (
          filtered.map(inv => (
            <InvoiceRow key={inv.id} invoice={inv} onClick={() => { setSelectedInvoice(inv); setView("detail") }} />
          ))
        )}
      </div>
    </div>
  )
}
