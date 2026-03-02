
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
  steps: string[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
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
                      isCurrent &&
                        "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      isUpcoming &&
                        "border-2 border-border bg-card text-muted-foreground"
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {isComplete ? (
                      <Check className="size-4" />
                    ) : (
                      stepNumber
                    )}
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
