/**
 * SupervisorPortal — monthly attendance review and validation for assigned assistants.
 */
import { useCallback, useEffect, useState } from 'react'
import { saApi } from '../../api/saApi'
import type {
  AssistantAttendanceSummary, SupervisorAssistantsResponse, ValidationStatus,
} from '../../types/sa.types'

const SK_YELLOW = '#FFE000'
type TabKey = 'all' | 'pending' | 'approved' | 'rejected'

export default function SupervisorPortal() {
  const [data, setData] = useState<SupervisorAssistantsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<AssistantAttendanceSummary | null>(null)
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('APPROVED')
  const [validationComment, setValidationComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const now = new Date()
  const [month] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await saApi.getSupervisorAssistants(month, year)
      setData(res)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { load() }, [load])

  const filtered = (data?.assistants ?? []).filter(a => {
    const q = search.toLowerCase()
    const matchesSearch = !q || [a.assistant_name, a.assistant_email, a.shop_id, a.shop_area]
      .some(s => s.toLowerCase().includes(q))
    const matchesTab =
      tab === 'all' ? true :
      tab === 'pending' ? a.validation_status === 'PENDING' :
      tab === 'approved' ? a.validation_status === 'APPROVED' :
      a.validation_status === 'REJECTED'
    return matchesSearch && matchesTab
  })

  const counts = {
    all: data?.assistants.length ?? 0,
    pending: data?.assistants.filter(a => a.validation_status === 'PENDING').length ?? 0,
    approved: data?.assistants.filter(a => a.validation_status === 'APPROVED').length ?? 0,
    rejected: data?.assistants.filter(a => a.validation_status === 'REJECTED').length ?? 0,
  }

  const openModal = (a: AssistantAttendanceSummary) => {
    setSelected(a)
    setValidationStatus('APPROVED')
    setValidationComment('')
  }

  const submitValidation = async () => {
    if (!selected) return
    setBusy(true)
    try {
      await saApi.validateAssistant({
        assistant_id: selected.assistant_id,
        month, year,
        status: validationStatus,
        comment: validationComment,
      })
      setToast(`✅ ${selected.assistant_name} ${validationStatus.toLowerCase()}`)
      // Optimistic update
      setData(prev => prev ? {
        ...prev,
        assistants: prev.assistants.map(a =>
          a.assistant_id === selected.assistant_id
            ? { ...a, validation_status: validationStatus, validation_comment: validationComment }
            : a
        ),
      } : prev)
      setSelected(null)
      setTimeout(() => setToast(null), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading your team...</div>
  if (error) return <div style={{ padding: 20, color: '#b3261e' }}>{error}</div>

  return (
    <div data-testid="supervisor-portal" style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Supervisor Portal</div>
        <div style={{ fontSize: 13, color: '#666' }}>
          {new Date(year, month - 1).toLocaleString('en-NG', { month: 'long', year: 'numeric' })}
          {' · '}{data?.working_days} working days
        </div>
      </div>

      {/* Search */}
      <input
        data-testid="supervisor-search"
        type="text"
        placeholder="Search name, email, shop ID..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px',
          border: '1px solid #ddd', borderRadius: 8, fontSize: 13, marginBottom: 12 }}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid #f0f0f0' }}>
        {(['all', 'pending', 'approved', 'rejected'] as TabKey[]).map(t => (
          <button
            key={t}
            data-testid={`tab-${t}`}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontWeight: 700, fontSize: 13,
              borderBottom: tab === t ? `3px solid ${SK_YELLOW}` : '3px solid transparent',
              color: tab === t ? '#111' : '#666',
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: 30, textAlign: 'center', color: '#999', border: '1px dashed #ddd',
          borderRadius: 12 }}>
          No assistants in this category.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 12 }}>
          {filtered.map(a => (
            <AssistantCard key={a.assistant_id} assistant={a} onAction={() => openModal(a)} />
          ))}
        </div>
      )}

      {/* Validation modal */}
      {selected && (
        <div
          data-testid="validation-modal-overlay"
          onClick={e => e.target === e.currentTarget && setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
        >
          <div data-testid="validation-modal" style={{ background: '#fff', borderRadius: 14,
            padding: 24, width: '100%', maxWidth: 440, position: 'relative' }}>
            <button
              onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: 12, right: 14, background: 'none',
                border: 'none', fontSize: 22, cursor: 'pointer', color: '#555' }}
            >×</button>

            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
              Validate: {selected.assistant_name}
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
              {selected.shop_area} · {selected.checkins}/{selected.working_days} days
              · {selected.percentage} coverage
            </div>

            {/* Coverage bar */}
            <div style={{ background: '#f0f0f0', borderRadius: 999, height: 8, marginBottom: 16 }}>
              <div style={{
                height: '100%', borderRadius: 999,
                width: `${Math.min(100, parseInt(selected.percentage))}%`,
                background: selected.passed ? '#22c55e' : '#ef4444',
              }} />
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {(['APPROVED', 'REJECTED'] as ValidationStatus[]).map(s => (
                <button
                  key={s}
                  data-testid={`validation-btn-${s.toLowerCase()}`}
                  onClick={() => setValidationStatus(s)}
                  style={{
                    flex: 1, padding: '10px 0', border: 'none', borderRadius: 8,
                    fontWeight: 700, cursor: 'pointer',
                    background: validationStatus === s
                      ? (s === 'APPROVED' ? SK_YELLOW : '#b3261e')
                      : '#f3f3f3',
                    color: validationStatus === s && s === 'REJECTED' ? '#fff' : '#111',
                  }}
                >
                  {s === 'APPROVED' ? '✅ Approve' : '❌ Reject'}
                </button>
              ))}
            </div>

            <textarea
              data-testid="validation-comment"
              placeholder="Optional comment..."
              value={validationComment}
              onChange={e => setValidationComment(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8,
                border: '1px solid #ddd', minHeight: 70, resize: 'vertical', fontSize: 13 }}
            />

            <button
              data-testid="btn-submit-validation"
              onClick={submitValidation}
              disabled={busy}
              style={{ width: '100%', marginTop: 12, padding: '12px 0', background: SK_YELLOW,
                border: 'none', borderRadius: 8, fontWeight: 800, cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.6 : 1 }}
            >
              {busy ? 'Saving...' : 'Submit Validation'}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 20px', background: '#1f7a3f', color: '#fff', borderRadius: 10,
          fontWeight: 700, fontSize: 14, zIndex: 9999 }}>
          {toast}
        </div>
      )}
    </div>
  )
}

function AssistantCard({
  assistant, onAction,
}: {
  assistant: AssistantAttendanceSummary
  onAction: () => void
}) {
  const pct = parseInt(assistant.percentage)
  const statusColor =
    assistant.validation_status === 'APPROVED' ? '#22c55e' :
    assistant.validation_status === 'REJECTED' ? '#ef4444' : '#f59e0b'

  return (
    <div data-testid={`assistant-card-${assistant.assistant_id}`}
      style={{ background: '#fff', borderRadius: 12, padding: 16,
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>

      <div style={{ fontWeight: 800, fontSize: 15 }}>{assistant.assistant_name}</div>
      <div style={{ fontSize: 12, color: '#666' }}>{assistant.shop_area} · {assistant.assistant_id}</div>

      {/* Progress bar */}
      <div style={{ margin: '10px 0 4px', background: '#f0f0f0', borderRadius: 999, height: 6 }}>
        <div style={{
          height: '100%', borderRadius: 999,
          width: `${Math.min(100, pct)}%`,
          background: assistant.passed ? '#22c55e' : '#ef4444',
        }} />
      </div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
        {assistant.checkins}/{assistant.working_days} days · {assistant.percentage}
        {' · '}
        <span style={{ fontWeight: 700, color: assistant.passed ? '#0a8f48' : '#b3261e' }}>
          {assistant.passed ? 'PASS' : 'FAIL'}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 8px',
          borderRadius: 999, background: `${statusColor}20`, color: statusColor }}>
          {assistant.validation_status}
        </span>
        <button
          data-testid={`btn-validate-${assistant.assistant_id}`}
          onClick={onAction}
          style={{ padding: '6px 14px', background: SK_YELLOW, border: 'none',
            borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
        >
          Validate
        </button>
      </div>
    </div>
  )
}
