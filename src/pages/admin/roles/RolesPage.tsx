import { useState } from "react"
import { useAuth } from "@/context/auth-provider"
import { Plus, Search, ShieldAlert } from "lucide-react"
import RoleFormPanel from "./RoleFormPanel"
import RolePermissionsTable from "./RolePermissionsTable"

export default function RolesPage() {
  const { can } = useAuth()
  const [search, setSearch] = useState("")
  const [showNewRole, setShowNewRole] = useState(false)

  if (!can("admin_manage_roles")) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center gap-4">
        <ShieldAlert className="w-12 h-12 text-destructive" />
        <h2 className="text-foreground text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground text-sm">
          You don't have permission to manage roles.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure what each role can access across SmartProcess
          </p>
        </div>
        <button
          onClick={() => setShowNewRole(!showNewRole)}
          className="flex items-center gap-2 bg-sk-orange hover:bg-sk-orange-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          {showNewRole ? "Cancel" : "Create Role"}
        </button>
      </div>

      {/* Add Role Panel */}
      {showNewRole && <RoleFormPanel onClose={() => setShowNewRole(false)} />}

      {/* Search */}
      <div className="relative w-56">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search roles..."
          className="w-full bg-background border border-input rounded-lg pl-9 pr-3 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-sk-teal"
        />
      </div>

      {/* Permissions Matrix */}
      <RolePermissionsTable search={search} />
    </div>
  )
}
