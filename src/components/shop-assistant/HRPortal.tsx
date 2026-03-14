/**
 * HRPortal — Enrollment approvals + monthly attendance overview + CSV export.
 * Logic unchanged. Presentation: SK tokens + Tailwind.
 */
import { useCallback, useEffect, useState } from 'react'
import { saApi } from '../../api/saApi'
import type { EnrollmentRequest, HROverviewRow, HROverviewResponse, HRDecision, HRDecisionRequest } from '../../types/sa.types'
import { cn } from '@/lib/utils'
import { UserCheck, BarChart3, CheckCircle2, XCircle, Clock, AlertCircle, Loader2, Download, X, Search } from 'lucide-react'
import { toast } from 'sonner'

type HRTab = 'enrollment' | 'overview'

export default function HRPortal() {
  const [tab, setTab]                     = useState<HRTab>('enrollment')
  const [enrollments, setEnrollments]     = useState<EnrollmentRequest[]>([])
  const [overview, setOverview]           = useState<HROverviewResponse | null>(null)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentRequest | null>(null)
  const [enrollComment, setEnrollComment]   = useState('')
  const [enrollBusy, setEnrollBusy]         = useState(false)

  const [search, setSearch]               = useState('')
  const [selectedRow, setSelectedRow]     = useState<HROverviewRow | null>(null)
  const [hrDecision, setHRDecision]       = useState<HRDecision>('VALIDATED')
  const [hrComment, setHRComment]         = useState('')
  const [hrBusy, setHRBusy]               = useState(false)
  const [exportBusy, setExportBusy]       = useState(false)

  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()
  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' })

  const loadEnrollments = useCallback(async () => {
    setLoading(true); setError(null)
    try { const res = await saApi.getEnrollmentRequests(); setEnrollments(res.items) }
    catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  const loadOverview = useCallback(async () => {
    setLoading(true); setError(null)
    try { const res = await saApi.getHROverview(month, year); setOverview(res) }
    catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }, [month, year])

  useEffect(() => {
    if (tab === 'enrollment') loadEnrollments()
    else loadOverview()
  }, [tab, loadEnrollments, loadOverview])

  const handleEnrollDecision = async (decision: 'approve' | 'reject') => {
    if (!selectedEnrollment) return
    setEnrollBusy(true)
    try {
      if (decision === 'approve') await saApi.approveEnrollment(selectedEnrollment.assistant_id, enrollComment)
      else await saApi.rejectEnrollment(selectedEnrollment.assistant_id, enrollComment)
      toast.success(`Enrollment ${decision === 'approve' ? 'approved' : 'rejected'}`)
      setSelectedEnrollment(null)
      await loadEnrollments()
    } catch (err: any) { toast.error(err.message) }
    finally { setEnrollBusy(false) }
  }

  const handleHRDecision = async () => {
    if (!selectedRow) return
    setHRBusy(true)
    try {
      await saApi.submitHRDecision({
        assistant_id:    selectedRow.assistant_id,
        month, year,
        assistant_email: selectedRow.assistant_email,
        decision:        hrDecision,
        comment:         hrComment,
      })
      toast.success(`HR decision submitted: ${hrDecision}`)
      setSelectedRow(null)
      await loadOverview()
    } catch (err: any) { toast.error(err.message) }
    finally { setHRBusy(false) }
  }

  const handleExport = async () => {
    setExportBusy(true)
    try {
      const res = await saApi.exportApproved(month, year)
      const blob = new Blob([res.csv], { type: 'text/csv' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = res.filename; a.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${res.count} records`)
    } catch (err: any) { toast.error(err.message) }
    finally { setExportBusy(false) }
  }

  const filteredRows = (overview?.rows ?? []).filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return [r.assistant_name, r.assistant_email, r.shop_id, r.shop_area].some(s => s.toLowerCase().includes(q))
  })

  if (error) return (
    <div className="max-w-md mx-auto p-6">
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 flex items-start gap-3">
        <AlertCircle className="size-5 text-destructive mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-foreground text-sm">SA API unavailable</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">{monthLabel} · Attendance management</p>
        </div>
        {tab === 'overview' && (
          <button onClick={handleExport} disabled={exportBusy}
            className="flex items-center gap-2 text-sm font-medium text-white bg-sk-teal hover:bg-sk-teal-hover px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
            {exportBusy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Export CSV
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          ['enrollment', <UserCheck className="size-4" />, 'Enrollment Requests', enrollments.length],
          ['overview',   <BarChart3 className="size-4" />, 'Monthly Overview', (overview?.rows ?? []).length],
        ] as const).map(([id, icon, label, count]) => (
          <button key={id} onClick={() => setTab(id as HRTab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              tab === id ? "border-sk-teal text-sk-teal" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {icon}{label}
            {count > 0 && (
              <span className="ml-1 rounded-full bg-sk-orange/15 text-sk-orange text-[10px] font-bold px-1.5">{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Enrollment Tab ───────────────────────────────────────────── */}
      {tab === 'enrollment' && (
        loading ? (
          <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <CheckCircle2 className="size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No pending enrollment requests</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map(e => (
              <div key={e.assistant_id} className="rounded-xl border border-border bg-card overflow-hidden">
                <img src={e.photo_url} alt={e.assistant_name}
                  className="w-full h-40 object-cover" />
                <div className="p-4">
                  <p className="font-semibold text-foreground">{e.assistant_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{e.email}</p>
                  <p className="text-xs text-muted-foreground">{new Date(e.request_date).toLocaleDateString()}</p>
                  <button onClick={() => { setSelectedEnrollment(e); setEnrollComment('') }}
                    className="mt-3 w-full text-xs font-semibold text-white bg-sk-orange hover:bg-sk-orange-hover py-2 rounded-lg transition-colors">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Overview Tab ─────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input placeholder="Search assistants..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 h-9 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:border-sk-teal focus:outline-none" />
          </div>
          {loading ? (
            <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}</div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-muted/50">
                  <tr>
                    {['Assistant', 'Attendance', 'Supervisor', 'HR Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredRows.map(r => (
                    <tr key={r.assistant_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{r.assistant_name}</p>
                        <p className="text-xs text-muted-foreground">{r.shop_area}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("font-semibold text-sm", r.passed ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                          {r.percentage}
                        </span>
                        <p className="text-xs text-muted-foreground">{r.checkins}/{r.working_days} days</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-medium",
                          r.supervisor_status === 'APPROVED' ? "text-green-600 dark:text-green-400" :
                          r.supervisor_status === 'REJECTED' ? "text-destructive" : "text-amber-600 dark:text-amber-400"
                        )}>{r.supervisor_status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                          r.hr_status === 'VALIDATED'      ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                          r.hr_status === 'INELIGIBLE'     ? "bg-destructive/10 text-destructive" :
                          "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}>
                          {r.hr_status === 'VALIDATED' ? <CheckCircle2 className="size-3" /> :
                           r.hr_status === 'INELIGIBLE' ? <XCircle className="size-3" /> : <Clock className="size-3" />}
                          {r.hr_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.hr_status === 'PENDING_REVIEW' && (
                          <button onClick={() => { setSelectedRow(r); setHRDecision('VALIDATED'); setHRComment('') }}
                            className="text-xs font-medium text-sk-teal hover:underline">
                            Decide
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Enrollment decision modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground">Review Enrollment</h2>
              <button onClick={() => setSelectedEnrollment(null)} className="rounded-lg p-1.5 hover:bg-muted">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <img src={selectedEnrollment.photo_url} alt={selectedEnrollment.assistant_name}
              className="w-full rounded-xl border-2 border-sk-gold" />
            <div>
              <p className="font-semibold text-foreground">{selectedEnrollment.assistant_name}</p>
              <p className="text-xs text-muted-foreground">{selectedEnrollment.email}</p>
            </div>
            <textarea placeholder="Comment (optional for approval)"
              value={enrollComment} onChange={e => setEnrollComment(e.target.value)}
              className="w-full min-h-16 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-sk-teal focus:outline-none resize-none" />
            <div className="flex gap-3">
              <button onClick={() => handleEnrollDecision('approve')} disabled={enrollBusy}
                className="flex-1 flex items-center justify-center gap-2 bg-sk-teal hover:bg-sk-teal-hover text-white font-semibold py-2.5 rounded-lg disabled:opacity-60">
                {enrollBusy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Approve
              </button>
              <button onClick={() => handleEnrollDecision('reject')} disabled={enrollBusy}
                className="flex-1 flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60">
                {enrollBusy ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />} Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HR decision modal */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground">HR Decision</h2>
              <button onClick={() => setSelectedRow(null)} className="rounded-lg p-1.5 hover:bg-muted">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-medium text-foreground text-sm">{selectedRow.assistant_name}</p>
              <p className="text-xs text-muted-foreground">{selectedRow.shop_area} · {selectedRow.percentage} ({selectedRow.checkins}/{selectedRow.working_days} days)</p>
            </div>
            <div className="flex gap-2">
              {(['VALIDATED', 'INELIGIBLE'] as HRDecision[]).map(d => (
                <button key={d} onClick={() => setHRDecision(d)}
                  className={cn("flex-1 py-2 rounded-lg text-xs font-medium border transition-colors",
                    hrDecision === d
                      ? d === 'VALIDATED' ? "bg-sk-teal text-white border-sk-teal" : "bg-destructive text-white border-destructive"
                      : "bg-background text-muted-foreground border-border"
                  )}>
                  {d}
                </button>
              ))}
            </div>
            <textarea placeholder="Comment (optional)"
              value={hrComment} onChange={e => setHRComment(e.target.value)}
              className="w-full min-h-16 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-sk-teal focus:outline-none resize-none" />
            <button onClick={handleHRDecision} disabled={hrBusy}
              className={cn("w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition-colors",
                hrDecision === 'VALIDATED' ? "bg-sk-teal hover:bg-sk-teal-hover" : "bg-destructive hover:bg-destructive/90"
              )}>
              {hrBusy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Confirm {hrDecision}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
