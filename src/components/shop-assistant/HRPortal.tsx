/**
 * HRPortal — two tabs:
 *   1. Enrollment Requests — review pending selfies, approve/reject
 *   2. Monthly Overview — attendance table, HR decisions, CSV export
 */
import { useCallback, useEffect, useState } from 'react'
import { saApi } from '../../api/saApi'
import type {
  EnrollmentRequest, HROverviewRow, HROverviewResponse,
  HRDecision, HRDecisionRequest,
} from '../../types/sa.types'

const SK_YELLOW = '#FFE000'
type HRTab = 'enrollment' | 'overview'

export default function HRPortal() {
  const [tab, setTab] = useState<HRTab>('enrollment')
  const [enrollments, setEnrollments] = useState<EnrollmentRequest[]>([])
  const [overview, setOverview] = useState<HROverviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentRequest | null>(null)
  const [enrollComment, setEnrollComment] = useState('')
  const [enrollBusy, setEnrollBusy] = useState(false)

  const [search, setSearch] = useState('')
  const [selectedRow, setSelectedRow] = useState<HROverviewRow | null>(null)
  const [hrDecision, setHRDecision] = useState<HRDecision>('VALIDATED')
  const [hrComment, setHRComment] = useState('')
  const [hrBusy, setHRBusy] = useState(false)
  const [exportBusy, setExportBusy] = useState(false)

  const now = new Date()
  const [month] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const loadEnrollments = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await saApi.getEnrollmentRequests()
      setEnrollments(res.items)
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  const loadOverview = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await saApi.getHROverview(month, year)
      setOverview(res)
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }, [month, year])

  useEffect(() => {
    if (tab === 'enrollment') loadEnrollments()
    else loadOverview()
  }, [tab, loadEnrollments, loadOverview])

  const pendingCount = enrollments.length

  const submitEnrollDecision = async (decision: 'approve' | 'reject') => {
    if (!selectedEnrollment) return
    setEnrollBusy(true)
    try {
      if (decision === 'approve') {
        await saApi.approveEnrollment(selectedEnrollment.assistant_id, enrollComment)
      } else {
        await saApi.rejectEnrollment(selectedEnrollment.assistant_id, enrollComment)
      }
      showToast(decision === 'approve'
        ? `✅ ${selectedEnrollment.assistant_name} approved`
        : `❌ ${selectedEnrollment.assistant_name} rejected`)
      setEnrollments(prev => prev.filter(e => e.assistant_id !== selectedEnrollment.assistant_id))
      setSelectedEnrollment(null)
      setEnrollComment('')
    } catch (err: any) { setError(err.message) }
    finally { setEnrollBusy(false) }
  }

  const submitHRDecision = async () => {
    if (!selectedRow) return
    setHRBusy(true)
    try {
      const payload: HRDecisionRequest = {
        assistant_id: selectedRow.assistant_id,
        month, year,
        assistant_email: selectedRow.assistant_email,
        decision: hrDecision,
        comment: hrComment,
      }
      await saApi.submitHRDecision(payload)
      showToast(`${hrDecision === 'VALIDATED' ? '✅' : '❌'} ${selectedRow.assistant_name} — ${hrDecision}`)
      setOverview(prev => prev ? {
        ...prev,
        rows: prev.rows.map(r =>
          r.assistant_id === selectedRow.assistant_id
            ? { ...r, hr_status: hrDecision, hr_comment: hrComment }
            : r
        ),
      } : prev)
      setSelectedRow(null)
      setHRComment('')
    } catch (err: any) { setError(err.message) }
    finally { setHRBusy(false) }
  }

  const handleExport = async () => {
    setExportBusy(true)
    try {
      const res = await saApi.exportApproved(month, year)
      const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', res.filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showToast(`✅ ${res.count} assistant(s) exported`)
    } catch (err: any) { setError(err.message) }
    finally { setExportBusy(false) }
  }

  const filteredRows = (overview?.rows ?? []).filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return [r.assistant_name, r.assistant_email, r.assistant_id, r.shop_area]
      .some(s => s.toLowerCase().includes(q))
  })

  return (
    <div data-testid="hr-portal" style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>HR Portal</div>
        <div style={{ fontSize: 13, color: '#666' }}>
          {new Date(year, month - 1).toLocaleString('en-NG', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {error && (
        <div data-testid="hr-error" style={{ padding: '10px 14px', background: '#fdecec',
          borderRadius: 8, border: '1px solid #ef4444', marginBottom: 12, fontSize: 13, color: '#991b1b' }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #f0f0f0' }}>
        {([
          { key: 'enrollment', label: 'Enrollment Requests', badge: pendingCount },
          { key: 'overview', label: 'Monthly Overview', badge: 0 },
        ] as const).map(t => (
          <button
            key={t.key}
            data-testid={`tab-${t.key}`}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
              borderBottom: tab === t.key ? `3px solid ${SK_YELLOW}` : '3px solid transparent',
              color: tab === t.key ? '#111' : '#666',
            }}
          >
            {t.label}
            {t.badge > 0 && (
              <span data-testid={`${t.key}-badge`} style={{
                background: '#ef4444', color: '#fff', borderRadius: 999,
                padding: '2px 7px', fontSize: 11, fontWeight: 800,
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {loading && <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading...</div>}

      {/* ── ENROLLMENT TAB ── */}
      {!loading && tab === 'enrollment' && (
        <div data-testid="enrollment-tab">
          {enrollments.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#999',
              border: '1px dashed #ddd', borderRadius: 12 }}>
              No pending enrollment requests.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 14 }}>
              {enrollments.map(e => (
                <EnrollmentCard
                  key={e.assistant_id}
                  enrollment={e}
                  onReview={() => { setSelectedEnrollment(e); setEnrollComment('') }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── OVERVIEW TAB ── */}
      {!loading && tab === 'overview' && overview && (
        <div data-testid="overview-tab">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <input
              data-testid="overview-search"
              type="text"
              placeholder="Search name, email, area..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: '9px 12px',
                border: '1px solid #ddd', borderRadius: 8, fontSize: 13 }}
            />
            <button
              data-testid="btn-export"
              onClick={handleExport}
              disabled={exportBusy}
              style={{ padding: '9px 18px', background: '#1a56db', color: '#fff',
                border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
                cursor: exportBusy ? 'not-allowed' : 'pointer', opacity: exportBusy ? 0.7 : 1 }}
            >
              {exportBusy ? 'Exporting...' : '⬇ Export Approved'}
            </button>
          </div>

          {/* Summary pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Total', value: overview.rows.length, color: '#1a56db' },
              { label: 'Validated', value: overview.rows.filter(r => r.hr_status === 'VALIDATED').length, color: '#22c55e' },
              { label: 'Ineligible', value: overview.rows.filter(r => r.hr_status === 'INELIGIBLE').length, color: '#ef4444' },
              { label: 'Pending Review', value: overview.rows.filter(r => r.hr_status === 'PENDING_REVIEW').length, color: '#f59e0b' },
            ].map(pill => (
              <div key={pill.label} style={{ padding: '6px 14px', borderRadius: 999,
                background: `${pill.color}15`, color: pill.color, fontWeight: 700, fontSize: 13 }}>
                {pill.label}: {pill.value}
              </div>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table data-testid="overview-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#1c3a22', color: '#fff' }}>
                  {['#', 'Name', 'Area', 'Attendance', 'Pass?', 'Supervisor', 'HR Status', 'Enrollment', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left',
                      fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, i) => (
                  <OverviewRow
                    key={row.assistant_id}
                    row={row}
                    index={i + 1}
                    onAction={() => { setSelectedRow(row); setHRDecision('VALIDATED'); setHRComment('') }}
                  />
                ))}
              </tbody>
            </table>
            {filteredRows.length === 0 && (
              <div style={{ padding: 30, textAlign: 'center', color: '#999' }}>
                No results{search ? ` for "${search}"` : ''}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ENROLLMENT REVIEW MODAL ── */}
      {selectedEnrollment && (
        <div data-testid="enrollment-modal-overlay"
          onClick={e => e.target === e.currentTarget && setSelectedEnrollment(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div data-testid="enrollment-modal" style={{ background: '#fff', borderRadius: 14,
            padding: 24, width: '100%', maxWidth: 400, position: 'relative' }}>
            <button onClick={() => setSelectedEnrollment(null)}
              style={{ position: 'absolute', top: 12, right: 14, background: 'none',
                border: 'none', fontSize: 22, cursor: 'pointer', color: '#555' }}>×</button>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Review Enrollment</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 14 }}>
              {selectedEnrollment.assistant_name} · {selectedEnrollment.email}
            </div>
            <img
              data-testid="enrollment-selfie"
              src={selectedEnrollment.photo_url}
              alt="enrollment selfie"
              style={{ width: '100%', borderRadius: 10, marginBottom: 14,
                border: `3px solid ${SK_YELLOW}`, objectFit: 'cover', maxHeight: 280 }}
            />
            <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>
              Submitted: {new Date(selectedEnrollment.request_date).toLocaleDateString('en-NG', {
                day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <textarea
              data-testid="enroll-decision-comment"
              placeholder="Optional comment (required for rejection)..."
              value={enrollComment}
              onChange={e => setEnrollComment(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8,
                border: '1px solid #ddd', minHeight: 60, resize: 'vertical',
                fontSize: 13, marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button data-testid="btn-approve-enrollment"
                onClick={() => submitEnrollDecision('approve')} disabled={enrollBusy}
                style={{ flex: 1, padding: '12px 0', background: SK_YELLOW, border: 'none',
                  borderRadius: 8, fontWeight: 800, cursor: 'pointer', opacity: enrollBusy ? 0.6 : 1 }}>
                {enrollBusy ? '...' : '✅ Approve'}
              </button>
              <button data-testid="btn-reject-enrollment"
                onClick={() => submitEnrollDecision('reject')} disabled={enrollBusy}
                style={{ flex: 1, padding: '12px 0', background: '#b3261e', color: '#fff',
                  border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer', opacity: enrollBusy ? 0.6 : 1 }}>
                {enrollBusy ? '...' : '❌ Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HR DECISION MODAL ── */}
      {selectedRow && (
        <div data-testid="hr-decision-modal-overlay"
          onClick={e => e.target === e.currentTarget && setSelectedRow(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div data-testid="hr-decision-modal" style={{ background: '#fff', borderRadius: 14,
            padding: 24, width: '100%', maxWidth: 420, position: 'relative' }}>
            <button onClick={() => setSelectedRow(null)}
              style={{ position: 'absolute', top: 12, right: 14, background: 'none',
                border: 'none', fontSize: 22, cursor: 'pointer', color: '#555' }}>×</button>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
              HR Decision: {selectedRow.assistant_name}
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
              {selectedRow.shop_area} · {selectedRow.checkins}/{selectedRow.working_days} days · {selectedRow.percentage}
            </div>
            <div style={{ background: '#f0f0f0', borderRadius: 999, height: 8, marginBottom: 6 }}>
              <div style={{ height: '100%', borderRadius: 999,
                width: `${Math.min(100, parseInt(selectedRow.percentage))}%`,
                background: selectedRow.passed ? '#22c55e' : '#ef4444' }} />
            </div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>
              Supervisor: {selectedRow.supervisor_status}
              {selectedRow.supervisor_comment ? ` — "${selectedRow.supervisor_comment}"` : ''}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {(['VALIDATED', 'INELIGIBLE'] as HRDecision[]).map(d => (
                <button key={d} data-testid={`hr-decision-btn-${d.toLowerCase()}`}
                  onClick={() => setHRDecision(d)}
                  style={{ flex: 1, padding: '10px 0', border: 'none', borderRadius: 8,
                    fontWeight: 700, cursor: 'pointer',
                    background: hrDecision === d ? (d === 'VALIDATED' ? SK_YELLOW : '#b3261e') : '#f3f3f3',
                    color: hrDecision === d && d === 'INELIGIBLE' ? '#fff' : '#111' }}>
                  {d === 'VALIDATED' ? '✅ Validate' : '❌ Ineligible'}
                </button>
              ))}
            </div>
            <textarea data-testid="hr-decision-comment"
              placeholder="Optional comment..." value={hrComment}
              onChange={e => setHRComment(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8,
                border: '1px solid #ddd', minHeight: 70, resize: 'vertical',
                fontSize: 13, marginBottom: 12 }} />
            <button data-testid="btn-submit-hr-decision"
              onClick={submitHRDecision} disabled={hrBusy}
              style={{ width: '100%', padding: '12px 0', background: SK_YELLOW, border: 'none',
                borderRadius: 8, fontWeight: 800, cursor: hrBusy ? 'not-allowed' : 'pointer',
                opacity: hrBusy ? 0.6 : 1 }}>
              {hrBusy ? 'Saving...' : 'Submit Decision'}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 20px', background: '#1f7a3f', color: '#fff', borderRadius: 10,
          fontWeight: 700, fontSize: 14, zIndex: 9999, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

function EnrollmentCard({ enrollment, onReview }: { enrollment: EnrollmentRequest; onReview: () => void }) {
  return (
    <div data-testid={`enrollment-card-${enrollment.assistant_id}`}
      style={{ background: '#fff', borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
      <img src={enrollment.photo_url} alt={`${enrollment.assistant_name} selfie`}
        style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
      <div style={{ padding: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 14 }}>{enrollment.assistant_name}</div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{enrollment.email}</div>
        <div style={{ fontSize: 11, color: '#999', marginBottom: 10 }}>
          {new Date(enrollment.request_date).toLocaleDateString('en-NG', {
            day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
        <button data-testid={`btn-review-${enrollment.assistant_id}`} onClick={onReview}
          style={{ width: '100%', padding: '8px 0', background: SK_YELLOW, border: 'none',
            borderRadius: 7, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
          Review
        </button>
      </div>
    </div>
  )
}

function OverviewRow({ row, index, onAction }: { row: HROverviewRow; index: number; onAction: () => void }) {
  const enrollColors: Record<string, string> = {
    ENROLLED: '#22c55e', PENDING: '#f59e0b', REJECTED: '#ef4444', NONE: '#9ca3af',
  }
  const hrColors: Record<string, string> = {
    VALIDATED: '#22c55e', INELIGIBLE: '#ef4444', PENDING_REVIEW: '#f59e0b',
  }
  return (
    <tr data-testid={`overview-row-${row.assistant_id}`}
      style={{ borderBottom: '1px solid #f0f0f0', background: index % 2 === 0 ? '#fafafa' : '#fff' }}>
      <td style={{ padding: '10px 12px', color: '#999' }}>{index}</td>
      <td style={{ padding: '10px 12px' }}>
        <div style={{ fontWeight: 700 }}>{row.assistant_name}</div>
        <div style={{ fontSize: 11, color: '#888' }}>{row.assistant_email}</div>
      </td>
      <td style={{ padding: '10px 12px', color: '#555' }}>{row.shop_area}</td>
      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
        {row.checkins}/{row.working_days} · {row.percentage}
      </td>
      <td style={{ padding: '10px 12px' }}>
        <span style={{ fontWeight: 700, color: row.passed ? '#22c55e' : '#ef4444' }}>
          {row.passed ? 'PASS' : 'FAIL'}
        </span>
      </td>
      <td style={{ padding: '10px 12px' }}>
        <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 999, fontWeight: 700,
          background: row.supervisor_status === 'APPROVED' ? '#e8f5ee' : '#fff7e6',
          color: row.supervisor_status === 'APPROVED' ? '#0a8f48' : '#b45309' }}>
          {row.supervisor_status}
        </span>
      </td>
      <td style={{ padding: '10px 12px' }}>
        <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 999, fontWeight: 700,
          background: `${hrColors[row.hr_status] ?? '#999'}20`,
          color: hrColors[row.hr_status] ?? '#999' }}>
          {row.hr_status.replace('_', ' ')}
        </span>
      </td>
      <td style={{ padding: '10px 12px' }}>
        <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 999, fontWeight: 700,
          background: `${enrollColors[row.enrollment_status] ?? '#999'}20`,
          color: enrollColors[row.enrollment_status] ?? '#999' }}>
          {row.enrollment_status}
        </span>
      </td>
      <td style={{ padding: '10px 12px' }}>
        <button data-testid={`btn-hr-action-${row.assistant_id}`} onClick={onAction}
          style={{ padding: '6px 12px', background: SK_YELLOW, border: 'none',
            borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Decide
        </button>
      </td>
    </tr>
  )
}
