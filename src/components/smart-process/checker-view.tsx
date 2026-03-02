import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { processFlows, mockAuditTrail, stepLabels } from "@/lib/store"
import { StatusBadge } from "./status-badge"
import { AuditTimeline } from "./audit-timeline"
import { Stepper } from "./stepper"
import { SubmissionRowSkeleton } from "./skeleton-loaders"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  subscribeToPendingSubmissions,
  updateSubmissionStatus,
  type FirestoreSubmission,
} from "@/lib/submissionService"
import { useAuth } from "@/context/auth-provider"
import {
  Laptop, Plane, CalendarDays, Package, Users, Wallet,
  ChevronRight, CheckCircle2, XCircle, MessageSquare,
  FileText, Flag, Building2, Paperclip, ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const iconMap: Record<string, typeof Laptop> = {
  laptop: Laptop, plane: Plane, calendar: CalendarDays,
  box: Package, users: Users, wallet: Wallet,
}

function toDate(val: unknown): Date {
  if (!val) return new Date()
  if (val instanceof Date) return val
  if (typeof val === "object" && val !== null && "toDate" in val) {
    return (val as { toDate: () => Date }).toDate()
  }
  return new Date(val as string)
}

export function CheckerView() {
  const { currentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [pendingSubmissions, setPendingSubmissions] = useState<FirestoreSubmission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<FirestoreSubmission | null>(null)
  const [comment, setComment] = useState("")
  const [isActing, setIsActing] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    const unsub = subscribeToPendingSubmissions((data) => {
      setPendingSubmissions(data)
      setIsLoading(false)
    })
    return () => unsub()
  }, [currentUser])

  const handleAction = async (action: "approve" | "reject" | "clarify") => {
    if (!comment.trim() && action !== "approve") {
      toast.error("Please add a comment before proceeding.")
      return
    }
    if (!selectedSubmission?.id) return

    setIsActing(true)
    try {
      const statusMap = {
        approve: "approved" as const,
        reject: "rejected" as const,
        clarify: "needs-info" as const,
      }
      await updateSubmissionStatus(selectedSubmission.id, statusMap[action], comment)
      const messages = {
        approve: "Request approved successfully!",
        reject: "Request has been rejected.",
        clarify: "Clarification request sent to submitter.",
      }
      toast.success(messages[action], {
        description: `${selectedSubmission.requestId} - ${selectedSubmission.title}`,
      })
      setSelectedSubmission(null)
      setComment("")
    } catch {
      toast.error("Failed to update request. Please try again.")
    } finally {
      setIsActing(false)
    }
  }

  if (selectedSubmission) {
    const flow = processFlows.find((p) => p.id === selectedSubmission.processType)
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedSubmission(null); setComment("") }} className="text-foreground">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{selectedSubmission.requestId}</h1>
              <StatusBadge status={selectedSubmission.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Submitted by {selectedSubmission.submittedBy} · {formatDistanceToNow(toDate(selectedSubmission.submittedAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 lg:p-6">
          <Stepper steps={stepLabels} currentStep={selectedSubmission.currentStep} />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Request Summary</h2>
              <dl className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs text-muted-foreground">Title</dt>
                    <dd className="text-sm font-medium text-foreground">{selectedSubmission.title}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs text-muted-foreground">Process</dt>
                    <dd className="text-sm font-medium text-foreground">{flow?.title ?? selectedSubmission.processType}</dd>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Flag className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Priority</dt>
                      <dd className="text-sm font-medium text-foreground capitalize">{selectedSubmission.priority}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Department</dt>
                      <dd className="text-sm font-medium text-foreground capitalize">{selectedSubmission.department}</dd>
                    </div>
                  </div>
                </div>
                {selectedSubmission.amount && (
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Amount</dt>
                      <dd className="text-sm font-medium text-foreground">₦{selectedSubmission.amount.toLocaleString()}</dd>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs text-muted-foreground">Description</dt>
                    <dd className="text-sm text-foreground leading-relaxed">{selectedSubmission.description}</dd>
                  </div>
                </div>
                {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Paperclip className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Attachments</dt>
                      <dd className="mt-1 flex flex-wrap gap-2">
                        {selectedSubmission.attachments.map((file) => (
                          <span key={file} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                            <Paperclip className="size-3" />{file}
                          </span>
                        ))}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Activity Timeline</h2>
              <AuditTimeline entries={mockAuditTrail} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Decision</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="checker-comment" className="text-foreground">
                    Comment <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="checker-comment"
                    placeholder="Add your review comments..."
                    className="mt-1.5 min-h-28"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => handleAction("approve")} disabled={isActing} className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle2 className="size-4" /> Approve
                  </Button>
                  <Button onClick={() => handleAction("reject")} disabled={isActing} variant="outline" className="w-full gap-2 border-destructive text-destructive hover:bg-destructive/10">
                    <XCircle className="size-4" /> Reject
                  </Button>
                  <Button onClick={() => handleAction("clarify")} disabled={isActing} variant="outline" className="w-full gap-2">
                    <MessageSquare className="size-4" /> Request Clarification
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pending Actions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review and take action on submitted requests.</p>
      </div>
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SubmissionRowSkeleton key={i} />)
        ) : pendingSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12 text-center">
            <CheckCircle2 className="size-10 text-green-500" />
            <p className="mt-3 text-sm font-medium text-foreground">All caught up!</p>
            <p className="mt-1 text-xs text-muted-foreground">No pending items require your attention.</p>
          </div>
        ) : (
          pendingSubmissions.map((submission) => {
            const flow = processFlows.find((p) => p.id === submission.processType)
            const FlowIcon = iconMap[flow?.icon ?? "box"] ?? Package
            return (
              <button
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className={cn("flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-accent/50")}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <FlowIcon className="size-4 text-primary" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-card-foreground">{submission.title}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{submission.requestId}</span>
                    <span>·</span>
                    <span>{submission.submittedBy}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(toDate(submission.submittedAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <StatusBadge status={submission.status} />
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
