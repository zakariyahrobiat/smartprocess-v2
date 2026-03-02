import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { processFlows } from "@/lib/store"
import { StatusBadge } from "./status-badge"
import { SubmissionRowSkeleton } from "./skeleton-loaders"
import { Stepper } from "./stepper"
import { stepLabels } from "@/lib/store"
import { useAuth } from "@/context/auth-provider"
import {
  subscribeToUserSubmissions,
  subscribeToPendingSubmissions,
  getAllSubmissions,
  type FirestoreSubmission,
  type SubmissionStatus,
} from "@/lib/submissionService"
import {
  Laptop, Plane, CalendarDays, Package, Users, Wallet,
  ChevronRight, ArrowLeft, FileText, Building2, Flag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const iconMap: Record<string, typeof Laptop> = {
  laptop: Laptop, plane: Plane, calendar: CalendarDays,
  box: Package, users: Users, wallet: Wallet,
}

interface SubmissionsListProps {
  filter?: "all" | "pending" | "approved" | "rejected" | "needs-info"
  title: string
  description: string
  mode?: "my" | "all" | "pending"
}

// Convert Firestore timestamp to Date safely
function toDate(val: unknown): Date {
  if (!val) return new Date()
  if (val instanceof Date) return val
  if (typeof val === "object" && val !== null && "toDate" in val) {
    return (val as { toDate: () => Date }).toDate()
  }
  return new Date(val as string)
}

export function SubmissionsList({
  filter = "all",
  title,
  description,
  mode = "my",
}: SubmissionsListProps) {
  const { currentUser, can } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [submissions, setSubmissions] = useState<FirestoreSubmission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<FirestoreSubmission | null>(null)

  useEffect(() => {
    if (!currentUser) return

    let unsubscribe: (() => void) | undefined

    if (mode === "my") {
      unsubscribe = subscribeToUserSubmissions(currentUser.uid, (data) => {
        setSubmissions(data)
        setIsLoading(false)
      })
    } else if (mode === "pending") {
      unsubscribe = subscribeToPendingSubmissions((data) => {
        setSubmissions(data)
        setIsLoading(false)
      })
    } else {
      // all — for checkers / admins with view_all_submissions
      if (can("view_all_submissions")) {
        getAllSubmissions().then((data) => {
          setSubmissions(data)
          setIsLoading(false)
        })
      } else {
        unsubscribe = subscribeToUserSubmissions(currentUser.uid, (data) => {
          setSubmissions(data)
          setIsLoading(false)
        })
      }
    }

    return () => unsubscribe?.()
  }, [currentUser, mode, can])

  const filteredSubmissions =
    filter === "all"
      ? submissions
      : submissions.filter((s) => s.status === (filter as SubmissionStatus))

  if (selectedSubmission) {
    const flow = processFlows.find((p) => p.id === selectedSubmission.processType)
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(null)} className="text-foreground">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{selectedSubmission.title}</h1>
              <StatusBadge status={selectedSubmission.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedSubmission.requestId} · {formatDistanceToNow(toDate(selectedSubmission.submittedAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 lg:p-6">
          <Stepper steps={stepLabels} currentStep={selectedSubmission.currentStep} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Request Details</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Process Type</dt>
                <dd className="text-sm font-medium text-foreground">{flow?.title ?? selectedSubmission.processType}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Flag className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Priority</dt>
                <dd className="text-sm font-medium text-foreground capitalize">{selectedSubmission.priority}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building2 className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Department</dt>
                <dd className="text-sm font-medium text-foreground capitalize">{selectedSubmission.department}</dd>
              </div>
            </div>
            {selectedSubmission.amount && (
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Amount</dt>
                  <dd className="text-sm font-medium text-foreground">
                    ₦{selectedSubmission.amount.toLocaleString()}
                  </dd>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 sm:col-span-2">
              <FileText className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Description</dt>
                <dd className="text-sm text-foreground leading-relaxed">{selectedSubmission.description}</dd>
              </div>
            </div>
            {selectedSubmission.justification && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <FileText className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Business Justification</dt>
                  <dd className="text-sm text-foreground leading-relaxed">{selectedSubmission.justification}</dd>
                </div>
              </div>
            )}
            {selectedSubmission.submittedBy && (
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Submitted By</dt>
                  <dd className="text-sm font-medium text-foreground">{selectedSubmission.submittedBy}</dd>
                </div>
              </div>
            )}
          </dl>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SubmissionRowSkeleton key={i} />)
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12 text-center">
            <Package className="size-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">No submissions found</p>
            <p className="mt-1 text-xs text-muted-foreground">Items matching this filter will appear here.</p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => {
            const flow = processFlows.find((p) => p.id === submission.processType)
            const FlowIcon = iconMap[flow?.icon ?? "box"] ?? Package
            return (
              <button
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors",
                  "hover:border-primary/30 hover:bg-accent/50"
                )}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <FlowIcon className="size-4 text-primary" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-card-foreground">{submission.title}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{submission.requestId}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(toDate(submission.submittedAt), { addSuffix: true })}</span>
                    {submission.submittedBy && mode !== "my" && (
                      <>
                        <span>·</span>
                        <span>{submission.submittedBy}</span>
                      </>
                    )}
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
