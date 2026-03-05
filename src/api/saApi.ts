/**
 * SA Check-In API client.
 * All calls inject the Firebase ID token automatically.
 * Base URL from VITE_API_BASE_URL.
 */
import { getAuth } from 'firebase/auth'
import type {
  AssistantDashboard, CheckinHistoryItem, CheckinResponse,
  EnrollmentDecisionResponse, EnrollmentRequest,
  EnrollmentSubmitResponse, ExportResponse, HRDecisionRequest,
  HRDecisionResponse, HROverviewResponse, OverrideCountResponse,
  SupervisorAssistantsResponse, ValidationRequest,
} from '../types/sa.types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function authHeaders(): Promise<HeadersInit> {
  const user = getAuth().currentUser
  if (!user) throw new Error('Not authenticated')
  const token = await user.getIdToken()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function get<T>(path: string): Promise<T> {
  const resp = await fetch(`${BASE}${path}`, { headers: await authHeaders() })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }))
    throw new Error(err.detail ?? `Request failed: ${resp.status}`)
  }
  return resp.json()
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const resp = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }))
    throw new Error(err.detail ?? `Request failed: ${resp.status}`)
  }
  return resp.json()
}

// ── Assistant ─────────────────────────────────────────────────────────────────

export const saApi = {

  getDashboard: () =>
    get<AssistantDashboard>('/sa/dashboard'),

  getCheckinHistory: (month?: number, year?: number) => {
    const params = new URLSearchParams()
    if (month) params.set('month', String(month))
    if (year) params.set('year', String(year))
    const qs = params.toString() ? `?${params}` : ''
    return get<{ ok: boolean; month: number; year: number; items: CheckinHistoryItem[] }>(
      `/sa/checkins/history${qs}`
    )
  },

  submitCheckin: (payload: {
    lat: number
    lng: number
    comment?: string
    face_image_base64: string
  }) => post<CheckinResponse>('/sa/checkin', payload),

  submitEnrollment: (payload: {
    face_image_base64: string
    firebase_storage_url: string
  }) => post<EnrollmentSubmitResponse>('/sa/enroll', payload),

  // ── Supervisor ────────────────────────────────────────────────────────────

  getSupervisorAssistants: (month?: number, year?: number) => {
    const params = new URLSearchParams()
    if (month) params.set('month', String(month))
    if (year) params.set('year', String(year))
    const qs = params.toString() ? `?${params}` : ''
    return get<SupervisorAssistantsResponse>(`/sa/supervisor/assistants${qs}`)
  },

  validateAssistant: (payload: ValidationRequest) =>
    post<{ ok: boolean; message: string }>('/sa/supervisor/validate', payload),

  submitOverride: (payload: {
    assistant_id: string
    assistant_email: string
    comment?: string
  }) => post<CheckinResponse>('/sa/supervisor/override', payload),

  getOverrideCount: (assistantId: string) =>
    get<OverrideCountResponse>(`/sa/supervisor/override-count/${assistantId}`),

  // ── HR ────────────────────────────────────────────────────────────────────

  getEnrollmentRequests: () =>
    get<{ ok: boolean; items: EnrollmentRequest[] }>('/sa/hr/enrollment-requests'),

  approveEnrollment: (assistantId: string, comment?: string) =>
    post<EnrollmentDecisionResponse>(`/sa/hr/enrollment/${assistantId}/approve`, {
      assistant_id: assistantId,
      comment: comment ?? '',
    }),

  rejectEnrollment: (assistantId: string, comment?: string) =>
    post<EnrollmentDecisionResponse>(`/sa/hr/enrollment/${assistantId}/reject`, {
      assistant_id: assistantId,
      comment: comment ?? '',
    }),

  getHROverview: (month?: number, year?: number) => {
    const params = new URLSearchParams()
    if (month) params.set('month', String(month))
    if (year) params.set('year', String(year))
    const qs = params.toString() ? `?${params}` : ''
    return get<HROverviewResponse>(`/sa/hr/overview${qs}`)
  },

  submitHRDecision: (payload: HRDecisionRequest) =>
    post<{ ok: boolean; hr_status: string; message: string }>('/sa/hr/decision', payload),

  exportApproved: (month?: number, year?: number) => {
    const params = new URLSearchParams()
    if (month) params.set('month', String(month))
    if (year) params.set('year', String(year))
    const qs = params.toString() ? `?${params}` : ''
    return get<ExportResponse>(`/sa/hr/export${qs}`)
  },
}
