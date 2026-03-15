/**
 * SupervisorPortal — monthly attendance review + validation.
 * Logic unchanged. Presentation: SK tokens + Tailwind.
 */
import { useCallback, useEffect, useState } from 'react'
import { saApi } from '../../api/saApi'
import type { AssistantAttendanceSummary, SupervisorAssistantsResponse, ValidationStatus } from '../../types/sa.types'
import { cn } from '@/lib/utils'
import { Users, Search, CheckCircle2, XCircle, Clock, AlertCircle, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

type TabKey = 'all' | 'pending' | 'approved' | 'rejected'

export default function SupervisorPortal() {
  const [data, setData]                     = useState<SupervisorAssistantsResponse | null>(null)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState<string | null>(null)
  const [tab, setTab]                       = useState<TabKey>('all')
  const [search, setSearch]                 = useState('')
  const [selected, setSelected]             = useState<AssistantAttendanceSummary | null>(null)
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('APPROVED')
  const [validationComment, setValidationComment] = useState('')
  const [busy, setBusy]                     = useState(false)

  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { const res = await saApi.getSupervisorAssistants(month, year); setData(res) }
    catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }, [month, year])

  useEffect(() => { load() }, [load])

  const filtered = (data?.assistants ?? []).filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || [a.assistant_name, a.assistant_email, a.shop_id, a.shop_area].some(s => s.toLowerCase().includes(q))
    const matchTab = tab === 'all' ? true : tab === 'pending' ? a.validation_status === 'PENDING' :
                     tab === 'approved' ? a.validation_status === 'APPROVED' : a.validation_status === 'REJECTED'
    return matchSearch && matchTab
  })

  const counts = {
    all:      data?.assistants.length ?? 0,
    pending:  data?.assistants.filter(a => a.validation_status === 'PENDING').length ?? 0,
    approved: data?.assistants.filter(a => a.validation_status === 'APPROVED').length ?? 0,
    rejected: data?.assistants.filter(a => a.validation_status === 'REJECTED').length ?? 0,
  }

  const submitValidation = async () => {
    if (!selected) return
    setBusy(true)
    try {
      await saApi.validateAssistant({ assistant_id: selected.assistant_id, month, year, status: validationStatus, comment: validationComment })
      toast.success(`${selected.assistant_name} ${validationStatus.toLowerCase()}`)
      setData(prev => prev ? {
        ...prev,
        assistants: prev.assistants.map(a => a.assistant_id === selected.assistant_id
          ? { ...a, validation_status: validationStatus, validation_comment: validationComment }
          : a)
      } : prev)
      setSelected(null)
    } catch (err: any) { toast.error(err.message) }
    finally { setBusy(false) }
  }

  const passRate = data?.assistants.length
    ? Math.round((data.assistants.filter(a => a.passed).length / data.assistants.length) * 100)
    : 0

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
          <h1 className="text-2xl font-bold text-foreground">Team Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            {data && ` · ${data.working_days} working days`}
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-xs text-sk-teal hover:underline">
          <Loader2 className={cn("size-3.5", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total SAs",  value: data.assistants.length,                                   accent: "border-l-sk-teal" },
            { label: "Pass Rate",  value: `${passRate}%`,                                            accent: "border-l-green-500" },
            { label: "Pending",    value: counts.pending,                                            accent: "border-l-amber-400" },
            { label: "Working Days", value: data.working_days,                                       accent: "border-l-sk-orange" },
          ].map(s => (
            <div key={s.label} className={cn("bg-card rounded-xl border border-border border-l-4 p-4", s.accent)}>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input placeholder="Search assistants..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 h-9 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:border-sk-teal focus:outline-none" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as TabKey[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize",
                tab === t ? "bg-sk-teal text-white border-sk-teal" : "bg-background text-muted-foreground border-border"
              )}>
              {t} ({counts[t]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[0,1,2].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
          <Users className="size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No assistants found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted/50">
              <tr>
                {['Assistant', 'Check-ins', 'Attendance %', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map(a => (
                <tr key={a.assistant_id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{a.assistant_name}</p>
                    <p className="text-xs text-muted-foreground">{a.shop_area} · {a.shop_id}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-foreground">{a.checkins}/{a.working_days}</td>
                  <td className="px-4 py-3">
                    <span className={cn("font-semibold", a.passed ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                      {a.percentage}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                      a.validation_status === 'APPROVED' ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                      a.validation_status === 'REJECTED' ? "bg-destructive/10 text-destructive" :
                      "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    )}>
                      {a.validation_status === 'APPROVED' ? <CheckCircle2 className="size-3" /> :
                       a.validation_status === 'REJECTED' ? <XCircle className="size-3" /> :
                       <Clock className="size-3" />}
                      {a.validation_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.validation_status === 'PENDING' && (
                      <button onClick={() => { setSelected(a); setValidationStatus('APPROVED'); setValidationComment('') }}
                        className="text-xs font-medium text-sk-teal hover:underline">
                        Validate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Validation modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground">Validate Attendance</h2>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 hover:bg-muted">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-medium text-foreground text-sm">{selected.assistant_name}</p>
              <p className="text-xs text-muted-foreground">{selected.shop_area} · {selected.checkins}/{selected.working_days} days ({selected.percentage})</p>
            </div>
            <div className="flex gap-2">
              {(['APPROVED', 'REJECTED'] as ValidationStatus[]).map(s => (
                <button key={s} onClick={() => setValidationStatus(s)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                    validationStatus === s
                      ? s === 'APPROVED' ? "bg-sk-teal text-white border-sk-teal" : "bg-destructive text-white border-destructive"
                      : "bg-background text-muted-foreground border-border"
                  )}>
                  {s === 'APPROVED' ? 'Approve' : 'Reject'}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Comment (optional for approval, required for rejection)"
              value={validationComment}
              onChange={e => setValidationComment(e.target.value)}
              className="w-full min-h-20 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-sk-teal focus:outline-none resize-none"
            />
            <button onClick={submitValidation} disabled={busy}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition-colors",
                validationStatus === 'APPROVED' ? "bg-sk-teal hover:bg-sk-teal-hover" : "bg-destructive hover:bg-destructive/90"
              )}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Confirm {validationStatus === 'APPROVED' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
