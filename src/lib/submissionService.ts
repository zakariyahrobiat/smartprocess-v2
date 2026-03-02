import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

export type SubmissionStatus = "pending" | "approved" | "rejected" | "needs-info" | "draft"

export interface FirestoreSubmission {
  id?: string
  requestId: string
  processType: string
  title: string
  status: SubmissionStatus
  submittedBy: string
  submittedByUid: string
  submittedByEmail: string
  submittedAt: unknown
  updatedAt?: unknown
  currentStep: number
  totalSteps: number
  description: string
  priority: string
  department: string
  amount?: number
  justification?: string
  attachments?: string[]
  lastComment?: string
}

function generateRequestId(): string {
  const suffix = Date.now().toString().slice(-6)
  return `REQ-${suffix}`
}

export async function submitRequest(
  data: Omit<FirestoreSubmission, "id" | "requestId" | "submittedAt" | "currentStep" | "totalSteps" | "status">
): Promise<string> {
  const submission: Omit<FirestoreSubmission, "id"> = {
    ...data,
    requestId: generateRequestId(),
    status: "pending",
    currentStep: 1,
    totalSteps: 4,
    submittedAt: serverTimestamp(),
  }
  const ref = await addDoc(collection(db, "submissions"), submission)
  return ref.id
}

export async function getUserSubmissions(uid: string): Promise<FirestoreSubmission[]> {
  const q = query(
    collection(db, "submissions"),
    where("submittedByUid", "==", uid),
    orderBy("submittedAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreSubmission))
}

export async function getPendingSubmissions(): Promise<FirestoreSubmission[]> {
  const q = query(
    collection(db, "submissions"),
    where("status", "in", ["pending", "needs-info"]),
    orderBy("submittedAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreSubmission))
}

export async function getAllSubmissions(): Promise<FirestoreSubmission[]> {
  const q = query(
    collection(db, "submissions"),
    orderBy("submittedAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreSubmission))
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus,
  comment?: string
): Promise<void> {
  const ref = doc(db, "submissions", submissionId)
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
    ...(comment ? { lastComment: comment } : {}),
  })
}

// Real-time listener for a user's submissions
export function subscribeToUserSubmissions(
  uid: string,
  callback: (submissions: FirestoreSubmission[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "submissions"),
    where("submittedByUid", "==", uid),
    orderBy("submittedAt", "desc")
  )
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreSubmission))
    callback(data)
  })
}

// Real-time listener for pending submissions (checkers)
export function subscribeToPendingSubmissions(
  callback: (submissions: FirestoreSubmission[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "submissions"),
    where("status", "in", ["pending", "needs-info"]),
    orderBy("submittedAt", "desc")
  )
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreSubmission))
    callback(data)
  })
}
