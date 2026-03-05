// All SA Check-In TypeScript interfaces — single source of truth for frontend

export type EnrollmentStatus = 'NONE' | 'PENDING' | 'ENROLLED' | 'REJECTED'
export type CheckinMethod = 'FACE+GPS' | 'SUPERVISOR_OVERRIDE'
export type ValidationStatus = 'APPROVED' | 'REJECTED' | 'PENDING'
export type HRDecision = 'VALIDATED' | 'INELIGIBLE' | 'PENDING_REVIEW'

export interface AssistantProfile {
  assistant_id: string
  assistant_name: string
  email: string
  shop_id: string
  shop_area: string
  supervisor_email: string
  enrollment_status: EnrollmentStatus
  reference_photo_url: string | null
}

export interface AssistantDashboard {
  profile: AssistantProfile
  checked_in_today: boolean
  last_checkin_time: string | null
}

export interface CheckinHistoryItem {
  timestamp_iso: string
  assistant_id: string
  distance_m: string | number
  within_radius: boolean | string
  comment: string
  face_match_score: string | number
  checkin_method: string
}

export interface CheckinResponse {
  success: boolean
  within_radius: boolean | null
  face_match_score: number | null
  face_match_status: string | null
  checkin_method: CheckinMethod | null
  message: string
  can_request_override: boolean
  enrollment_required: boolean
  enrollment_status: EnrollmentStatus | null
}

export interface EnrollmentSubmitResponse {
  ok: boolean
  message: string
  status: EnrollmentStatus
}

export interface EnrollmentRequest {
  assistant_id: string
  assistant_name: string
  email: string
  photo_url: string
  request_date: string
}

export interface EnrollmentDecisionResponse {
  ok: boolean
  message: string
}

export interface AssistantAttendanceSummary {
  assistant_id: string
  assistant_name: string
  assistant_email: string
  shop_id: string
  shop_area: string
  checkins: number
  working_days: number
  percentage: string
  passed: boolean
  validation_status: ValidationStatus
  validation_comment: string
  validation_date: string | null
}

export interface SupervisorAssistantsResponse {
  month: number
  year: number
  working_days: number
  assistants: AssistantAttendanceSummary[]
}

export interface ValidationRequest {
  assistant_id: string
  month: number
  year: number
  status: ValidationStatus
  comment?: string
}

export interface OverrideCountResponse {
  assistant_id: string
  count: number
  remaining: number
  max_overrides: number
  month: number
  year: number
}

export interface HROverviewRow {
  assistant_id: string
  assistant_name: string
  assistant_email: string
  shop_id: string
  shop_area: string
  supervisor_email: string
  checkins: number
  working_days: number
  percentage: string
  passed: boolean
  supervisor_status: string
  supervisor_comment: string
  hr_status: HRDecision
  hr_comment: string
  enrollment_status: EnrollmentStatus
}

export interface HROverviewResponse {
  month: number
  year: number
  working_days: number
  rows: HROverviewRow[]
}

export interface HRDecisionRequest {
  assistant_id: string
  month: number
  year: number
  assistant_email: string
  decision: HRDecision
  comment?: string
}

export interface ExportResponse {
  ok: boolean
  count: number
  filename: string
  csv: string
  message: string
}

export interface HRDecisionResponse {
  success: boolean
  message: string
  recordId?: string
}

export interface HROverviewResponse {
  totalSAs: number
  presentToday: number
  absentToday: number
  overrideCount: number
  enrolledCount: number
  unenrolledCount: number
}

export interface OverrideCountResponse {
  count: number
  overrides: Array<{
    saId: string
    saName: string
    supervisorId: string
    reason: string
    timestamp: string
  }>
}

export interface HRDecisionResponse {
  success: boolean
  message: string
  recordId?: string
}

export interface HROverviewResponse {
  totalSAs: number
  presentToday: number
  absentToday: number
  overrideCount: number
  enrolledCount: number
  unenrolledCount: number
}

export interface OverrideCountResponse {
  count: number
  overrides: Array<{
    saId: string
    saName: string
    supervisorId: string
    reason: string
    timestamp: string
  }>
}
