
import { useState } from "react"
import { useAuth } from "@/context/auth-provider"
import { ALL_PERMISSIONS, type RoleDefinition, type Permission } from "@/lib/rbac"
import { Plus, Trash2, ShieldAlert, Search } from "lucide-react"
import { toast } from "sonner"

// Only the 3 relevant categories
const ACTIVE_CATEGORIES = ["Inverter Dashboard", "SmartProcess", "Administration"]

export default function RolesPage() {
  const { allRoles, updateRolePermission, addRole, deleteRole, can } = useAuth()
  const [search, setSearch] = useState("")
  const [showNewRole, setShowNewRole] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDesc, setNewRoleDesc] = useState("")

  if (!can("admin_manage_roles")) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center gap-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h2 className="text-white text-xl font-semibold">Access Denied</h2>
        <p className="text-gray-400 text-sm">You don't have permission to manage roles.</p>
      </div>
    )
  }

  const filteredPermissions = ALL_PERMISSIONS.filter((p) =>
    ACTIVE_CATEGORIES.includes(p.category)
  )

  const categories = ACTIVE_CATEGORIES.map((cat) => ({
    category: cat,
    permissions: filteredPermissions.filter((p) => p.category === cat),
  }))

  const filteredRoles = allRoles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = (roleId: string, perm: Permission, current: boolean) => {
    if (roleId === "administrator") {
      toast.error("Administrator role cannot be modified.")
      return
    }
    updateRolePermission(roleId, perm, !current)
    toast.success("Permission updated")
  }

  const handleAddRole = () => {
    if (!newRoleName.trim()) return
    const id = newRoleName.toLowerCase().replace(/\s+/g, "-")
    if (allRoles.find((r) => r.id === id)) {
      toast.error("A role with this name already exists.")
      return
    }
    const emptyPerms = Object.fromEntries(
      ALL_PERMISSIONS.map((p) => [p.key, false])
    ) as Record<Permission, boolean>
    addRole({ id, name: newRoleName.trim(), description: newRoleDesc.trim(), permissions: emptyPerms })
    toast.success(`Role "${newRoleName}" created`)
    setNewRoleName("")
    setNewRoleDesc("")
    setShowNewRole(false)
  }

  const handleDeleteRole = (role: RoleDefinition) => {
    if (role.isSystem) {
      toast.error("System roles cannot be deleted.")
      return
    }
    deleteRole(role.id)
    toast.success(`Role "${role.name}" deleted`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-gray-400 text-sm mt-1">
            Configure what each role can access across SmartProcess
          </p>
        </div>
        <button
          onClick={() => setShowNewRole(!showNewRole)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </div>

      {/* New Role Form */}
      {showNewRole && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-3">
          <h3 className="text-white font-semibold">New Role</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Role name (e.g. Finance Team)"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
            <input
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="Description (optional)"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddRole} className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition">
              Create
            </button>
            <button onClick={() => setShowNewRole(false)} className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search + Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles..."
            className="bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500 w-56"
          />
        </div>
        <span className="text-gray-500 text-xs">{filteredRoles.length} roles · {filteredPermissions.length} permissions</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-800">
                {/* Sticky permission label column */}
                <th className="sticky left-0 z-20 bg-gray-900 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-4 min-w-[220px] border-r border-gray-800">
                  Permission
                </th>
                {filteredRoles.map((role) => (
                  <th key={role.id} className="text-center px-4 py-4 min-w-[110px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-white font-semibold text-xs leading-tight text-center">
                        {role.name}
                      </span>
                      {!role.isSystem ? (
                        <button
                          onClick={() => handleDeleteRole(role)}
                          className="text-gray-600 hover:text-red-400 transition p-0.5 rounded"
                          title="Delete role"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-green-600 font-medium">system</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, catIdx) => (
                <>
                  {/* Category header row */}
                  <tr key={`cat-${cat.category}`} className="bg-gray-900/60">
                    <td
                      colSpan={filteredRoles.length + 1}
                      className="sticky left-0 px-5 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-gray-800" />
                        <span className="text-[11px] font-bold text-green-500 uppercase tracking-widest whitespace-nowrap">
                          {cat.category}
                        </span>
                        <div className="h-px flex-1 bg-gray-800" />
                      </div>
                    </td>
                  </tr>

                  {/* Permission rows */}
                  {cat.permissions.map((perm, permIdx) => {
                    const isLast = permIdx === cat.permissions.length - 1 && catIdx === categories.length - 1
                    return (
                      <tr
                        key={perm.key}
                        className={`group transition-colors hover:bg-gray-900/40 ${
                          !isLast ? "border-b border-gray-800/60" : ""
                        }`}
                      >
                        {/* Sticky label */}
                        <td className="sticky left-0 z-10 bg-background group-hover:bg-gray-900/40 px-5 py-3.5 border-r border-gray-800/60">
                          <span className="text-gray-300 text-sm">{perm.label}</span>
                        </td>

                        {/* Toggle cells */}
                        {filteredRoles.map((role) => {
                          const enabled = role.permissions[perm.key] === true
                          return (
                            <td key={role.id} className="px-4 py-3.5 text-center">
                              <button
                                onClick={() => handleToggle(role.id, perm.key, enabled)}
                                title={enabled ? "Disable" : "Enable"}
                                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                                  enabled ? "bg-cyan-500" : "bg-gray-700"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                                    enabled ? "translate-x-4" : "translate-x-0.5"
                                  }`}
                                />
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-3 rounded-full bg-cyan-500" />
          <span>Enabled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-3 rounded-full bg-gray-700" />
          <span>Disabled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-green-600 font-medium">system</span>
          <span>= cannot be deleted</span>
        </div>
      </div>
    </div>
  )
}
