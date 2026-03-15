// Re-exports from unified stepper — kept for backwards compatibility
// If you import WorkflowStepper directly elsewhere, update to:
//   import { Stepper } from "@/components/shared/stepper"
import { Stepper } from "@/components/shared/stepper"

interface WorkflowStepperProps {
  steps: string[]
  currentStep: number
  status?: string
}

/** @deprecated Use <Stepper variant="workflow" /> from @/components/shared/stepper */
export default function WorkflowStepper({ steps, currentStep, status }: WorkflowStepperProps) {
  return <Stepper variant="workflow" steps={steps} currentStep={currentStep} status={status} />
}
