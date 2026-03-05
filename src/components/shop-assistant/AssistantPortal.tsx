/**
 * AssistantPortal — SA Check-In for enrolled field assistants.
 * Flows:
 *   NONE/REJECTED → Enrollment selfie capture → PENDING
 *   PENDING        → Waiting screen
 *   ENROLLED       → Face + GPS check-in → history
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage'
import { saApi } from '../../api/saApi'
import { useCamera } from '../../hooks/useCamera'
import { useGeolocation } from '../../hooks/useCamera'
import type {
  AssistantDashboard, CheckinHistoryItem,
  CheckinResponse, EnrollmentStatus,
} from '../../types/sa.types'

// ── Status colours (Sun King tokens) ─────────────────────────────────────────
const SK_YELLOW = '#FFE000'

type Phase = 'loading' | 'enroll-prompt' | 'enroll-camera' | 'enroll-preview' |
             'enroll-pending' | 'checkin-ready' | 'checkin-camera' |
             'checkin-preview' | 'checkin-result'

export default function AssistantPortal() {
  const [dashboard, setDashboard] = useState<AssistantDashboard | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null)
  const [checkinResult, setCheckinResult] = useState<CheckinResponse | null>(null)
  const [history, setHistory] = useState<CheckinHistoryItem[]>([])
  const [comment, setComment] = useState('')

  const camera = useCamera()
  const geo = useGeolocation()

  // ── Load dashboard ──────────────────────────────────────────────────────────
  useEffect(() => {
    saApi.getDashboard()
      .then(data => {
        setDashboard(data)
        const status = data.profile.enrollment_status
        if (status === 'ENROLLED') {
          setPhase('checkin-ready')
          loadHistory()
        } else if (status === 'PENDING') {
          setPhase('enroll-pending')
        } else {
          setPhase('enroll-prompt')  // NONE or REJECTED
        }
      })
      .catch(err => setError(err.message))
  }, [])

  const loadHistory = useCallback(async () => {
    try {
      const res = await saApi.getCheckinHistory()
      setHistory(res.items)
    } catch { /* non-critical */ }
  }, [])

  // ── Enrollment ─────────────────────────────────────────────────────────────
  const startEnrollCamera = async () => {
    setError(null)
    setPhase('enroll-camera')
    await camera.startCamera()
  }

  const captureEnrollSelfie = () => {
    const b64 = camera.captureBase64()
    if (!b64) { setError('Could not capture image. Try again.'); return }
    setCapturedBase64(b64)
    camera.stopCamera()
    setPhase('enroll-preview')
  }

  const retakeEnrollSelfie = async () => {
    setCapturedBase64(null)
    setPhase('enroll-camera')
    await camera.startCamera()
  }

  const submitEnrollment = async () => {
    if (!capturedBase64) return
    setBusy(true)
    setError(null)
    try {
      // 1. Upload to Firebase Storage
      const storage = getStorage()
      const assistantId = dashboard?.profile.assistant_id ?? 'unknown'
      const path = `enrollments/${assistantId}_${Date.now()}.jpg`
      const sRef = storageRef(storage, path)
      await uploadString(sRef, capturedBase64, 'base64', { contentType: 'image/jpeg' })
      const downloadUrl = await getDownloadURL(sRef)

      // 2. Tell backend
      const res = await saApi.submitEnrollment({
        face_image_base64: capturedBase64,
        firebase_storage_url: downloadUrl,
      })

      if (res.ok) {
        setPhase('enroll-pending')
      } else {
        setError(res.message)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // ── Check-in ───────────────────────────────────────────────────────────────
  const startCheckinCamera = async () => {
    setError(null)
    setCheckinResult(null)
    setCapturedBase64(null)
    setPhase('checkin-camera')
    await camera.startCamera()
  }

  const captureCheckinFace = () => {
    const b64 = camera.captureBase64()
    if (!b64) { setError('Could not capture image. Try again.'); return }
    setCapturedBase64(b64)
    camera.stopCamera()
    setPhase('checkin-preview')
  }

  const retakeCheckinFace = async () => {
    setCapturedBase64(null)
    setPhase('checkin-camera')
    await camera.startCamera()
  }

  const submitCheckin = async (isOverride = false) => {
    if (!capturedBase64 && !isOverride) return
    setBusy(true)
    setError(null)
    try {
      let result: CheckinResponse

      if (isOverride && dashboard) {
        result = await saApi.submitOverride({
          assistant_id: dashboard.profile.assistant_id,
          assistant_email: dashboard.profile.email,
          comment,
        })
      } else {
        const gps = await geo.getPosition()
        result = await saApi.submitCheckin({
          lat: gps.lat,
          lng: gps.lng,
          comment,
          face_image_base64: capturedBase64!,
        })
      }

      setCheckinResult(result)
      setPhase('checkin-result')
      if (result.success) loadHistory()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const backToReady = () => {
    setCapturedBase64(null)
    setCheckinResult(null)
    setComment('')
    setPhase('checkin-ready')
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return <Spinner label="Loading your profile..." />
  }

  if (error) {
    return <ErrorBanner message={error} />
  }

  return (
    <div data-testid="assistant-portal" style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
      {/* Profile header */}
      {dashboard && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f9f9f9',
          borderRadius: 12, borderLeft: `4px solid ${SK_YELLOW}` }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{dashboard.profile.assistant_name}</div>
          <div style={{ fontSize: 13, color: '#666' }}>
            {dashboard.profile.shop_area} · {dashboard.profile.assistant_id}
          </div>
          {phase === 'checkin-ready' && dashboard.checked_in_today && (
            <div style={{ marginTop: 6, fontSize: 13, color: '#0a8f48', fontWeight: 700 }}>
              ✅ Checked in today
            </div>
          )}
        </div>
      )}

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* ── ENROLLMENT PHASES ── */}

      {phase === 'enroll-prompt' && (
        <EnrollPrompt
          isRejected={dashboard?.profile.enrollment_status === 'REJECTED'}
          onStart={startEnrollCamera}
        />
      )}

      {phase === 'enroll-camera' && (
        <CameraView
          videoRef={camera.videoRef}
          canvasRef={camera.canvasRef}
          cameraError={camera.error}
          label="Position your face within the oval"
          onCapture={captureEnrollSelfie}
          onCancel={() => { camera.stopCamera(); setPhase('enroll-prompt') }}
        />
      )}

      {phase === 'enroll-preview' && capturedBase64 && (
        <SelfiePreview
          base64={capturedBase64}
          busy={busy}
          label="Does this selfie look clear?"
          onConfirm={submitEnrollment}
          onRetake={retakeEnrollSelfie}
        />
      )}

      {phase === 'enroll-pending' && <EnrollPending />}

      {/* ── CHECK-IN PHASES ── */}

      {phase === 'checkin-ready' && !dashboard?.checked_in_today && (
        <div>
          <button
            data-testid="btn-start-checkin"
            onClick={startCheckinCamera}
            style={{
              width: '100%', padding: '16px 0', borderRadius: 12, border: 'none',
              background: SK_YELLOW, fontWeight: 800, fontSize: 16, cursor: 'pointer',
            }}
          >
            📸 New Check-In
          </button>
          <CheckinHistory items={history} />
        </div>
      )}

      {phase === 'checkin-ready' && dashboard?.checked_in_today && (
        <div>
          <div style={{ padding: 20, textAlign: 'center', background: '#e8f5ee',
            borderRadius: 12, color: '#0a8f48', fontWeight: 700, fontSize: 16 }}>
            ✅ You have checked in today
          </div>
          <CheckinHistory items={history} />
        </div>
      )}

      {phase === 'checkin-camera' && (
        <CameraView
          videoRef={camera.videoRef}
          canvasRef={camera.canvasRef}
          cameraError={camera.error}
          label="Look straight at the camera"
          onCapture={captureCheckinFace}
          onCancel={() => { camera.stopCamera(); backToReady() }}
        />
      )}

      {phase === 'checkin-preview' && capturedBase64 && (
        <div>
          <SelfiePreview
            base64={capturedBase64}
            busy={busy}
            label="Confirm your face scan"
            confirmLabel="Check In Now"
            onConfirm={() => submitCheckin(false)}
            onRetake={retakeCheckinFace}
          />
          <textarea
            data-testid="checkin-comment"
            placeholder="Optional comment (e.g. visited customer)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', marginTop: 8, padding: 10,
              borderRadius: 8, border: '1px solid #ddd', resize: 'vertical', minHeight: 60 }}
          />
        </div>
      )}

      {phase === 'checkin-result' && checkinResult && (
        <CheckinResult
          result={checkinResult}
          onOverride={() => submitCheckin(true)}
          onBack={backToReady}
          busy={busy}
        />
      )}
    </div>
  )
}


// ── Sub-components ────────────────────────────────────────────────────────────

function EnrollPrompt({ isRejected, onStart }: { isRejected: boolean; onStart: () => void }) {
  return (
    <div data-testid="enroll-prompt" style={{ padding: 20, background: '#fff7e6',
      borderRadius: 12, border: '1px solid #f59e0b', textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>
        {isRejected ? 'Enrollment Rejected — Resubmit' : 'Face Enrollment Required'}
      </div>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
        {isRejected
          ? 'Your previous selfie was rejected by HR. Please take a new, clear photo.'
          : 'You need to enrol your face before checking in. HR will review and activate your profile.'}
      </div>
      <button
        data-testid="btn-start-enrollment"
        onClick={onStart}
        style={{ padding: '12px 24px', background: SK_YELLOW, border: 'none',
          borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
      >
        Start Face Enrollment
      </button>
    </div>
  )
}

function EnrollPending() {
  return (
    <div data-testid="enroll-pending" style={{ padding: 20, background: '#f0f4ff',
      borderRadius: 12, border: '1px solid #a5b4fc', textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
      <div style={{ fontWeight: 800, fontSize: 16 }}>Enrollment Pending HR Approval</div>
      <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
        Your selfie has been submitted. You will receive an email once HR activates your profile.
        Check-in will be available after approval.
      </div>
    </div>
  )
}

function CameraView({
  videoRef, canvasRef, cameraError, label, onCapture, onCancel,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  cameraError: string | null
  label: string
  onCapture: () => void
  onCancel: () => void
}) {
  return (
    <div data-testid="camera-view" style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <video
          ref={videoRef}
          data-testid="camera-video"
          autoPlay
          playsInline
          muted
          style={{ width: '100%', maxWidth: 400, borderRadius: 12 }}
        />
        {/* Face guide oval */}
        <div style={{
          position: 'absolute', top: '10%', left: '25%',
          width: '50%', height: '70%',
          border: `3px solid ${SK_YELLOW}`,
          borderRadius: '50%', pointerEvents: 'none',
        }} />
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {cameraError && <ErrorBanner message={cameraError} />}

      <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
        <button
          data-testid="btn-capture"
          onClick={onCapture}
          style={{ padding: '12px 24px', background: SK_YELLOW, border: 'none',
            borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
        >
          📸 Capture
        </button>
        <button
          data-testid="btn-cancel-camera"
          onClick={onCancel}
          style={{ padding: '12px 24px', background: '#f3f3f3', border: '1px solid #ddd',
            borderRadius: 8, cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function SelfiePreview({
  base64, busy, label, confirmLabel = 'Submit', onConfirm, onRetake,
}: {
  base64: string
  busy: boolean
  label: string
  confirmLabel?: string
  onConfirm: () => void
  onRetake: () => void
}) {
  return (
    <div data-testid="selfie-preview" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{label}</div>
      <img
        src={`data:image/jpeg;base64,${base64}`}
        alt="Captured selfie"
        style={{ width: '100%', maxWidth: 320, borderRadius: 12,
          border: `3px solid ${SK_YELLOW}`, marginBottom: 12 }}
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          data-testid="btn-confirm-selfie"
          onClick={onConfirm}
          disabled={busy}
          style={{ padding: '12px 24px', background: SK_YELLOW, border: 'none',
            borderRadius: 8, fontWeight: 800, cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.6 : 1 }}
        >
          {busy ? 'Processing...' : confirmLabel}
        </button>
        <button
          data-testid="btn-retake"
          onClick={onRetake}
          disabled={busy}
          style={{ padding: '12px 24px', background: '#f3f3f3', border: '1px solid #ddd',
            borderRadius: 8, cursor: 'pointer' }}
        >
          Retake
        </button>
      </div>
    </div>
  )
}

function CheckinResult({
  result, onOverride, onBack, busy,
}: {
  result: CheckinResponse
  onOverride: () => void
  onBack: () => void
  busy: boolean
}) {
  return (
    <div data-testid="checkin-result">
      <div style={{
        padding: 20, borderRadius: 12, textAlign: 'center',
        background: result.success ? '#e8f5ee' : '#fdecec',
        border: `1px solid ${result.success ? '#22c55e' : '#ef4444'}`,
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 32 }}>{result.success ? '✅' : '❌'}</div>
        <div style={{ fontWeight: 800, fontSize: 16, marginTop: 8 }}>{result.message}</div>
        {result.face_match_score !== null && (
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
            Face match: {result.face_match_score}%
          </div>
        )}
        {result.within_radius !== null && (
          <div style={{ fontSize: 13, color: '#666' }}>
            GPS: {result.within_radius ? '✅ Within range' : '⚠️ Out of range'}
          </div>
        )}
      </div>

      {result.can_request_override && (
        <div style={{ padding: 16, background: '#fff7e6', borderRadius: 12,
          border: '1px solid #f59e0b', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Request Supervisor Override</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
            Ask your supervisor to confirm your presence and approve this check-in.
          </div>
          <button
            data-testid="btn-request-override"
            onClick={onOverride}
            disabled={busy}
            style={{ padding: '10px 20px', background: '#1a56db', color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
          >
            {busy ? 'Processing...' : 'Request Override'}
          </button>
        </div>
      )}

      <button
        data-testid="btn-back-to-dashboard"
        onClick={onBack}
        style={{ width: '100%', padding: '12px 0', background: '#f3f3f3',
          border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer' }}
      >
        Back to Dashboard
      </button>
    </div>
  )
}

function CheckinHistory({ items }: { items: CheckinHistoryItem[] }) {
  if (!items.length) return null
  return (
    <div data-testid="checkin-history" style={{ marginTop: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>This Month</div>
      {items.map((item, i) => (
        <div key={i} style={{ padding: '10px 12px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span>{new Date(item.timestamp_iso).toLocaleDateString('en-NG', {
            weekday: 'short', day: 'numeric', month: 'short',
          })}</span>
          <span style={{ color: '#666' }}>
            {item.checkin_method === 'FACE+GPS' ? '🔒 Face + GPS'
              : item.checkin_method === 'SUPERVISOR_OVERRIDE' ? '👤 Override'
              : '📍 GPS'}
            {item.face_match_score ? ` · ${item.face_match_score}%` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

function Spinner({ label }: { label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
      <div>{label}</div>
    </div>
  )
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div data-testid="error-banner" style={{
      padding: '10px 14px', background: '#fdecec', borderRadius: 8,
      border: '1px solid #ef4444', marginBottom: 12, fontSize: 13,
      color: '#991b1b', display: 'flex', justifyContent: 'space-between',
    }}>
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: 'none', border: 'none',
          cursor: 'pointer', fontWeight: 700, color: '#991b1b' }}>×</button>
      )}
    </div>
  )
}
