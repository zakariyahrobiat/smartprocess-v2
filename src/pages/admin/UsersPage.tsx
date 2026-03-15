
import { useState } from "react"
import { useAuth } from "@/context/auth-provider"
import { ShieldAlert, Search, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

export default function UsersPage() {
  const { can, allRoles, currentUser } = useAuth()
  const [search, setSearch] = useState("")

  // Mock users enriched with Firestore data placeholder
  const mockDisplayUsers = [
    { id: "u1", displayName: "Alice Johnson", email: "alice@sunking.com", roleId: "administrator", isActive: true, lastLogin: new Date(Date.now() - 15 * 60 * 1000), avatarUrl: "" },
    { id: "u2", displayName: "Bola Adeyemi", email: "bola@sunking.com", roleId: "wh-admin-staff", isActive: true, lastLogin: new Date(Date.now() - 2 * 3600 * 1000), avatarUrl: "" },
    { id: "u3", displayName: "Chinedu Okafor", email: "chinedu@sunking.com", roleId: "mgt-snr-mgt", isActive: true, lastLogin: new Date(Date.now() - 4 * 3600 * 1000), avatarUrl: "" },
    { id: "u4", displayName: "Damilola Ogunsanya", email: "damilola@sunking.com", roleId: "field-team-abm", isActive: true, lastLogin: new Date(Date.now() - 8 * 3600 * 1000), avatarUrl: "" },
    { id: "u5", displayName: "Emeka Nnamdi", email: "emeka@sunking.com", roleId: "field-team-rbm", isActive: true, lastLogin: new Date(Date.now() - 24 * 3600 * 1000), avatarUrl: "" },
    { id: "u6", displayName: "Fatima Bello", email: "fatima@sunking.com", roleId: "field-team-zbm", isActive: true, lastLogin: new Date(Date.now() - 48 * 3600 * 1000), avatarUrl: "" },
    { id: "u7", displayName: "Grace Ibe", email: "grace@sunking.com", roleId: "agent", isActive: true, lastLogin: new Date(Date.now() - 3 * 86400 * 1000), avatarUrl: "" },
    { id: "u8", displayName: "Hassan Yusuf", email: "hassan@sunking.com", roleId: "field-support", isActive: false, lastLogin: new Date(Date.now() - 14 * 86400 * 1000), avatarUrl: "" },
  ]

  const [users, setUsers] = useState(mockDisplayUsers)

  if (!can("admin_manage_users")) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center gap-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h2 className="text-white text-xl font-semibold">Access Denied</h2>
        <p className="text-gray-400 text-sm">You don't have permission to manage users.</p>
      </div>
    )
  }

  const filtered = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleRoleChange = (userId: string, newRoleId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, roleId: newRoleId } : u)))
    const roleName = allRoles.find((r) => r.id === newRoleId)?.name
    toast.success(`Role updated to ${roleName}`)
  }

  const handleToggleActive = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)))
    toast.success("User status updated")
  }

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">User Management</h1>
        <p className="text-gray-400 text-sm mt-1">
          {users.length} users · {users.filter((u) => u.isActive).length} active
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-background border border-input rounded-lg pl-9 pr-3 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-sk-teal"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-gray-400 font-medium px-4 py-3">User</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Role</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Last Login</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-t border-border/50 hover:bg-muted/30 transition">
                {/* User */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sk-teal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials(user.displayName)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.displayName}</p>
                      <p className="text-gray-500 text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                {/* Role dropdown */}
                <td className="px-4 py-3">
                  <select
                    value={user.roleId}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="bg-background border border-input rounded-lg px-2 py-1.5 text-foreground text-xs focus:outline-none focus:border-sk-teal cursor-pointer"
                  >
                    {allRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </td>
                {/* Last login */}
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {formatDistanceToNow(user.lastLogin, { addSuffix: true })}
                </td>
                {/* Status */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    user.isActive ? "bg-sk-teal/15 text-sk-teal" : "bg-muted text-muted-foreground"
                  }`}>
                    {user.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                {/* Actions */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleActive(user.id)}
                    className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1 rounded-lg transition"
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
