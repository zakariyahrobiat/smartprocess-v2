import { ChevronRight, FileText } from "lucide-react";
import StatusBadge from "./statusBadge";
import FormatAmount from "../formatAmount";
import type { Invoice } from "@/lib/imsService";
import FormatDate from "../formatDate";

function InvoiceRow({
  invoice,
  onClick,
}: {
  invoice: Invoice;
  onClick: () => void;
}) {
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
          <span className="text-sm font-medium text-foreground">
            {invoice.vendor}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {invoice.requestId}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <span>{invoice.department}</span>
          <span>·</span>
          <span>{FormatAmount(invoice.amount, invoice.currency)}</span>
          <span>·</span>
          <span>{invoice.country}</span>
          <span>·</span>
          <span>{FormatDate(invoice.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <StatusBadge status={invoice.status} />
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
export default InvoiceRow