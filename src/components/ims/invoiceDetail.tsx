import { AMOUNT_THRESHOLDS,  type Invoice } from "@/lib/imsService";
import { AlertCircle, ArrowLeft, Building2, CheckCircle2, DollarSign, FileText, Loader2, User, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import FormatAmount from "../formatAmount";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import DetailHeader from "./detailsHeader";
import DetailCard from "./detailsCard";
import { InvoiceStepper } from "./invoiceWorkFlow";

function InvoiceDetail({
  invoice,
  onBack,
  canApprove,
  canMarkPaid,
  userEmail,
}: {
  invoice: Invoice;
  onBack: () => void;
  canApprove: boolean;
  canMarkPaid: boolean;
  userEmail: string;
}) {
    const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [isActing, setIsActing] = useState(false);
  const exceedsThreshold =
    invoice.amount >= (AMOUNT_THRESHOLDS[invoice.country] ?? Infinity);

  const isMyTurnToApprove = () => {
    if (invoice.status === "Pending Line Manager Approval") {
      const emails = invoice.lineManagerEmail
        .split(",")
        .map((e) => e.trim().toLowerCase());
      return emails[invoice.approvalIndex] === userEmail.toLowerCase();
    }
    if (invoice.status === "Pending Finance Approval") return canApprove;
    if (invoice.status === "Pending Manager Approval") return canApprove;
    return false;
  };

  const handleApprove = async () => {
    if (!invoice.id) return;
    setIsActing(true);
    try {
      const managers = invoice.lineManagerEmail.split(",").map((e) => e.trim());
      const totalManagers = managers.length;
      let newStatus: Invoice["status"];
      let newIndex = invoice.approvalIndex;

      if (invoice.status === "Pending Line Manager Approval") {
        newIndex = invoice.approvalIndex + 1;
        if (newIndex < totalManagers) {
          newStatus = "Pending Line Manager Approval";
        } else {
          newStatus = "Pending Finance Approval";
        }
      } else if (invoice.status === "Pending Finance Approval") {
        newStatus = exceedsThreshold ? "Pending Manager Approval" : "Approved";
        newIndex = totalManagers + 1;
      } else {
        newStatus = "Approved";
      }

      // await updateInvoiceStatus(invoice.id, {
      //   status: newStatus,
      //   approvalIndex: newIndex,
      //   ...(newStatus === "Approved" ? { approvalDate: new Date() } : {}),
      // });
      toast.success("Invoice approved", {
        description: `New status: ${newStatus}`,
      });
      onBack();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setIsActing(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      toast.error("Please add a rejection reason");
      return;
    }
    if (!invoice.id) return;
    setIsActing(true);
    try {
      // await updateInvoiceStatus(invoice.id, {
      //   status: "Rejected",
      //   rejectionReason: comment,
      // });
      toast.success("Invoice rejected");
      onBack();
    } catch {
      toast.error("Failed to reject invoice");
    } finally {
      setIsActing(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!invoice.id) return;
    setIsActing(true);
    try {
      // await updateInvoiceStatus(invoice.id, { status: "Paid" });
      toast.success("Invoice marked as paid");
      onBack();
    } catch {
      toast.error("Failed to update");
    } finally {
      setIsActing(false);
    }
  };

  const showApprovalPanel =
    (isMyTurnToApprove() &&
      (invoice.status === "Pending Line Manager Approval" ||
        invoice.status === "Pending Finance Approval" ||
        invoice.status === "Pending Manager Approval")) ||
    (canMarkPaid && invoice.status === "Processing");

  return (
    <div className="space-y-6">
      <DetailHeader
        type="invoice"
        title={invoice.vendor}
        subtitle={`${invoice.requestId} · ${invoice.invoiceNumber}`}
        status={invoice.status}
        onBack={() => navigate("/ims/invoices")}
      />

      {/* Workflow */}
      <div className="rounded-xl border border-border bg-card p-5">
        <InvoiceStepper invoice={invoice} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Details (60%) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <DetailCard
              title="Invoice Details"
              items={[
                {
                  icon: User,
                  label: "Submitted By",
                  value: invoice.submitterName || invoice.submitterEmail,
                },
                {
                  icon: Building2,
                  label: "Department",
                  value: invoice.department,
                },
                {
                  icon: FileText,
                  label: "Cost Center",
                  value: invoice.costCenter,
                },
                {
                  icon: DollarSign,
                  label: "Amount",
                  value: FormatAmount(invoice.amount, invoice.currency),
                },
                {
                  icon: FileText,
                  label: "PO Number",
                  value: invoice.poNumber || "N/A",
                },
                { icon: Building2, label: "Country", value: invoice.country },
              ]}
            />
                    </div>

          {/* Approval chain */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Approval Chain
            </h2>
            {/* <div className="space-y-2">
              {invoice.managers.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 rounded-lg p-2.5 text-sm",
                    i < invoice.approvalIndex
                      ? "bg-sk-teal/10 border border-sk-teal/30"
                      : i === invoice.approvalIndex &&
                          invoice.status.includes("Line Manager")
                        ? "bg-sk-orange/10 border border-sk-orange/30"
                        : "bg-muted/40",
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      i < invoice.approvalIndex
                        ? "bg-sk-teal text-white"
                        : i === invoice.approvalIndex
                          ? "bg-sk-orange text-white"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i < invoice.approvalIndex ? "✓" : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </div>
              ))}
            </div> */}
          </div>

          {/* Attachments */}
          {invoice.attachmentLinks.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Attachments
              </h2>
              <div className="space-y-2">
                {invoice.attachmentLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-primary hover:bg-muted/80 transition-colors"
                  >
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
                  <p className="text-sm font-medium text-red-400">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {invoice.rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action panel (40%) */}
        {showApprovalPanel && (
          <div className="lg:col-span-2">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">
                Action Required
              </h2>
              {exceedsThreshold &&
                invoice.status === "Pending Finance Approval" && (
                  <div className="flex items-start gap-2 rounded-lg bg-yellow-900/20 border border-yellow-800 p-3 text-xs text-yellow-400">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>
                      Amount exceeds threshold (
                      {AMOUNT_THRESHOLDS[invoice.country].toLocaleString()}{" "}
                      {invoice.currency}). Approval will be escalated to Senior
                      Manager.
                    </span>
                  </div>
                )}
              {invoice.status !== "Processing" && (
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Comment
                  </label>
                  <textarea
                    className="mt-1.5 w-full min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="Add comments (required for rejection)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {invoice.status !== "Processing" && (
                  <>
                    <Button
                      onClick={handleApprove}
                      disabled={isActing}
                      className="w-full gap-2 bg-sk-teal hover:bg-sk-teal-hover text-white"
                    >
                      {isActing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={isActing}
                      variant="outline"
                      className="w-full gap-2 border-red-800 text-red-400 hover:bg-red-900/20"
                    >
                      <XCircle className="size-4" />
                      Reject
                    </Button>
                  </>
                )}
                {canMarkPaid && invoice.status === "Processing" && (
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
export default InvoiceDetail