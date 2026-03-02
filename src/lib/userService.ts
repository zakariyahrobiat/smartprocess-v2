import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { type User } from "firebase/auth";

export type AppUser = {
  uid: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: string;
  permissions: Record<string, boolean>;
  hierarchyLevel: string | null;
  createdAt: unknown;
  lastLogin: unknown;
};

const DEFAULT_PERMISSIONS: Record<string, boolean> = {
  submit_requests: true,
  view_own_submissions: true,
  approve_reject_prospective_accounts: false,
  view_inverter_analytics: false,
  manage_unit_assignment: false,
  view_sales_tracking: false,
  access_admin_panel: false,
};

export async function syncUserToFirestore(firebaseUser: User): Promise<AppUser> {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    return userSnap.data() as AppUser;
  }

  const newUser: AppUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    name: firebaseUser.displayName ?? "Unknown",
    avatarUrl: firebaseUser.photoURL ?? "",
    role: "maker",
    permissions: DEFAULT_PERMISSIONS,
    hierarchyLevel: null,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  };

  await setDoc(userRef, newUser);
  return newUser;
}
