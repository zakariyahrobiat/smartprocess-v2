import type { Invoice } from "@/lib/imsService";
import { cn } from "@/lib/utils";

const WORKFLOW_STEPS = [
  "Submitted",
  "Line Manager",
  "Finance",
  "Senior Mgr",
  "Approved",
];

function WorkflowStepper({ invoice }: { invoice: Invoice }) {
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
    : WORKFLOW_STEPS;
  const currentStep = statusToStep[invoice.status] ?? 0;

  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;
        const isRejected = invoice.status === "Rejected";
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                  isRejected && isCurrent
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : isComplete
                      ? "bg-green-500 border-green-500 text-white"
                      : isCurrent
                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                        : "bg-muted border-border text-muted-foreground",
                )}
              >
                {isComplete ? "✓" : i + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] text-center leading-tight w-16",
                  isCurrent
                    ? "text-blue-400 font-medium"
                    : isComplete
                      ? "text-green-400"
                      : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mb-4 mx-1",
                  isComplete ? "bg-green-500" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
export default WorkflowStepper