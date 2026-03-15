/**
 * AssistantPortal — SA Check-In for enrolled field assistants.
 * Logic unchanged. Presentation: SK tokens + Tailwind.
 */
import { useCallback, useEffect, useState } from 'react'
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage'
import { saApi } from '../../api/saApi'
import { useCamera, useGeolocation } from '../../hooks/useCamera'
import type { AssistantDashboard, CheckinHistoryItem, CheckinResponse } from '../../types/sa.types'
import { cn } from '@/lib/utils'
import { Fingerprint, Camera, CheckCircle2, XCircle, Clock, MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

type Phase = 'loading' | 'enroll-prompt' | 'enroll-camera' | 'enroll-preview' |
             'enroll-pending' | 'checkin-ready' | 'checkin-camera' |
             'checkin-preview' | 'checkin-result'

export default function AssistantPortal() {
  const [dashboard, setDashboard] = useState<AssistantDashboard | null>(null)
  const [phase, setPhase]         = useState<Phase>('loading')
  const [error, setError]         = useState<string | null>(null)
  const [busy, setBusy]           = useState(false)
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null)
  const [checkinResult, setCheckinResult]   = useState<CheckinResponse | null>(null)
  const [history, setHistory] = useState<CheckinHistoryItem[]>([])
  const [comment, setComment] = useState('')

  const camera = useCamera()
  const geo    = useGeolocation()

  useEffect(() => {
    saApi.getDashboard()
      .then(data => {
        setDashboard(data)
        const status = data.profile.enrollment_status
        if (status === 'ENROLLED') { setPhase('checkin-ready'); loadHistory() }
        else if (status === 'PENDING') setPhase('enroll-pending')
        else setPhase('enroll-prompt')
      })
      .catch(err => setError(err.message))
  }, [])

  const loadHistory = useCallback(async () => {
    try { const res = await saApi.getCheckinHistory(); setHistory(res.items) } catch {}
  }, [])

  const startEnrollCamera = async () => { setError(null); setPhase('enroll-camera'); await camera.startCamera() }
  const captureEnrollSelfie = () => {
    const b64 = camera.captureBase64()
    if (!b64) { setError('Could not capture image. Try again.'); return }
    setCapturedBase64(b64); camera.stopCamera(); setPhase('enroll-preview')
  }
  const retakeEnrollSelfie = async () => { setCapturedBase64(null); setPhase('enroll-camera'); await camera.startCamera() }

  const submitEnrollment = async () => {
    if (!capturedBase64) return
    setBusy(true); setError(null)
    try {
      const storage    = getStorage()
      const assistantId = dashboard?.profile.assistant_id ?? 'unknown'
      const path       = `enrollments/${assistantId}_${Date.now()}.jpg`
      const sRef       = storageRef(storage, path)
      await uploadString(sRef, capturedBase64, 'base64', { contentType: 'image/jpeg' })
      const downloadUrl = await getDownloadURL(sRef)
      const res = await saApi.submitEnrollment({ face_image_base64: capturedBase64, firebase_storage_url: downloadUrl })
      if (res.ok) setPhase('enroll-pending')
      else setError(res.message)
    } catch (err: any) { setError(err.message) } finally { setBusy(false) }
  }

  const startCheckinCamera = async () => {
    setError(null); setCheckinResult(null); setCapturedBase64(null)
    setPhase('checkin-camera'); await camera.startCamera()
  }
  const captureCheckinFace = () => {
    const b64 = camera.captureBase64()
    if (!b64) { setError('Could not capture image. Try again.'); return }
    setCapturedBase64(b64); camera.stopCamera(); setPhase('checkin-preview')
  }
  const retakeCheckinFace = async () => { setCapturedBase64(null); setPhase('checkin-camera'); await camera.startCamera() }

  const submitCheckin = async (isOverride = false) => {
    if (!capturedBase64 && !isOverride) return
    setBusy(true); setError(null)
    try {
      let result: CheckinResponse
      if (isOverride && dashboard) {
        result = await saApi.submitOverride({ assistant_id: dashboard.profile.assistant_id, assistant_email: dashboard.profile.email, comment })
      } else {
        const gps = await geo.getPosition()
        result = await saApi.submitCheckin({ lat: gps.lat, lng: gps.lng, comment, face_image_base64: capturedBase64! })
      }
      setCheckinResult(result); setPhase('checkin-result')
      if (result.success) loadHistory()
    } catch (err: any) { setError(err.message) } finally { setBusy(false) }
  }

  const backToReady = () => { setCapturedBase64(null); setCheckinResult(null); setComment(''); setPhase('checkin-ready') }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (phase === 'loading') return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="size-8 text-sk-teal animate-spin" />
      <p className="text-sm text-muted-foreground">Loading your profile...</p>
    </div>
  )

  // ── API error (no VITE_API_BASE_URL) ────────────────────────────────────────
  if (error && !dashboard) return (
    <div className="max-w-md mx-auto p-6">
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 flex items-start gap-3">
        <AlertCircle className="size-5 text-destructive mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-foreground text-sm">SA Check-In API unavailable</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">Ensure <code className="bg-muted px-1 rounded">VITE_API_BASE_URL</code> is set to your Railway API URL.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Profile header */}
        {dashboard && (
          <div className="rounded-xl border border-sk-teal/30 bg-sk-teal/5 p-4 flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-sk-teal text-white font-bold text-lg shrink-0">
              {dashboard.profile.assistant_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">{dashboard.profile.assistant_name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {dashboard.profile.shop_area} · {dashboard.profile.assistant_id}
              </p>
              {phase === 'checkin-ready' && dashboard.checked_in_today && (
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="size-3.5 text-green-500" />
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                    Checked in today {dashboard.last_checkin_time ? `at ${dashboard.last_checkin_time}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-center gap-3">
            <AlertCircle className="size-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-destructive hover:text-destructive/70 font-bold">×</button>
          </div>
        )}

        {/* ── Enroll Prompt ─────────────────────────────────────────────────── */}
        {phase === 'enroll-prompt' && (
          <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-sk-orange/10 mx-auto">
              <Fingerprint className="size-7 text-sk-orange" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Face Enrollment Required</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Register your face to enable daily check-in. You will need your supervisor's approval before check-in is activated.
              </p>
            </div>
            {dashboard?.profile.enrollment_status === 'REJECTED' && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                Your previous enrollment was rejected. Please re-enroll.
              </div>
            )}
            <button onClick={startEnrollCamera}
              className="w-full flex items-center justify-center gap-2 bg-sk-orange hover:bg-sk-orange-hover text-white font-semibold py-3 rounded-lg transition-colors">
              <Camera className="size-4" /> Start Enrollment
            </button>
          </div>
        )}

        {/* ── Enroll Camera ─────────────────────────────────────────────────── */}
        {phase === 'enroll-camera' && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground text-center">Position your face in the oval</h2>
            <div className="relative inline-block w-full">
              <video ref={camera.videoRef} autoPlay playsInline muted
                className="w-full max-w-xs mx-auto block rounded-xl" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-52 border-[3px] border-sk-gold rounded-full opacity-80" />
              </div>
              <canvas ref={camera.canvasRef} className="hidden" />
            </div>
            <div className="flex gap-3">
              <button onClick={captureEnrollSelfie}
                className="flex-1 flex items-center justify-center gap-2 bg-sk-orange hover:bg-sk-orange-hover text-white font-semibold py-3 rounded-lg transition-colors">
                <Camera className="size-4" /> Capture
              </button>
              <button onClick={() => { camera.stopCamera(); setPhase('enroll-prompt') }}
                className="px-5 py-3 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Enroll Preview ────────────────────────────────────────────────── */}
        {phase === 'enroll-preview' && capturedBase64 && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground text-center">Confirm your enrollment photo</h2>
            <img src={`data:image/jpeg;base64,${capturedBase64}`} alt="Enrollment selfie"
              className="w-full max-w-xs mx-auto block rounded-xl border-2 border-sk-gold" />
            <div className="flex gap-3">
              <button onClick={submitEnrollment} disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 bg-sk-orange hover:bg-sk-orange-hover text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                {busy ? 'Submitting...' : 'Submit Enrollment'}
              </button>
              <button onClick={retakeEnrollSelfie} disabled={busy}
                className="px-5 py-3 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
                Retake
              </button>
            </div>
          </div>
        )}

        {/* ── Enroll Pending ────────────────────────────────────────────────── */}
        {phase === 'enroll-pending' && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center space-y-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/20 mx-auto">
              <Clock className="size-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Enrollment Pending Review</h2>
            <p className="text-sm text-muted-foreground">
              Your enrollment request has been submitted and is awaiting HR approval. You'll be notified once it's reviewed.
            </p>
          </div>
        )}

        {/* ── Check-In Ready ────────────────────────────────────────────────── */}
        {phase === 'checkin-ready' && (
          <>
            {!dashboard?.checked_in_today ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-sk-teal/10 mx-auto">
                  <Fingerprint className="size-8 text-sk-teal" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Ready to Check In</h2>
                  <p className="text-sm text-muted-foreground mt-1">Face match + GPS location required.</p>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Optional comment for today's check-in..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-sk-teal focus:outline-none mb-3"
                  />
                  <button onClick={startCheckinCamera}
                    className="w-full flex items-center justify-center gap-2 bg-sk-teal hover:bg-sk-teal-hover text-white font-semibold py-3 rounded-lg transition-colors">
                    <Camera className="size-4" /> Start Face Check-In
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center space-y-3">
                <CheckCircle2 className="size-12 text-green-500 mx-auto" />
                <h2 className="text-lg font-bold text-foreground">You're Checked In!</h2>
                <p className="text-sm text-muted-foreground">
                  Check-in recorded at {dashboard?.last_checkin_time ?? 'today'}. See you tomorrow.
                </p>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">This Month</h3>
                </div>
                <div className="divide-y divide-border/50">
                  {history.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(item.timestamp_iso).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.checkin_method === 'FACE+GPS' ? 'Face + GPS' : item.checkin_method === 'SUPERVISOR_OVERRIDE' ? 'Supervisor Override' : 'GPS'}
                        </p>
                      </div>
                      <div className="text-right">
                        {item.face_match_score && (
                          <span className="text-xs font-semibold text-sk-teal">{item.face_match_score}% match</span>
                        )}
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          {item.within_radius
                            ? <CheckCircle2 className="size-3.5 text-green-500" />
                            : <MapPin className="size-3.5 text-amber-500" />}
                          <span className="text-[10px] text-muted-foreground">{item.within_radius ? 'In range' : 'Out of range'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Check-In Camera ───────────────────────────────────────────────── */}
        {phase === 'checkin-camera' && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground text-center">Look straight at the camera</h2>
            <div className="relative w-full">
              <video ref={camera.videoRef} autoPlay playsInline muted className="w-full max-w-xs mx-auto block rounded-xl" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-52 border-[3px] border-sk-teal rounded-full opacity-80" />
              </div>
              <canvas ref={camera.canvasRef} className="hidden" />
            </div>
            <div className="flex gap-3">
              <button onClick={captureCheckinFace}
                className="flex-1 flex items-center justify-center gap-2 bg-sk-teal hover:bg-sk-teal-hover text-white font-semibold py-3 rounded-lg">
                <Camera className="size-4" /> Capture
              </button>
              <button onClick={() => { camera.stopCamera(); backToReady() }}
                className="px-5 py-3 rounded-lg border border-border text-muted-foreground hover:bg-muted">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Check-In Preview ──────────────────────────────────────────────── */}
        {phase === 'checkin-preview' && capturedBase64 && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground text-center">Confirm and submit</h2>
            <img src={`data:image/jpeg;base64,${capturedBase64}`} alt="Check-in selfie"
              className="w-full max-w-xs mx-auto block rounded-xl border-2 border-sk-teal" />
            <div className="flex gap-3">
              <button onClick={() => submitCheckin(false)} disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 bg-sk-teal hover:bg-sk-teal-hover text-white font-semibold py-3 rounded-lg disabled:opacity-60">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                {busy ? 'Submitting...' : 'Submit Check-In'}
              </button>
              <button onClick={retakeCheckinFace} disabled={busy}
                className="px-5 py-3 rounded-lg border border-border text-muted-foreground hover:bg-muted">
                Retake
              </button>
            </div>
          </div>
        )}

        {/* ── Check-In Result ───────────────────────────────────────────────── */}
        {phase === 'checkin-result' && checkinResult && (
          <div className="space-y-4">
            <div className={cn(
              "rounded-xl border p-6 text-center space-y-3",
              checkinResult.success
                ? "border-green-500/30 bg-green-500/10"
                : "border-destructive/30 bg-destructive/10"
            )}>
              {checkinResult.success
                ? <CheckCircle2 className="size-12 text-green-500 mx-auto" />
                : <XCircle className="size-12 text-destructive mx-auto" />}
              <h2 className="text-lg font-bold text-foreground">{checkinResult.message}</h2>
              <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                {checkinResult.face_match_score !== null && (
                  <span>Face match: <strong>{checkinResult.face_match_score}%</strong></span>
                )}
                {checkinResult.within_radius !== null && (
                  <span>GPS: <strong>{checkinResult.within_radius ? 'Within range' : 'Out of range'}</strong></span>
                )}
              </div>
            </div>

            {checkinResult.can_request_override && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
                <h3 className="text-sm font-bold text-foreground">Request Supervisor Override</h3>
                <p className="text-xs text-muted-foreground">
                  Ask your supervisor to confirm your presence and approve this check-in.
                </p>
                <button onClick={() => submitCheckin(true)} disabled={busy}
                  className="w-full flex items-center justify-center gap-2 bg-sk-navy text-white font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60 text-sm">
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                  Request Override
                </button>
              </div>
            )}

            <button onClick={backToReady}
              className="w-full py-3 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
