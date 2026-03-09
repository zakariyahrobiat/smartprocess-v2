import { useAuth } from "@/context/auth-provider"
import type { Permission } from "@/lib/rbac"

function PermissionGuard({
  permission,
  children,
}: {
  permission: Permission
  children: React.ReactNode
}) {
  const { can } = useAuth()
  if (!can(permission)) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-muted-foreground">
        <div className="text-4xl">🔒</div>
        <p className="text-sm font-medium">You don't have access to this module.</p>
        <p className="text-xs">Contact your administrator to request access.</p>
      </div>
    )
  }
  return <>{children}</>
}
export default PermissionGuard