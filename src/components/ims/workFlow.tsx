import { cn } from "@/lib/utils";

interface WorkflowStepperProps {
  steps: string[];
  currentStep: number;
  status?: string;
}

export default function WorkflowStepper({
  steps,
  currentStep,
  status,
}: WorkflowStepperProps) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;
        const isRejected = status === "Rejected";

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
