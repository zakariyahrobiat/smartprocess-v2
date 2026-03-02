// ─── RBAC Types & Permissions ────────────────────────────────────────

export type Permission =
  // Inverter Dashboard
  | "view_analytics"
  | "view_unit_assignment"
  | "manage_unit_assignment"
  | "view_payment_confirmation"
  | "manage_payment_confirmation"
  | "view_component_assignment"
  | "manage_component_assignment"
  | "view_sales_tracking"
  | "manage_sales_tracking"
  | "create_reset_keycodes_during_visits"
  // SmartProcess Core
  | "submit_requests"
  | "approve_requests"
  | "view_all_submissions"
  // IMS — Invoices
  | "ims_submit_invoice"
  | "ims_view_own_invoices"
  | "ims_approve_invoice_line_manager"
  | "ims_approve_invoice_finance"
  | "ims_approve_invoice_senior"
  | "ims_mark_invoice_paid"
  | "ims_view_all_invoices"
  | "ims_export_invoices"
  | "ims_view_invoice_analytics"
  // IMS — Refunds
  | "ims_submit_refund"
  | "ims_approve_refund_receivable"
  | "ims_approve_refund_final"
  | "ims_mark_refund_paid"
  | "ims_view_all_refunds"
  | "ims_view_refund_analytics"
  // Administration
  | "admin_manage_roles"
  | "admin_manage_users"
  | "admin_manage_projects"

export const ALL_PERMISSIONS: { key: Permission; label: string; category: string }[] = [
  { key: "view_analytics", label: "View analytics dashboard", category: "Inverter Dashboard" },
  { key: "view_unit_assignment", label: "View unit assignment", category: "Inverter Dashboard" },
  { key: "manage_unit_assignment", label: "Manage unit assignment", category: "Inverter Dashboard" },
  { key: "view_payment_confirmation", label: "View payment confirmation", category: "Inverter Dashboard" },
  { key: "manage_payment_confirmation", label: "Manage payment confirmation", category: "Inverter Dashboard" },
  { key: "view_component_assignment", label: "View component assignment", category: "Inverter Dashboard" },
  { key: "manage_component_assignment", label: "Manage component assignment", category: "Inverter Dashboard" },
  { key: "view_sales_tracking", label: "View sales tracking", category: "Inverter Dashboard" },
  { key: "manage_sales_tracking", label: "Manage sales tracking", category: "Inverter Dashboard" },
  { key: "create_reset_keycodes_during_visits", label: "Create/reset keycodes during visits", category: "Inverter Dashboard" },
  { key: "submit_requests", label: "Submit process requests", category: "SmartProcess" },
  { key: "approve_requests", label: "Approve / reject requests", category: "SmartProcess" },
  { key: "view_all_submissions", label: "View all submissions", category: "SmartProcess" },
  { key: "ims_submit_invoice", label: "Submit invoices", category: "IMS — Invoices" },
  { key: "ims_view_own_invoices", label: "View own invoices", category: "IMS — Invoices" },
  { key: "ims_approve_invoice_line_manager", label: "Approve as Line Manager", category: "IMS — Invoices" },
  { key: "ims_approve_invoice_finance", label: "Approve as Finance", category: "IMS — Invoices" },
  { key: "ims_approve_invoice_senior", label: "Approve as Senior Manager", category: "IMS — Invoices" },
  { key: "ims_mark_invoice_paid", label: "Mark invoice as paid", category: "IMS — Invoices" },
  { key: "ims_view_all_invoices", label: "View all invoices", category: "IMS — Invoices" },
  { key: "ims_export_invoices", label: "Export invoices (CSV)", category: "IMS — Invoices" },
  { key: "ims_view_invoice_analytics", label: "View invoice analytics", category: "IMS — Invoices" },
  { key: "ims_submit_refund", label: "Submit refunds", category: "IMS — Refunds" },
  { key: "ims_approve_refund_receivable", label: "Approve as Receivable", category: "IMS — Refunds" },
  { key: "ims_approve_refund_final", label: "Final refund approval", category: "IMS — Refunds" },
  { key: "ims_mark_refund_paid", label: "Mark refund as paid", category: "IMS — Refunds" },
  { key: "ims_view_all_refunds", label: "View all refunds", category: "IMS — Refunds" },
  { key: "ims_view_refund_analytics", label: "View refund analytics", category: "IMS — Refunds" },
  { key: "admin_manage_roles", label: "Manage roles (Admin)", category: "Administration" },
  { key: "admin_manage_users", label: "Manage users (Admin)", category: "Administration" },
  { key: "admin_manage_projects", label: "Manage projects (Admin)", category: "Administration" },
]

export interface RoleDefinition {
  id: string
  name: string
  description: string
  permissions: Record<Permission, boolean>
  isSystem?: boolean
}

export interface AppUser {
  id: string
  displayName: string
  email: string
  avatarUrl: string
  roleId: string
  countries?: string[]
  hierarchyLevel?: "ABM" | "RBM" | "ZBM" | null
  region?: string
  isActive: boolean
  lastLogin: Date
}

export interface ProjectConfig {
  id: string
  name: string
  icon: string
  description: string
  modules: { id: string; label: string; requiredPermission: Permission }[]
  allowedRoles: string[]
}

function emptyPermissions(): Record<Permission, boolean> {
  const p: Record<string, boolean> = {}
  for (const perm of ALL_PERMISSIONS) p[perm.key] = false
  return p as Record<Permission, boolean>
}

function withPermissions(...keys: Permission[]): Record<Permission, boolean> {
  const p = emptyPermissions()
  for (const k of keys) p[k] = true
  return p
}

export const mockRoles: RoleDefinition[] = [
  {
    id: "administrator",
    name: "Administrator",
    description: "Full access to all projects, modules, and admin features.",
    isSystem: true,
    permissions: Object.fromEntries(ALL_PERMISSIONS.map((p) => [p.key, true])) as Record<Permission, boolean>,
  },
  {
    id: "finance",
    name: "Finance",
    description: "IMS finance approvals, invoice processing, country-restricted.",
    permissions: withPermissions(
      "ims_submit_invoice", "ims_view_own_invoices", "ims_approve_invoice_finance",
      "ims_mark_invoice_paid", "ims_view_all_invoices", "ims_export_invoices",
      "ims_view_invoice_analytics", "ims_view_all_refunds", "ims_view_refund_analytics",
      "submit_requests", "view_all_submissions"
    ),
  },
  {
    id: "wh-admin-staff",
    name: "WH Admin Staff",
    description: "Inverter Dashboard: unit assignment, payments, components.",
    permissions: withPermissions(
      "view_unit_assignment", "manage_unit_assignment",
      "view_payment_confirmation", "manage_payment_confirmation",
      "view_component_assignment", "manage_component_assignment",
      "submit_requests", "ims_submit_invoice", "ims_view_own_invoices"
    ),
  },
  {
    id: "mgt-snr-mgt",
    name: "Mgt & Snr Mgt Staff",
    description: "Management: analytics, approvals, IMS senior approval.",
    permissions: withPermissions(
      "view_analytics", "view_all_submissions", "approve_requests",
      "view_unit_assignment", "view_payment_confirmation", "view_sales_tracking",
      "ims_approve_invoice_senior", "ims_view_all_invoices", "ims_view_invoice_analytics",
      "ims_approve_refund_final", "ims_view_all_refunds", "ims_view_refund_analytics"
    ),
  },
  {
    id: "refund-receivable",
    name: "Refund Receivable",
    description: "First-stage refund approvals, country-restricted.",
    permissions: withPermissions(
      "ims_submit_refund", "ims_approve_refund_receivable",
      "ims_view_all_refunds", "ims_view_refund_analytics", "submit_requests"
    ),
  },
  {
    id: "refund-approval",
    name: "Refund Approval",
    description: "Final refund approvals, country-restricted.",
    permissions: withPermissions(
      "ims_approve_refund_final", "ims_mark_refund_paid",
      "ims_view_all_refunds", "ims_view_refund_analytics"
    ),
  },
  {
    id: "field-team-abm",
    name: "Field Team (ABM)",
    description: "Area Business Manager: local sales, submit requests.",
    permissions: withPermissions(
      "view_sales_tracking", "submit_requests", "create_reset_keycodes_during_visits",
      "ims_submit_invoice", "ims_view_own_invoices"
    ),
  },
  {
    id: "field-team-rbm",
    name: "Field Team (RBM)",
    description: "Regional Business Manager: regional sales, line manager approvals.",
    permissions: withPermissions(
      "view_sales_tracking", "manage_sales_tracking", "submit_requests", "approve_requests",
      "ims_submit_invoice", "ims_view_own_invoices", "ims_approve_invoice_line_manager"
    ),
  },
  {
    id: "field-team-zbm",
    name: "Field Team (ZBM)",
    description: "Zonal Business Manager: zonal sales, approvals, analytics.",
    permissions: withPermissions(
      "view_sales_tracking", "manage_sales_tracking", "approve_requests", "view_analytics",
      "ims_approve_invoice_line_manager", "ims_view_all_invoices", "ims_view_invoice_analytics"
    ),
  },
  {
    id: "agent",
    name: "Agent",
    description: "Submit requests and invoice/refund submissions.",
    permissions: withPermissions(
      "submit_requests", "ims_submit_invoice", "ims_view_own_invoices", "ims_submit_refund"
    ),
  },
  {
    id: "field-support",
    name: "Field and Support Staff",
    description: "View-only access.",
    permissions: withPermissions(
      "view_unit_assignment", "view_payment_confirmation",
      "view_component_assignment", "ims_view_own_invoices"
    ),
  },
]

export const mockProjects: ProjectConfig[] = [
  {
    id: "inverter-dashboard",
    name: "Inverter Dashboard",
    icon: "zap",
    description: "Manage unit assignments, payments, components, and analytics.",
    modules: [
      { id: "unit-assignment", label: "Unit Assignment", requiredPermission: "view_unit_assignment" },
      { id: "payment-confirmation", label: "Payments", requiredPermission: "view_payment_confirmation" },
      { id: "components", label: "Components", requiredPermission: "view_component_assignment" },
      { id: "analytics", label: "Analytics", requiredPermission: "view_analytics" },
      { id: "sales-tracking", label: "Sales Tracking", requiredPermission: "view_sales_tracking" },
    ],
    allowedRoles: [
      "administrator", "wh-admin-staff", "mgt-snr-mgt",
      "field-team-abm", "field-team-rbm", "field-team-zbm", "field-support",
    ],
  },
  {
    id: "ims",
    name: "IMS",
    icon: "receipt",
    description: "Invoice Management System — invoices and refunds.",
    modules: [
      { id: "invoices", label: "Invoices", requiredPermission: "ims_view_own_invoices" },
      { id: "refunds", label: "Refunds", requiredPermission: "ims_submit_refund" },
    ],
    allowedRoles: [
      "administrator", "finance", "wh-admin-staff", "mgt-snr-mgt",
      "refund-receivable", "refund-approval",
      "field-team-abm", "field-team-rbm", "field-team-zbm", "agent", "field-support",
    ],
  },
]

export function getRoleById(roleId: string): RoleDefinition | undefined {
  return mockRoles.find((r) => r.id === roleId)
}

export function hasPermission(role: RoleDefinition | undefined, perm: Permission): boolean {
  if (!role) return false
  return role.permissions[perm] === true
}

export function getUserAccessibleProjects(user: AppUser): ProjectConfig[] {
  return mockProjects.filter((p) => p.allowedRoles.includes(user.roleId))
}

export function getPermissionCategories(): { category: string; permissions: typeof ALL_PERMISSIONS }[] {
  const map = new Map<string, typeof ALL_PERMISSIONS>()
  for (const p of ALL_PERMISSIONS) {
    if (!map.has(p.category)) map.set(p.category, [])
    map.get(p.category)!.push(p)
  }
  return Array.from(map.entries()).map(([category, permissions]) => ({ category, permissions }))
}
