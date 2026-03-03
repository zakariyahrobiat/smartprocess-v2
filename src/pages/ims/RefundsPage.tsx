import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-provider"
import { toast } from "sonner"
import {
  collection, addDoc, getDocs, doc, updateDoc, query,
  where, orderBy, onSnapshot, serverTimestamp, type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Plus, ArrowLeft, Search, FileText, ChevronRight,
  CheckCircle2, XCircle, Loader2, AlertCircle, User, Building2, DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { IMS_COUNTRIES, CURRENCY_BY_COUNTRY, type IMSCountry } from "@/lib/imsService"

// ─── Types ────────────────────────────────────────────────────────────

export type RefundStatus =
  | "Pending Receivable Approval"
  | "Pending Approval"
  | "Approved"
  | "Processing"
  | "Paid"
  | "Rejected"

export interface Refund {
  id?: string
  referenceNumber: string
  submitterEmail: string
  submitterName: string
  submissionDate: unknown
  country: IMSCountry
  customerName: string
  accountNumber: string
  bankName: string
  currency: string
  amount: number
  ccEmails: string
  status: RefundStatus
  reason: string
  rejectionReason?: string
  approvalDate?: unknown
  receivableApprovalDate?: unknown
}

export interface RefundFormData {
  referenceNumber: string
  country: IMSCountry
  customerName: string
  accountNumber: string
  bankName: string
  currency: string
  amount: number
  ccEmails: string
  reason: string
}

const NIGERIAN_BANKS = [
  "Access Bank", "Citibank Nigeria", "Ecobank Nigeria", "Fidelity Bank",
  "First Bank of Nigeria", "First City Monument Bank (FCMB)", "Globus Bank",
  "Guaranty Trust Bank (GTBank)", "Heritage Bank", "Keystone Bank", "Lotus Bank",
  "Optimus Bank", "Parallex Bank", "Polaris Bank", "Premium Trust Bank",
  "Providus Bank", "Signature Bank", "Stanbic IBTC Bank", "Standard Chartered Bank",
  "Sterling Bank", "SunTrust Bank", "Titan Trust Bank", "Union Bank of Nigeria",
  "United Bank for Africa (UBA)", "Unity Bank", "Wema Bank", "Zenith Bank",
]

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
  "Pending Receivable Approval": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Pending Approval": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Approved": "bg-green-500/10 text-green-400 border-green-500/20",
  "Processing": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Paid": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Rejected": "bg-red-500/10 text-red-400 border-red-500/20",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
      STATUS_COLORS[status] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"
    )}>
      {status}
    </span>
  )
}

// ─── Workflow Stepper ─────────────────────────────────────────────────

const REFUND_STEPS = ["Submitted", "Receivable", "Approval", "Paid"]

function RefundStepper({ refund }: { refund: Refund }) {
  const stepMap: Record<string, number> = {
    "Pending Receivable Approval": 0,
    "Pending Approval": 1,
    "Approved": 2, "Processing": 2,
    "Paid": 3,
    "Rejected": -1,
  }
  const current = stepMap[refund.status] ?? 0

  return (
    <div className="flex items-center gap-0 w-full">
      {REFUND_STEPS.map((step, i) => {
        const isComplete = i < current
        const isCurrent = i === current
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2",
                refund.status === "Rejected" && isCurrent ? "bg-red-500/20 border-red-500 text-red-400" :
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
            {i < REFUND_STEPS.length - 1 && (
              <div className={cn("flex-1 h-0.5 mb-4 mx-1", isComplete ? "bg-green-500" : "bg-border")} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Firestore Service ────────────────────────────────────────────────

async function submitRefundToFirestore(
  data: RefundFormData,
  submitterEmail: string,
  submitterName: string
): Promise<string> {
  // Duplicate reference check
  const q = query(
    collection(db, "refunds"),
    where("referenceNumber", "==", data.referenceNumber),
    where("country", "==", data.country)
  )
  const existing = await getDocs(q)
  if (!existing.empty) throw new Error("This Reference Number already exists for this country")

  const refund: Omit<Refund, "id"> = {
    referenceNumber: data.referenceNumber,
    submitterEmail,
    submitterName,
    submissionDate: serverTimestamp(),
    country: data.country,
    customerName: data.customerName,
    accountNumber: data.accountNumber,
    bankName: data.bankName,
    currency: data.currency,
    amount: data.amount,
    ccEmails: data.ccEmails,
    status: "Pending Receivable Approval",
    reason: data.reason,
  }
  const ref = await addDoc(collection(db, "refunds"), refund)
  return ref.id
}

function subscribeToMyRefunds(email: string, cb: (r: Refund[]) => void): Unsubscribe {
  const q = query(collection(db, "refunds"), where("submitterEmail", "==", email), orderBy("submissionDate", "desc"))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Refund))))
}

function subscribeToAllRefunds(cb: (r: Refund[]) => void): Unsubscribe {
  const q = query(collection(db, "refunds"), orderBy("submissionDate", "desc"))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Refund))))
}

async function updateRefundStatus(id: string, updates: Partial<Refund>): Promise<void> {
  await updateDoc(doc(db, "refunds", id), { ...updates })
}

// ─── Refund Form ──────────────────────────────────────────────────────

function RefundForm({ onSubmitted, onCancel }: { onSubmitted: () => void; onCancel: () => void }) {
  const { currentUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accountError, setAccountError] = useState("")
  const [form, setForm] = useState<RefundFormData>({
    referenceNumber: "", country: "Nigeria", customerName: "",
    accountNumber: "", bankName: "", currency: "NGN",
    amount: 0, ccEmails: "", reason: "",
  })

  // Auto-set currency on country change
  useEffect(() => {
    setForm(f => ({ ...f, currency: CURRENCY_BY_COUNTRY[f.country] }))
  }, [form.country])

  const validateAccount = (val: string) => {
    if (val && !/^\d{10}$/.test(val)) {
      setAccountError("Account number must be exactly 10 digits")
    } else {
      setAccountError("")
    }
  }

  const handleSubmit = async () => {
    if (!form.referenceNumber || !form.customerName || !form.accountNumber ||
      !form.bankName || !form.amount || !form.reason) {
      toast.error("Please fill in all required fields")
      return
    }
    if (!/^\d{10}$/.test(form.accountNumber)) {
      toast.error("Account number must be exactly 10 digits")
      return
    }
    if (!currentUser) return

    setIsSubmitting(true)
    try {
      await submitRefundToFirestore(form, currentUser.email, currentUser.displayName)
      toast.success("Refund request submitted successfully!")
      onSubmitted()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
  const labelClass = "block text-sm font-medium text-foreground mb-1"
  const req = <span className="text-destructive ml-0.5">*</span>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-foreground">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Submit Refund Request</h1>
          <p className="text-sm text-muted-foreground">Customer refund details</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">Refund Information</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Reference Number */}
          <div>
            <label className={labelClass}>Reference Number{req}</label>
            <input className={inputClass} placeholder="e.g. REF-2024-001"
              value={form.referenceNumber}
              onChange={e => setForm(f => ({ ...f, referenceNumber: e.target.value }))} />
          </div>

          {/* Country */}
          <div>
            <label className={labelClass}>Country{req}</label>
            <select className={inputClass}
              value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value as IMSCountry }))}>
              {IMS_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Customer Name */}
          <div>
            <label className={labelClass}>Customer's Name{req}</label>
            <input className={inputClass} placeholder="e.g. Boluwatife Lawal"
              value={form.customerName}
              onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} />
          </div>

          {/* Account Number */}
          <div>
            <label className={labelClass}>Account Number{req}</label>
            <input
              className={cn(inputClass, accountError && "border-red-500 focus:border-red-500")}
              placeholder="0123456789" maxLength={10}
              value={form.accountNumber}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, "")
                setForm(f => ({ ...f, accountNumber: val }))
                validateAccount(val)
              }}
            />
            {accountError && <p className="text-xs text-red-400 mt-1">{accountError}</p>}
            {form.accountNumber && !accountError && form.accountNumber.length === 10 && (
              <p className="text-xs text-green-400 mt-1">✓ Valid account number</p>
            )}
          </div>

          {/* Bank Name */}
          <div>
            <label className={labelClass}>Bank Name{req}</label>
            <select className={inputClass}
              value={form.bankName}
              onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}>
              <option value="">Select bank</option>
              {NIGERIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Currency (auto-set) */}
          <div>
            <label className={labelClass}>Currency</label>
            <input className={cn(inputClass, "bg-muted cursor-not-allowed")}
              value={form.currency} readOnly />
          </div>

          {/* Amount */}
          <div>
            <label className={labelClass}>Refund Amount{req}</label>
            <input className={inputClass} type="number" placeholder="0"
              value={form.amount || ""}
              onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
            {form.amount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatAmount(form.amount, form.currency)}
              </p>
            )}
          </div>

          {/* CC Emails */}
          <div>
            <label className={labelClass}>CC Emails <span className="text-muted-foreground text-xs">(optional)</span></label>
            <input className={inputClass} placeholder="email1@sunking.com, email2@sunking.com"
              value={form.ccEmails}
              onChange={e => setForm(f => ({ ...f, ccEmails: e.target.value }))} />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className={labelClass}>Reason for Refund{req}</label>
          <textarea className={cn(inputClass, "min-h-24")}
            placeholder="Explain why this refund is being requested..."
            value={form.reason}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}
          className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white min-w-40">
          {isSubmitting
            ? <><Loader2 className="size-4 animate-spin" /> Submitting...</>
            : <><Plus className="size-4" /> Submit Refund</>}
        </Button>
      </div>
    </div>
  )
}

// ─── Refund Detail ────────────────────────────────────────────────────

function RefundDetail({
  refund, onBack, canApproveReceivable, canApproveFinal, canMarkPaid,
}: {
  refund: Refund
  onBack: () => void
  canApproveReceivable: boolean
  canApproveFinal: boolean
  canMarkPaid: boolean
}) {
  const [comment, setComment] = useState("")
  const [isActing, setIsActing] = useState(false)

  const showApproveReceivable = refund.status === "Pending Receivable Approval" && canApproveReceivable
  const showApproveFinal = refund.status === "Pending Approval" && canApproveFinal
  const showMarkPaid = refund.status === "Processing" && canMarkPaid
  const showReject = (showApproveReceivable || showApproveFinal) && refund.status !== "Processing"
  const showPanel = showApproveReceivable || showApproveFinal || showMarkPaid

  const handleApprove = async () => {
    if (!refund.id) return
    setIsActing(true)
    try {
      const newStatus: RefundStatus = showApproveReceivable ? "Pending Approval" : "Approved"
      await updateRefundStatus(refund.id, {
        status: newStatus,
        ...(showApproveReceivable ? { receivableApprovalDate: new Date() } : { approvalDate: new Date() }),
      })
      toast.success(`Refund ${showApproveReceivable ? "forwarded for final approval" : "approved"}`)
      onBack()
    } catch {
      toast.error("Approval failed")
    } finally {
      setIsActing(false)
    }
  }

  const handleReject = async () => {
    if (!comment.trim()) { toast.error("Please add a rejection reason"); return }
    if (!refund.id) return
    setIsActing(true)
    try {
      await updateRefundStatus(refund.id, { status: "Rejected", rejectionReason: comment })
      toast.success("Refund rejected")
      onBack()
    } catch {
      toast.error("Failed")
    } finally {
      setIsActing(false)
    }
  }

  const handleMarkPaid = async () => {
    if (!refund.id) return
    setIsActing(true)
    try {
      await updateRefundStatus(refund.id, { status: "Paid" })
      toast.success("Refund marked as paid")
      onBack()
    } catch {
      toast.error("Failed")
    } finally {
      setIsActing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">{refund.customerName}</h1>
            <StatusBadge status={refund.status} />
          </div>
          <p className="text-sm text-muted-foreground">{refund.referenceNumber} · {toDate(refund.submissionDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <RefundStepper refund={refund} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Refund Details</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: User, label: "Submitted By", value: refund.submitterName || refund.submitterEmail },
                { icon: Building2, label: "Country", value: refund.country },
                { icon: User, label: "Customer Name", value: refund.customerName },
                { icon: FileText, label: "Account Number", value: refund.accountNumber },
                { icon: Building2, label: "Bank", value: refund.bankName },
                { icon: DollarSign, label: "Amount", value: formatAmount(refund.amount, refund.currency) },
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
                  <dt className="text-xs text-muted-foreground">Reason</dt>
                  <dd className="text-sm text-foreground leading-relaxed">{refund.reason}</dd>
                </div>
              </div>
            </dl>
          </div>

          {refund.rejectionReason && (
            <div className="rounded-xl border border-red-800 bg-red-900/20 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-400">Rejection Reason</p>
                  <p className="text-sm text-foreground mt-1">{refund.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {showPanel && (
          <div className="lg:col-span-2">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Action Required</h2>
              {!showMarkPaid && (
                <div>
                  <label className="text-sm font-medium text-foreground">Comment</label>
                  <textarea
                    className="mt-1.5 w-full min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Add comment (required for rejection)..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {(showApproveReceivable || showApproveFinal) && (
                  <Button onClick={handleApprove} disabled={isActing}
                    className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
                    {isActing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                    {showApproveReceivable ? "Approve & Forward" : "Final Approve"}
                  </Button>
                )}
                {showReject && (
                  <Button onClick={handleReject} disabled={isActing}
                    variant="outline" className="w-full gap-2 border-red-800 text-red-400 hover:bg-red-900/20">
                    <XCircle className="size-4" /> Reject
                  </Button>
                )}
                {showMarkPaid && (
                  <Button onClick={handleMarkPaid} disabled={isActing}
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
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

// ─── Analytics Cards ──────────────────────────────────────────────────

function AnalyticsCards({ refunds }: { refunds: Refund[] }) {
  const stats = {
    total: refunds.length,
    pending: refunds.filter(r => r.status.startsWith("Pending")).length,
    approved: refunds.filter(r => r.status === "Approved" || r.status === "Processing").length,
    paid: refunds.filter(r => r.status === "Paid").length,
    rejected: refunds.filter(r => r.status === "Rejected").length,
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {[
        { label: "Total Refunds", value: stats.total, color: "text-foreground" },
        { label: "Pending", value: stats.pending, color: "text-yellow-400" },
        { label: "Approved", value: stats.approved, color: "text-green-400" },
        { label: "Paid", value: stats.paid, color: "text-emerald-400" },
        { label: "Rejected", value: stats.rejected, color: "text-red-400" },
      ].map(c => (
        <div key={c.label} className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{c.label}</p>
          <p className={cn("text-2xl font-bold mt-1", c.color)}>{c.value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Main RefundsPage ─────────────────────────────────────────────────

type View = "list" | "detail" | "submit"
type FilterTab = "all" | "pending" | "approved" | "paid" | "rejected"

export default function RefundsPage() {
  const { currentUser, can } = useAuth()
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<View>("list")
  const [selected, setSelected] = useState<Refund | null>(null)
  const [filterTab, setFilterTab] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")

  const canViewAll = can("ims_view_all_refunds")
  const canApproveReceivable = can("ims_approve_refund_receivable")
  const canApproveFinal = can("ims_approve_refund_final")
  const canMarkPaid = can("ims_mark_refund_paid")

  useEffect(() => {
    if (!currentUser) return
    const unsub = canViewAll
      ? subscribeToAllRefunds(data => { setRefunds(data); setIsLoading(false) })
      : subscribeToMyRefunds(currentUser.email, data => { setRefunds(data); setIsLoading(false) })
    return () => unsub()
  }, [currentUser, canViewAll])

  const filtered = refunds.filter(r => {
    const matchTab =
      filterTab === "all" ? true :
      filterTab === "pending" ? r.status.startsWith("Pending") :
      filterTab === "approved" ? (r.status === "Approved" || r.status === "Processing") :
      filterTab === "paid" ? r.status === "Paid" :
      r.status === "Rejected"
    const matchSearch = search.length < 2 ? true :
      r.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  if (view === "submit") return <RefundForm onSubmitted={() => setView("list")} onCancel={() => setView("list")} />
  if (view === "detail" && selected) return (
    <RefundDetail
      refund={selected}
      onBack={() => { setView("list"); setSelected(null) }}
      canApproveReceivable={canApproveReceivable}
      canApproveFinal={canApproveFinal}
      canMarkPaid={canMarkPaid}
    />
  )

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" }, { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" }, { id: "paid", label: "Paid" },
    { id: "rejected", label: "Rejected" },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Refunds</h2>
          <p className="text-sm text-muted-foreground">{canViewAll ? "All refund requests across countries" : "Your submitted refund requests"}</p>
        </div>
        {can("ims_submit_refund") && (
          <Button onClick={() => setView("submit")} className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus className="size-4" /> Submit Refund
          </Button>
        )}
      </div>

      <AnalyticsCards refunds={refunds} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 h-9 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="Search by ref no, customer..."
            value={search} onChange={e => setSearch(e.target.value)}
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

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <FileText className="size-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">No refunds found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {can("ims_submit_refund") ? "Submit your first refund request." : "No refunds match your filters."}
            </p>
          </div>
        ) : (
          filtered.map(r => (
            <button key={r.id}
              onClick={() => { setSelected(r); setView("detail") }}
              className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-accent/50">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan-900/30 border border-cyan-800">
                <FileText className="size-4 text-cyan-400" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{r.customerName}</span>
                  <span className="text-xs text-muted-foreground font-mono">{r.referenceNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{r.bankName}</span>
                  <span>·</span>
                  <span>{formatAmount(r.amount, r.currency)}</span>
                  <span>·</span>
                  <span>{r.country}</span>
                  <span>·</span>
                  <span>{toDate(r.submissionDate).toLocaleDateString()}</span>
                </div>
              </div>
              <StatusBadge status={r.status} />
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
