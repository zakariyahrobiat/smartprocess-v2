import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-provider"
import { ALL_PERMISSIONS, type RoleDefinition, type Permission } from "@/lib/rbac"

const ACTIVE_CATEGORIES = ["Inverter Dashboard", "SmartProcess", "Administration"]

interface RolePermissionsTableProps {
  search: string
}

export default function RolePermissionsTable({ search }: RolePermissionsTableProps) {
  const { allRoles, updateRolePermission, deleteRole } = useAuth()

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

  const handleDeleteRole = (role: RoleDefinition) => {
    if (role.isSystem) {
      toast.error("System roles cannot be deleted.")
      return
    }
    deleteRole(role.id)
    toast.success(`Role "${role.name}" deleted`)
  }

  return (
    <>
      {/* Stats line */}
      <p className="text-muted-foreground text-xs">
        {filteredRoles.length} roles · {filteredPermissions.length} permissions
      </p>

      {/* Matrix table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="sticky left-0 z-20 bg-muted/50 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-4 min-w-[220px] border-r border-border">
                  Permission
                </th>
                {filteredRoles.map((role) => (
                  <th key={role.id} className="text-center px-4 py-4 min-w-[110px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-foreground font-semibold text-xs leading-tight text-center">
                        {role.name}
                      </span>
                      {!role.isSystem ? (
                        <button
                          onClick={() => handleDeleteRole(role)}
                          className="text-muted-foreground hover:text-destructive transition p-0.5 rounded"
                          title="Delete role"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-sk-teal font-medium">system</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, catIdx) => (
                <>
                  {/* Category header */}
                  <tr key={`cat-${cat.category}`} className="bg-muted/30">
                    <td colSpan={filteredRoles.length + 1} className="sticky left-0 px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-[11px] font-bold text-sk-teal uppercase tracking-widest whitespace-nowrap">
                          {cat.category}
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    </td>
                  </tr>

                  {/* Permission rows */}
                  {cat.permissions.map((perm, permIdx) => {
                    const isLast =
                      permIdx === cat.permissions.length - 1 &&
                      catIdx === categories.length - 1
                    return (
                      <tr
                        key={perm.key}
                        className={`group transition-colors hover:bg-muted/30 ${
                          !isLast ? "border-b border-border/60" : ""
                        }`}
                      >
                        <td className="sticky left-0 z-10 bg-background group-hover:bg-muted/30 px-5 py-3.5 border-r border-border/60">
                          <span className="text-foreground text-sm">{perm.label}</span>
                        </td>
                        {filteredRoles.map((role) => {
                          const enabled = role.permissions[perm.key] === true
                          return (
                            <td key={role.id} className="px-4 py-3.5 text-center">
                              <button
                                onClick={() => handleToggle(role.id, perm.key, enabled)}
                                title={enabled ? "Disable" : "Enable"}
                                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sk-teal ${
                                  enabled ? "bg-sk-teal" : "bg-muted-foreground/30"
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
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-3 rounded-full bg-sk-teal" />
          <span>Enabled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-3 rounded-full bg-muted-foreground/30" />
          <span>Disabled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sk-teal font-medium">system</span>
          <span>= cannot be deleted</span>
        </div>
      </div>
    </>
  )
}
