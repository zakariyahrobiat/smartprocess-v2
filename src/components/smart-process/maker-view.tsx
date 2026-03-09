
import { useState, useCallback, useEffect } from "react"
import { processFlows, stepLabels } from "@/lib/store"
import { submitRequest } from "@/lib/submissionService"
import { useAuth } from "@/context/auth-provider"
import { ProcessCard } from "./process-card"
import { Stepper } from "./stepper"
import { ProcessCardSkeleton } from "./skeleton-loaders"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Upload, Check, Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function MakerView() {
  const { currentUser } = useAuth()
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaved, setAutoSaved] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    department: "",
    amount: "",
    justification: "",
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Auto-save indicator
  useEffect(() => {
    if (!selectedProcess) return
    const hasData = Object.values(formData).some((v) => v !== "")
    if (!hasData) return
    const timer = setTimeout(() => {
      setAutoSaved(true)
      setTimeout(() => setAutoSaved(false), 2000)
    }, 1500)
    return () => clearTimeout(timer)
  }, [formData, selectedProcess])

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.priority) {
      toast.error("Please fill in all required fields.")
      return
    }
    if (!currentUser) {
      toast.error("You must be signed in to submit a request.")
      return
    }

    setIsSubmitting(true)
    try {
      const selectedFlow = processFlows.find((p) => p.id === selectedProcess)
      await submitRequest({
        processType: selectedProcess!,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        department: formData.department,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        justification: formData.justification,
        submittedBy: currentUser.displayName,
        submittedByUid: currentUser.uid,
        submittedByEmail: currentUser.email,
      })

      toast.success("Request submitted successfully!", {
        description: `Your ${selectedFlow?.title} request has been sent for review.`,
      })

      // Reset form
      setSelectedProcess(null)
      setCurrentStep(1)
      setFormData({
        title: "",
        description: "",
        priority: "",
        department: "",
        amount: "",
        justification: "",
      })
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("Failed to submit request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedProcess) {
    return (
      <div className="flex-1 overflow-y-auto space-y-6 p-4 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Request</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a process to get started with your submission.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <ProcessCardSkeleton key={i} />
              ))
            : processFlows.map((flow) => (
                <ProcessCard
                  key={flow.id}
                  process={flow}
                  onSelect={setSelectedProcess}
                />
              ))}
        </div>
      </div>
    );
  }

  const selectedFlow = processFlows.find((p) => p.id === selectedProcess)
  const isFormValid = formData.title && formData.description && formData.priority

  return (
    <div className="flex-1 overflow-y-auto space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedProcess(null);
            setCurrentStep(1);
          }}
          className="text-foreground"
          aria-label="Back to process selection"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">
            {selectedFlow?.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedFlow?.description}
          </p>
        </div>
        {autoSaved && (
          <span className="flex items-center gap-1 text-xs text-green-500 animate-in fade-in-0">
            <Save className="size-3" /> Draft saved
          </span>
        )}
      </div>

      {/* Stepper */}
      <div className="rounded-xl border border-border bg-card p-4 lg:p-6">
        <Stepper
          steps={stepLabels}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-card p-5 lg:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title" className="text-foreground">
              Request Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title..."
              className="mt-1.5"
              value={formData.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="priority" className="text-foreground">
              Priority <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(v) => handleFieldChange("priority", v)}
            >
              <SelectTrigger id="priority" className="mt-1.5">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="department" className="text-foreground">
              Department
            </Label>
            <Select
              value={formData.department}
              onValueChange={(v) => handleFieldChange("department", v)}
            >
              <SelectTrigger id="department" className="mt-1.5">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="optimization">Optimization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount" className="text-foreground">
              Estimated Amount (₦)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              className="mt-1.5"
              value={formData.amount}
              onChange={(e) => handleFieldChange("amount", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="description" className="text-foreground">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of your request..."
              className="mt-1.5 min-h-24"
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="justification" className="text-foreground">
              Business Justification
            </Label>
            <Textarea
              id="justification"
              placeholder="Explain why this request is needed..."
              className="mt-1.5 min-h-20"
              value={formData.justification}
              onChange={(e) =>
                handleFieldChange("justification", e.target.value)
              }
            />
          </div>

          {/* File Drop Zone */}
          <div className="sm:col-span-2">
            <Label className="text-foreground">Attachments</Label>
            <div
              className={cn(
                "mt-1.5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors",
                "hover:border-primary hover:bg-accent/50 cursor-pointer",
              )}
              role="button"
              tabIndex={0}
              aria-label="Upload files"
            >
              <Upload className="size-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">
                Drag & drop files here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or click to browse (PDF, DOCX, PNG up to 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Submitted by */}
        {currentUser && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-900/50 border border-gray-800 px-4 py-2.5">
            <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center text-white text-[10px] font-bold">
              {currentUser.displayName?.charAt(0) ?? "?"}
            </div>
            <span className="text-xs text-gray-400">
              Submitting as{" "}
              <span className="text-white font-medium">
                {currentUser.displayName}
              </span>
              <span className="text-gray-600 ml-1">· {currentUser.email}</span>
            </span>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedProcess(null);
              setCurrentStep(1);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className={cn(
              "gap-2 min-w-[140px]",
              isFormValid && !isSubmitting
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Check className="size-4" /> Submit Request
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
