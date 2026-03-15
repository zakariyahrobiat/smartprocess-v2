
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { syncUserToFirestore } from "@/lib/userService"
import {
  type RoleDefinition,
  type Permission,
  type ProjectConfig,
  mockRoles,
  mockProjects,
  hasPermission,
} from "@/lib/rbac"

interface AppUser {
  uid: string
  id: string
  displayName: string
  email: string
  avatarUrl: string
  roleId: string
  role: string
  permissions: Record<string, boolean>
  hierarchyLevel: string | null
  isActive: boolean
  lastLogin: Date
}

interface AuthContextValue {
  currentUser: AppUser | null
  currentRole: RoleDefinition | null
  allRoles: RoleDefinition[]
  allProjects: ProjectConfig[]
  can: (perm: Permission) => boolean
  accessibleProjects: ProjectConfig[]
  accessibleModules: (projectId: string) => ProjectConfig["modules"]
  loading: boolean
  signIn: () => Promise<void>
  signOutUser: () => Promise<void>
  updateRolePermission: (roleId: string, perm: Permission, enabled: boolean) => void
  addRole: (role: RoleDefinition) => void
  deleteRole: (roleId: string) => void
  token: string | null
  }

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider />")
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [roles, setRoles] = useState<RoleDefinition[]>(() => [...mockRoles])
  const [loading, setLoading] = useState(true)
const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const firestoreUser = await syncUserToFirestore(firebaseUser)
        console.log("Firestore user data:", firestoreUser)
        const roleId = (firestoreUser.role ?? "agent").toLowerCase();
        setCurrentUser({
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          displayName: firestoreUser.name ?? firebaseUser.displayName ?? "User",
          email: firestoreUser.email ?? firebaseUser.email ?? "",
          avatarUrl: firestoreUser.avatarUrl ?? firebaseUser.photoURL ?? "",
          roleId,
          role: roleId,
          permissions: firestoreUser.permissions ?? {},
          hierarchyLevel: firestoreUser.hierarchyLevel ?? null,
          isActive: true,
          lastLogin: new Date(),
        })
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const currentRole = useMemo(
    () => roles.find((r) => r.id === currentUser?.roleId) ?? null,
    [roles, currentUser?.roleId]
  )

  const can = useCallback(
    (perm: Permission) => {
      const liveRole = roles.find((r) => r.id === currentUser?.roleId)
      return hasPermission(liveRole, perm)
    },
    [roles, currentUser?.roleId]
  )

  const accessibleProjects = useMemo(
    () => mockProjects.filter((p) => p.allowedRoles.includes(currentUser?.roleId ?? "")),
    [currentUser?.roleId]
  )

  const accessibleModules = useCallback(
    (projectId: string) => {
      const project = mockProjects.find((p) => p.id === projectId)
      if (!project) return []
      const role = roles.find((r) => r.id === currentUser?.roleId)
      if (!role) return []
      return project.modules.filter((m) => hasPermission(role, m.requiredPermission))
    },
    [roles, currentUser?.roleId]
  )

  const signIn = async () => {
    setLoading(true)
    try {
      const response = await signInWithPopup(auth, googleProvider)
      const token = await response.user.getIdToken()
      localStorage.setItem("token", token)
      setToken(token)
      console.log(currentUser?.roleId, "signed in with token:", token);
      

    } catch (error) {
      console.error("Sign in error:", error)
      setLoading(false)
    }
  }

  const signOutUser = async () => {
    await signOut(auth)
    setCurrentUser(null)
    setToken(null)
  }

  const updateRolePermission = useCallback(
    (roleId: string, perm: Permission, enabled: boolean) => {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === roleId ? { ...r, permissions: { ...r.permissions, [perm]: enabled } } : r
        )
      )
    },
    []
  )

  const addRole = useCallback((role: RoleDefinition) => {
    setRoles((prev) => [...prev, role])
  }, [])

  const deleteRole = useCallback((roleId: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== roleId))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      currentRole,
      allRoles: roles,
      allProjects: mockProjects,
      can,
      accessibleProjects,
      accessibleModules,
      loading,
      signIn,
      signOutUser,
      updateRolePermission,
      addRole,
      deleteRole, token
    }),
    [currentUser, currentRole, roles, can, accessibleProjects, accessibleModules, loading, token]
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
