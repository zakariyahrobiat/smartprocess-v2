import {
  collection, addDoc, getDocs, doc, updateDoc, query,
  where, orderBy, onSnapshot, serverTimestamp, getDoc,
  type Unsubscribe,
  FieldValue,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { RefundFormData } from "./imsTypes"

// ─── Types ────────────────────────────────────────────────────────────

export type InvoiceStatus =
  | "Pending Line Manager Approval"
  | "Pending Finance Approval"
  | "Pending Manager Approval"
  | "Approved"
  | "Processing"
  | "Paid"
  | "Rejected"
  | "Resubmitted"

export type RefundStatus =
  | "Pending Receivable Approval"
  | "Pending Approval"
  | "Approved"
  | "Processing"
  | "Paid"
  | "Rejected"

export const IMS_COUNTRIES = [
  "Nigeria", "Sierra Leone", "Cameroon",
  "Togo", "Benin Republic", "South Africa",
] as const
export type IMSCountry = (typeof IMS_COUNTRIES)[number]

export const IMS_CURRENCIES = [
  "NGN", "SLE", "XAF", "XOF", "ZAR", 'USD', 'EUR', 'GBP', 
] 

export const AMOUNT_THRESHOLDS: Record<IMSCountry, number> = {
  Nigeria: 20_000_000,
  "Sierra Leone": 250_000,
  Cameroon: 10_000_000,
  Togo: 10_000_000,
  "Benin Republic": 10_000_000,
  "South Africa": 250_000,
}

export const CURRENCY_BY_COUNTRY: Record<IMSCountry, string> = {
  Nigeria: "NGN", "Sierra Leone": "SLE", Cameroon: "XAF",
  Togo: "XOF", "Benin Republic": "XOF", "South Africa": "ZAR",
}

export const DEPARTMENTS = [
  "Finance", "Operations", "Optimization", "Commercial", "People & Culture",
  "Technology", "Supply Chain", "Legal", "Marketing", "Operation & Procurement",
]

export interface Manager { name: string; email: string }

export interface Invoice {
  id?: string
  requestId: string
  invoiceNumber: string
  submitterEmail: string
  submitterName: string
  lineManagerName: string
  lineManagerEmail: string
  department: string
  costCenter: string
  createdAt: unknown
  lastUpdated?: unknown
  vendor: string
  amount: number
  currency: string
  poNumber?: string
  description: string
  attachmentLinks: string[]
  status: InvoiceStatus
  financeReviewer?: string
  rejectionReason?: string
  approvalIndex: number
  cc: string
  paymentAttachmentLink?: string
  country: IMSCountry
  approvalDate?: unknown
  managers: Manager[]
}
export interface Refund {
  id?: string;
  referenceNumber: string;
  submitterEmail: string;
  submitterName: string;
  submissionDate: unknown;
  country: IMSCountry;
  customerName: string;
  accountNumber: string;
  bankName: string;
  currency: string;
  amount: number;
  ccEmails: string;
  status: RefundStatus;
  reason: string;
  rejectionReason?: string;
  approvalDate?: unknown;
  receivableApprovalDate?: unknown;
}

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
  managers: Manager[]
  ccEmails: string
  fileUrls: string[]
}

export interface Vendor { id?: string; code: string; name: string }
export interface CostCenter { id?: string; code: string; name: string }

// ─── Vendor / Cost Center ─────────────────────────────────────────────

export async function getVendors(): Promise<Vendor[]> {
  const snap = await getDocs(query(collection(db, "vendors"), orderBy("name")))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Vendor))
}

export async function getCostCenters(): Promise<CostCenter[]> {
  const snap = await getDocs(query(collection(db, "costCenters"), orderBy("name")))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CostCenter))
}

// ─── Invoice CRUD ─────────────────────────────────────────────────────

function generateRequestId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "REQ-"
  for (let i = 0; i < 8; i++) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}
export async function submitRefundToFirestore(
  data: RefundFormData,
  submitterEmail: string,
  submitterName: string,
): Promise<string> {
  // Duplicate reference check
  const q = query(
    collection(db, "refunds"),
    where("referenceNumber", "==", data.referenceNumber),
    where("country", "==", data.country),
  );
  const existing = await getDocs(q);
  if (!existing.empty)
    throw new Error("This Reference Number already exists for this country");

  const refund: Omit<Refund, "id"> = {
    referenceNumber: data.referenceNumber,
    submitterEmail,
    submitterName: data.customerName,
    customerName: data.customerName,
    submissionDate: Timestamp.now(),
    country: data.country,
    accountNumber: data.accountNumber,
    bankName: data.bankName,
    currency: data.currency,
    amount: data.amount,
    ccEmails: data.ccEmails,
    status: "Pending Receivable Approval",
    reason: data.reason,
  };
  const ref = await addDoc(collection(db, "refunds"), refund);
  return ref.id;
}

export async function getRefundById(id: string): Promise<Refund | null> {
  const ref = doc(db, "refunds", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as Refund;
}

export function subscribeToMyRefunds(
  email: string,
  cb: (r: Refund[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, "refunds"),
    where("submitterEmail", "==", email),
    orderBy("submissionDate", "desc"),
  );
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Refund)),
  );
}

export function subscribeToAllRefunds(cb: (r: Refund[]) => void): Unsubscribe {
  const q = query(collection(db, "refunds"), orderBy("submissionDate", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Refund)),
  );
}

export async function updateRefundStatus(
  id: string,
  updates: Partial<Refund>,
): Promise<void> {
  await updateDoc(doc(db, "refunds", id), { ...updates });
}



export async function submitInvoice(
  formData: InvoiceFormData,
  submitterEmail: string,
  submitterName: string
): Promise<string> {
  // Duplicate check
  const q = query(
    collection(db, "invoices"),
    where("invoiceNumber", "==", formData.invoiceNo),
    where("vendor", "==", formData.vendor),
    where("country", "==", formData.location)
  )
  const existing = await getDocs(q)
  if (!existing.empty) {
    throw new Error("This vendor has already submitted an invoice with this invoice number")
  }

  const isOpProc = formData.department === "Operation & Procurement"
  const initialStatus: InvoiceStatus = isOpProc
    ? "Pending Finance Approval"
    : "Pending Line Manager Approval"

  const invoice: Omit<Invoice, "id"> = {
    requestId: generateRequestId(),
    invoiceNumber: formData.invoiceNo,
    submitterEmail,
    submitterName,
    lineManagerName: formData.managers.map(m => m.name).join(", "),
    lineManagerEmail: formData.managers.map(m => m.email).join(", "),
    department: formData.department,
    costCenter: formData.costCenter,
    vendor: formData.vendor,
    amount: formData.amount,
    currency: formData.currency,
    poNumber: formData.poNumber ?? "",
    description: formData.description,
    attachmentLinks: formData.fileUrls,
    status: initialStatus,
    approvalIndex: 0,
    cc: formData.ccEmails,
    country: formData.location,
    managers: formData.managers,
    createdAt: serverTimestamp(),
  }

  const ref = await addDoc(collection(db, "invoices"), invoice)
  return ref.id
}

export async function getMyInvoices(email: string): Promise<Invoice[]> {
  const q = query(
    collection(db, "invoices"),
    where("submitterEmail", "==", email),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice))
}

export async function getAllInvoices(): Promise<Invoice[]> {
  const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice))
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const ref = doc(db, "invoices", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() } as Invoice;
}

export async function getPendingInvoicesForApprover(email: string): Promise<Invoice[]> {
  // Line manager pending
  const q1 = query(
    collection(db, "invoices"),
    where("status", "==", "Pending Line Manager Approval"),
    where("lineManagerEmail", ">=", email)
  )
  // Finance pending
  const q2 = query(
    collection(db, "invoices"),
    where("status", "==", "Pending Finance Approval")
  )
  const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)])
  const lm = s1.docs
    .map(d => ({ id: d.id, ...d.data() } as Invoice))
    .filter(inv => {
      const emails = inv.lineManagerEmail.split(",").map(e => e.trim().toLowerCase())
      return emails[inv.approvalIndex] === email.toLowerCase()
    })
  const fin = s2.docs.map(d => ({ id: d.id, ...d.data() } as Invoice))
  return [...lm, ...fin]
}

export function subscribeToMyInvoices(
  email: string,
  cb: (invoices: Invoice[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "invoices"),
    where("submitterEmail", "==", email),
    orderBy("createdAt", "desc")
  )
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice))))
}

export function subscribeToAllInvoices(cb: (invoices: Invoice[]) => void): Unsubscribe {
  const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice))))
}

export async function updateInvoiceStatus(
  invoiceId: string,
  updates: Partial<Invoice>
): Promise<void> {
  await updateDoc(doc(db, "invoices", invoiceId), {
    ...updates,
    lastUpdated: serverTimestamp(),
  })
}
