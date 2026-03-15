// ─── IMS Type Definitions ─────────────────────────────────────────────
// 1:1 mapping from original Apps Script / Firestore schema

import type { Timestamp } from "firebase/firestore"

// ─── Config ──────────────────────────────────────────────────────────

export const IMS_COUNTRIES = [
  "Nigeria",
  "Sierra Leone",
  "Cameroon",
  "Togo",
  "Benin Republic",
  "South Africa",
] as const

export type IMSCountry = (typeof IMS_COUNTRIES)[number]

export const AMOUNT_THRESHOLDS: Record<IMSCountry, number> = {
  Nigeria: 20_000_000,
  "Sierra Leone": 250_000,
  Cameroon: 10_000_000,
  Togo: 10_000_000,
  "Benin Republic": 10_000_000,
  "South Africa": 250_000,
}

export const CURRENCY_BY_COUNTRY: Record<IMSCountry, string> = {
  Nigeria: "NGN",
  "Sierra Leone": "SLE",
  Cameroon: "XAF",
  Togo: "XOF",
  "Benin Republic": "XOF",
  "South Africa": "ZAR",
}

export const SENIOR_MANAGER_EMAIL = "ovie.itie@sunking.com"

// ─── Invoice ─────────────────────────────────────────────────────────

export type InvoiceStatus =
  | "Pending Line Manager Approval"
  | "Pending Finance Approval"
  | "Pending Manager Approval"
  | "Approved"
  | "Processing"
  | "Paid"
  | "Rejected"
  | "Resubmitted"

export interface InvoiceHistoryEntry {
  timestamp: Timestamp
  action: string
  userEmail: string
  comment?: string
}

export interface Invoice {
  id?: string                          // Firestore doc ID
  requestId: string                    // REQ-XXXXXXXX
  invoiceNumber: string
  submitterEmail: string
  lineManagerName: string              // comma-separated
  lineManagerEmail: string             // comma-separated
  department: string
  costCenter: string
  createdAt: Timestamp
  lastUpdated: Timestamp
  vendor: string
  amount: number
  currency: string
  poNumber?: string
  description: string
  attachmentLinks: string[]            // Firebase Storage URLs
  status: InvoiceStatus
  financeReviewer?: string
  rejectionReason?: string
  customMessage?: string               // stores approvalIndex as string (original schema)
  cc: string
  paymentAttachmentLink?: string
  country: IMSCountry
  approvalDate?: Timestamp
  approvalIndex: number                // current manager step (0-based)
  history: InvoiceHistoryEntry[]
}

// Form data for new invoice submission
export interface InvoiceFormData {
  invoiceNo: string
  vendor: string
  costCenter: string
  department: string
  amount: number
  currency: string
  poNumber?: string
  description: string
  location: IMSCountry
  managers: { name: string; email: string }[]
  ccEmails: string
  fileUrls: string[]
}

// ─── Refund ──────────────────────────────────────────────────────────

export type RefundStatus =
  | "Pending Receivable Approval"
  | "Pending Approval"
  | "Approved"
  | "Processing"
  | "Paid"
  | "Rejected"

export interface RefundHistoryEntry {
  timestamp: Timestamp
  action: string
  userEmail: string
  comment?: string
}

export interface Refund {
  id?: string; // Firestore doc ID
  referenceNumber: string;
  submitterEmail: string;
  submitterName: string;
  submissionDate: Timestamp;
  country: IMSCountry;
  customerName: string;
  accountNumber: string; // exactly 10 digits
  bankName: string;
  currency: string;
  amount: number;
  ccEmails: string;
  status: RefundStatus;
  approvalDate?: Timestamp;
  receivableApprovalDate?: Timestamp;
  reason: string;
  rejectionReason?: string;
  history?: RefundHistoryEntry[];
}

// Form data for new refund submission
export interface RefundFormData {
  referenceNumber: string
  country: IMSCountry
  customerName: string
  accountNumber: string
  bankName: string
  currency: string
  amount: number
  ccEmails: string
  reason: string
}

// ─── Analytics ───────────────────────────────────────────────────────

export interface IMSAnalyticsCard {
  label: string
  count: number
  amount: number
  status: InvoiceStatus | RefundStatus | "all"
  clickable: boolean
}

export interface IMSAnalytics {
  invoices: {
    total: number
    totalAmount: number
    pending: number
    approved: number
    processing: number
    paid: number
    rejected: number
    cards: IMSAnalyticsCard[]
  }
  refunds: {
    total: number
    totalAmount: number
    pendingReceivable: number
    pendingApproval: number
    approved: number
    paid: number
    rejected: number
    cards: IMSAnalyticsCard[]
  }
}

// ─── API Response ─────────────────────────────────────────────────────

export interface IMSApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  requestId?: string
}

// ─── Vendor / Cost Center ─────────────────────────────────────────────

export interface Vendor {
  code: string
  name: string
  displayName: string   // "{code}: {name}"
}

export interface CostCenter {
  code: string
  name: string
  displayName: string   // "{code}: {name}"
}

// ─── User (IMS extension) ─────────────────────────────────────────────

export interface IMSUser {
  userId: string
  email: string
  name: string
  avatarUrl: string
  role: string
  countries: IMSCountry[]
  hierarchyLevel?: "ABM" | "RBM" | "ZBM" | null
  createdAt: Timestamp
}
