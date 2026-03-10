
import type { Invoice } from "@/lib/imsService";
import WorkflowStepper from "./workFlow";

const INVOICE_STEPS = [
  "Submitted",
  "Line Manager",
  "Finance",
  "Senior Mgr",
  "Approved",
];

export function InvoiceStepper({ invoice }: { invoice: Invoice }) {
  const statusToStep: Record<string, number> = {
    "Pending Line Manager Approval": 1,
    "Pending Finance Approval": 2,
    "Pending Manager Approval": 3,
    Approved: 4,
    Processing: 4,
    Paid: 4,
    Rejected: -1,
  };

  const isProcurement = invoice.department === "Operation & Procurement";

  const steps = isProcurement
    ? ["Submitted", "Finance", "Senior Mgr", "Approved"]
    : INVOICE_STEPS;

  const currentStep = statusToStep[invoice.status] ?? 0;

  return (
    <WorkflowStepper
      steps={steps}
      currentStep={currentStep}
      status={invoice.status}
    />
  );
}
