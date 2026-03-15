import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Unified Stepper — replaces:
//   • components/smart-process/stepper.tsx     (variant="process")
//   • components/ims/workFlow.tsx              (variant="workflow")
// ─────────────────────────────────────────────────────────────────────────────

interface StepperProps {
  steps: string[]
  currentStep: number
  /** "process" = smart-process maker/checker view (clickable, primary color)
   *  "workflow" = IMS invoice/refund approval flow (sk-teal done, sk-orange current) */
  variant?: "process" | "workflow"
  /** Only used in process variant — makes step circles clickable */
  onStepClick?: (step: number) => void
  /** Only used in workflow variant — drives the rejected highlight */
  status?: string
}

export function Stepper({
  steps,
  currentStep,
  variant = "process",
  onStepClick,
  status,
}: StepperProps) {
  if (variant === "workflow") {
    return <WorkflowStepper steps={steps} currentStep={currentStep} status={status} />
  }
  return <ProcessStepper steps={steps} currentStep={currentStep} onStepClick={onStepClick} />
}

// ── Process variant (smart-process views) ────────────────────────────────────
function ProcessStepper({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: string[]
  currentStep: number
  onStepClick?: (step: number) => void
}) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center gap-0">
        {steps.map((label, index) => {
          const stepNumber = index + 1
          const isComplete = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <li key={label} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-center">
                  {index > 0 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 transition-colors",
                        isComplete || isCurrent ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                  <button
                    onClick={() => onStepClick?.(stepNumber)}
                    disabled={!onStepClick}
                    className={cn(
                      "relative flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                      isComplete && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      isUpcoming && "border-2 border-border bg-card text-muted-foreground"
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {isComplete ? <Check className="size-4" /> : stepNumber}
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 transition-colors",
                        isComplete ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium text-center leading-tight",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ── Workflow variant (IMS invoice/refund approval) ───────────────────────────
function WorkflowStepper({
  steps,
  currentStep,
  status,
}: {
  steps: string[]
  currentStep: number
  status?: string
}) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => {
        const isComplete = i < currentStep
        const isCurrent = i === currentStep
        const isRejected = status === "Rejected"

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                  isRejected && isCurrent
                    ? "bg-destructive/20 border-destructive text-destructive"
                    : isComplete
                    ? "bg-sk-teal border-sk-teal text-white"
                    : isCurrent
                    ? "bg-sk-orange/20 border-sk-orange text-sk-orange"
                    : "bg-muted border-border text-muted-foreground"
                )}
              >
                {isComplete ? "✓" : i + 1}
              </div>

              <span
                className={cn(
                  "text-[10px] text-center leading-tight w-16",
                  isCurrent
                    ? "text-sk-orange font-medium"
                    : isComplete
                    ? "text-sk-teal"
                    : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mb-4 mx-1",
                  isComplete ? "bg-sk-teal" : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Stepper
