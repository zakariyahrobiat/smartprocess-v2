import { useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-provider"
import type { RoleDefinition, Permission } from "@/lib/rbac"
import { ALL_PERMISSIONS } from "@/lib/rbac"

interface RoleFormPanelProps {
  onClose: () => void
}

export default function RoleFormPanel({ onClose }: RoleFormPanelProps) {
  const { addRole, allRoles } = useAuth()
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDesc, setNewRoleDesc] = useState("")

  const handleAddRole = () => {
    if (!newRoleName.trim()) return
    const id = newRoleName.toLowerCase().replace(/\s+/g, "-")
    if (allRoles.find((r) => r.id === id)) {
      toast.error("A role with that name already exists")
      return
    }
    const emptyPerms = Object.fromEntries(
      ALL_PERMISSIONS.map((p) => [p.key, false])
    ) as Record<Permission, boolean>

    const newRole: RoleDefinition = {
      id,
      name: newRoleName.trim(),
      description: newRoleDesc.trim(),
      permissions: emptyPerms,
      isSystem: false,
    }
    addRole(newRole)
    toast.success(`Role "${newRoleName}" created`)
    setNewRoleName("")
    setNewRoleDesc("")
    onClose()
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <p className="text-sm font-semibold text-foreground">New Role</p>
      <input
        placeholder="Role name"
        value={newRoleName}
        onChange={(e) => setNewRoleName(e.target.value)}
        className="bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-sk-teal"
      />
      <input
        placeholder="Description (optional)"
        value={newRoleDesc}
        onChange={(e) => setNewRoleDesc(e.target.value)}
        className="bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-sk-teal"
      />
      <div className="flex gap-2">
        <button
          onClick={handleAddRole}
          className="bg-sk-orange hover:bg-sk-orange-hover text-white text-sm px-4 py-2 rounded-lg transition"
        >
          Create Role
        </button>
        <button
          onClick={onClose}
          className="bg-muted text-muted-foreground text-sm px-4 py-2 rounded-lg transition hover:bg-muted/80"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
