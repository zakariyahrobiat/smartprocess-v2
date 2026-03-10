import FormatAmount from "@/components/formatAmount"
import { Button } from "@/components/ui/button"
import { updateRefundStatus, type Refund, type RefundStatus } from "@/lib/imsService"
import { AlertCircle,  Building2, CheckCircle2, DollarSign, FileText, Loader2, User, XCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Timestamp } from "firebase/firestore"
import DetailHeader from "@/components/ims/detailsHeader"
import FormatDate from "@/components/formatDate"
import DetailCard from "./detailsCard"
import { RefundStepper } from "./RefundWorkFlow"


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
        ...(showApproveReceivable ? { receivableApprovalDate: Timestamp.now() } : { approvalDate: Timestamp.now() }),
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
      <DetailHeader
        type="refund"
        title={refund.customerName}
        subtitle={`${refund.referenceNumber} · ${FormatDate(refund.submissionDate)}`}
        status={refund.status}
        onBack={onBack}
      />

      <div className="rounded-xl border border-border bg-card p-5">
        <RefundStepper refund={refund} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <DetailCard
              title="Refund Details"
              items={[
                {
                  icon: User,
                  label: "Submitted By",
                  value: refund.submitterName || refund.submitterEmail,
                },
                { icon: Building2, label: "Country", value: refund.country },
                {
                  icon: User,
                  label: "Customer Name",
                  value: refund.customerName,
                },
                {
                  icon: FileText,
                  label: "Account Number",
                  value: refund.accountNumber,
                },
                { icon: Building2, label: "Bank", value: refund.bankName },
                {
                  icon: DollarSign,
                  label: "Amount",
                  value: FormatAmount(refund.amount, refund.currency),
                },
              ]}
            />
                   </div>

          {refund.rejectionReason && (
            <div className="rounded-xl border border-red-800 bg-red-900/20 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-400">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {refund.rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {showPanel && (
          <div className="lg:col-span-2">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">
                Action Required
              </h2>
              {!showMarkPaid && (
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Comment
                  </label>
                  <textarea
                    className="mt-1.5 w-full min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Add comment (required for rejection)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {(showApproveReceivable || showApproveFinal) && (
                  <Button
                    onClick={handleApprove}
                    disabled={isActing}
                    className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isActing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    {showApproveReceivable
                      ? "Approve & Forward"
                      : "Final Approve"}
                  </Button>
                )}
                {showReject && (
                  <Button
                    onClick={handleReject}
                    disabled={isActing}
                    variant="outline"
                    className="w-full gap-2 border-red-800 text-red-400 hover:bg-red-900/20"
                  >
                    <XCircle className="size-4" /> Reject
                  </Button>
                )}
                {showMarkPaid && (
                  <Button
                    onClick={handleMarkPaid}
                    disabled={isActing}
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isActing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default RefundDetail