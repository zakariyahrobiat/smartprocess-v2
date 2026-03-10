import type { Refund } from "@/lib/imsService";
import WorkflowStepper from "./workFlow";

const REFUND_STEPS = ["Submitted", "Receivable", "Approval", "Paid"];

export function RefundStepper({ refund }: { refund: Refund }) {
  const stepMap: Record<string, number> = {
    "Pending Receivable Approval": 0,
    "Pending Approval": 1,
    Approved: 2,
    Processing: 2,
    Paid: 3,
    Rejected: -1,
  };

  const currentStep = stepMap[refund.status] ?? 0;

  return (
    <WorkflowStepper
      steps={REFUND_STEPS}
      currentStep={currentStep}
      status={refund.status}
    />
  );
}
