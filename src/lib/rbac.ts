// ─── RBAC Types & Data ──────────────────────────────────────────────────────

export type Permission =
  // ── Accounts ─────────────────────────────────────────────────────────────
  | "approve_reject_prospective_accounts"
  | "create_new_prospective_accounts"
  | "edit_prospective_accounts"
  | "register_new_account"
  // ── Field Operations ──────────────────────────────────────────────────────
  | "create_reset_keycodes_during_visits"
  // ── Inverter Dashboard ────────────────────────────────────────────────────
  | "view_analytics"
  | "view_unit_assignment"
  | "manage_unit_assignment"
  | "view_payment_confirmation"
  | "manage_payment_confirmation"
  | "view_component_assignment"
  | "manage_component_assignment"
  | "view_sales_tracking"
  | "manage_sales_tracking"
  // ── SmartProcess (Submissions) ────────────────────────────────────────────
  | "submit_requests"
  | "approve_requests"
  | "view_all_submissions"
  // ── Administration ────────────────────────────────────────────────────────
  | "admin_manage_roles"
  | "admin_manage_users"
  | "admin_manage_projects"
  // ── IMS — Invoices ────────────────────────────────────────────────────────
  | "ims_submit_invoice"
  | "ims_view_own_invoices"
  | "ims_view_all_invoices"
  | "ims_approve_invoice_line_manager"
  | "ims_approve_invoice_finance"
  | "ims_approve_invoice_senior"
  | "ims_mark_invoice_paid"
  // ── IMS — Refunds ─────────────────────────────────────────────────────────
  | "ims_submit_refund"
  | "ims_view_all_refunds"
  | "ims_approve_refund_receivable"
  | "ims_approve_refund_final"
  | "ims_mark_refund_paid"
  // ── Shop Assistant ────────────────────────────────────────────────────────
  | "sa:checkin"
  | "sa:enroll"
  | "sa:view_history"
  | "sa:supervisor"
  | "sa:override"
  | "sa:validate"
  | "sa:hr"
  | "sa:hr_decisions"

export const ALL_PERMISSIONS: { key: Permission; label: string; category: string }[] = [
  // Accounts
  { key: "approve_reject_prospective_accounts", label: "Approve and reject prospective accounts", category: "Accounts" },
  { key: "create_new_prospective_accounts", label: "Create new prospective accounts", category: "Accounts" },
  { key: "edit_prospective_accounts", label: "Edit prospective accounts", category: "Accounts" },
  { key: "register_new_account", label: "Register new account", category: "Accounts" },
  // Field Operations
  { key: "create_reset_keycodes_during_visits", label: "Create reset keycodes during visits", category: "Field Operations" },
  // Inverter Dashboard
  { key: "view_analytics", label: "View analytics dashboard", category: "Inverter Dashboard" },
  { key: "view_unit_assignment", label: "View unit assignment", category: "Inverter Dashboard" },
  { key: "manage_unit_assignment", label: "Manage unit assignment", category: "Inverter Dashboard" },
  { key: "view_payment_confirmation", label: "View payment confirmation", category: "Inverter Dashboard" },
  { key: "manage_payment_confirmation", label: "Manage payment confirmation", category: "Inverter Dashboard" },
  { key: "view_component_assignment", label: "View component assignment", category: "Inverter Dashboard" },
  { key: "manage_component_assignment", label: "Manage component assignment", category: "Inverter Dashboard" },
  { key: "view_sales_tracking", label: "View sales tracking", category: "Inverter Dashboard" },
  { key: "manage_sales_tracking", label: "Manage sales tracking", category: "Inverter Dashboard" },
  // SmartProcess
  { key: "submit_requests", label: "Submit process requests", category: "SmartProcess" },
  { key: "approve_requests", label: "Approve / reject requests", category: "SmartProcess" },
  { key: "view_all_submissions", label: "View all submissions", category: "SmartProcess" },
  // Administration
  { key: "admin_manage_roles", label: "Manage roles (Admin)", category: "Administration" },
  { key: "admin_manage_users", label: "Manage users (Admin)", category: "Administration" },
  { key: "admin_manage_projects", label: "Manage projects (Admin)", category: "Administration" },
  // IMS — Invoices
  { key: "ims_submit_invoice", label: "IMS — Submit invoice", category: "IMS" },
  { key: "ims_view_own_invoices", label: "IMS — View own invoices", category: "IMS" },
  { key: "ims_view_all_invoices", label: "IMS — View all invoices", category: "IMS" },
  { key: "ims_approve_invoice_line_manager", label: "IMS — Approve invoice (Line Manager)", category: "IMS" },
  { key: "ims_approve_invoice_finance", label: "IMS — Approve invoice (Finance)", category: "IMS" },
  { key: "ims_approve_invoice_senior", label: "IMS — Approve invoice (Senior Manager)", category: "IMS" },
  { key: "ims_mark_invoice_paid", label: "IMS — Mark invoice as paid", category: "IMS" },
  // IMS — Refunds
  { key: "ims_submit_refund", label: "IMS — Submit refund", category: "IMS" },
  { key: "ims_view_all_refunds", label: "IMS — View all refunds", category: "IMS" },
  { key: "ims_approve_refund_receivable", label: "IMS — Approve refund (Receivable)", category: "IMS" },
  { key: "ims_approve_refund_final", label: "IMS — Final approve refund", category: "IMS" },
  { key: "ims_mark_refund_paid", label: "IMS — Mark refund as paid", category: "IMS" },
  // Shop Assistant
  { key: "sa:checkin", label: "SA — Face + GPS check-in", category: "Shop Assistant" },
  { key: "sa:enroll", label: "SA — Submit face enrollment", category: "Shop Assistant" },
  { key: "sa:view_history", label: "SA — View check-in history", category: "Shop Assistant" },
  { key: "sa:supervisor", label: "SA — Team portal (Supervisor)", category: "Shop Assistant" },
  { key: "sa:override", label: "SA — Issue override check-ins", category: "Shop Assistant" },
  { key: "sa:validate", label: "SA — Monthly attendance validation", category: "Shop Assistant" },
  { key: "sa:hr", label: "SA — HR portal access", category: "Shop Assistant" },
  { key: "sa:hr_decisions", label: "SA — Approve enrollments + export", category: "Shop Assistant" },
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

// ─── Permission helpers ──────────────────────────────────────────────────────

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

// ─── Roles ───────────────────────────────────────────────────────────────────

export const mockRoles: RoleDefinition[] = [
  {
    id: "administrator",
    name: "Administrator",
    description: "Full access to all projects, modules, and admin features.",
    isSystem: true,
    permissions: Object.fromEntries(ALL_PERMISSIONS.map((p) => [p.key, true])) as Record<Permission, boolean>,
  },
  {
    id: "wh-admin-staff",
    name: "WH Admin Staff",
    description: "Inverter Dashboard + IMS access. No analytics.",
    permissions: withPermissions(
      "view_unit_assignment", "manage_unit_assignment",
      "view_payment_confirmation", "manage_payment_confirmation",
      "view_component_assignment", "manage_component_assignment",
      "submit_requests",
      "ims_submit_invoice", "ims_view_own_invoices",
      "ims_submit_refund"
    ),
  },
  {
    id: "mgt-snr-mgt",
    name: "Mgt & Snr Mgt Staff",
    description: "Management access: analytics, view all submissions, approve requests, IMS senior approval.",
    permissions: withPermissions(
      "view_analytics", "view_all_submissions", "approve_requests",
      "view_unit_assignment", "view_payment_confirmation", "view_sales_tracking",
      "ims_view_all_invoices", "ims_approve_invoice_senior",
      "ims_view_all_refunds", "ims_approve_refund_final",
      "ims_mark_invoice_paid", "ims_mark_refund_paid"
    ),
  },
  {
    id: "finance",
    name: "Finance",
    description: "Finance team: IMS invoice and refund approval, mark paid.",
    permissions: withPermissions(
      "view_all_submissions",
      "ims_view_all_invoices", "ims_approve_invoice_finance",
      "ims_view_all_refunds", "ims_approve_refund_receivable", "ims_approve_refund_final",
      "ims_mark_invoice_paid", "ims_mark_refund_paid",
      "submit_requests", "ims_submit_invoice", "ims_view_own_invoices",
      "ims_submit_refund"
    ),
  },
  {
    id: "field-team-abm",
    name: "Field Team (ABM)",
    description: "Area Business Manager: local sales tracking, submit requests.",
    permissions: withPermissions(
      "view_sales_tracking", "submit_requests",
      "create_new_prospective_accounts", "create_reset_keycodes_during_visits",
      "ims_submit_invoice", "ims_view_own_invoices",
      "ims_submit_refund",
      "ims_approve_invoice_line_manager"
    ),
  },
  {
    id: "field-team-rbm",
    name: "Field Team (RBM)",
    description: "Regional Business Manager: regional sales tracking, submit requests, line manager approval.",
    permissions: withPermissions(
      "view_sales_tracking", "manage_sales_tracking",
      "submit_requests", "approve_reject_prospective_accounts",
      "create_new_prospective_accounts",
      "ims_submit_invoice", "ims_view_own_invoices",
      "ims_submit_refund", "ims_approve_invoice_line_manager"
    ),
  },
  {
    id: "field-team-zbm",
    name: "Field Team (ZBM)",
    description: "Zonal Business Manager: zonal sales tracking, approvals.",
    permissions: withPermissions(
      "view_sales_tracking", "manage_sales_tracking",
      "approve_requests", "approve_reject_prospective_accounts",
      "create_new_prospective_accounts", "view_analytics",
      "ims_submit_invoice", "ims_view_own_invoices",
      "ims_submit_refund", "ims_approve_invoice_line_manager"
    ),
  },
  {
    id: "agent",
    name: "Agent",
    description: "Limited to submissions and basic account actions.",
    permissions: withPermissions(
      "submit_requests", "register_new_account", "create_new_prospective_accounts",
      "ims_submit_invoice", "ims_view_own_invoices", "ims_submit_refund"
    ),
  },
  {
    id: "field-support",
    name: "Field and Support Staff",
    description: "View-only access to processes and unit data.",
    permissions: withPermissions(
      "view_unit_assignment", "view_payment_confirmation", "view_component_assignment"
    ),
  },
  {
    id: "mobile-cash-store",
    name: "Mobile Cash SunKing Store",
    description: "Store-related flows and payment access.",
    permissions: withPermissions(
      "view_payment_confirmation", "manage_payment_confirmation",
      "submit_requests", "register_new_account",
      "ims_submit_refund", "ims_view_own_invoices"
    ),
  },
  {
    id: "collection-agent-ng",
    name: "Collection Agent - NG",
    description: "Region-specific collection access.",
    permissions: withPermissions(
      "view_payment_confirmation", "view_unit_assignment", "submit_requests"
    ),
  },
  {
    id: "high-risk-agent-ng",
    name: "High Risk Agent - Score - NG",
    description: "Restricted risk-based access.",
    permissions: withPermissions("view_unit_assignment", "submit_requests"),
  },
  {
    id: "marketing-agency",
    name: "Marketing Agency",
    description: "Marketing module access only.",
    permissions: withPermissions("view_analytics", "view_sales_tracking"),
  },

  // ── Shop Assistant roles ──────────────────────────────────────────────────

  {
    id: "sa-assistant",
    name: "SA — Shop Assistant",
    description: "Field assistant: face enrollment and daily GPS + face check-in.",
    permissions: withPermissions(
      "sa:checkin", "sa:enroll", "sa:view_history"
    ),
  },
  {
    id: "sa-supervisor",
    name: "SA — Supervisor",
    description: "Team supervisor: validate monthly attendance, issue overrides (max 3/month).",
    permissions: withPermissions(
      "sa:checkin", "sa:enroll", "sa:view_history",
      "sa:supervisor", "sa:override", "sa:validate"
    ),
  },
  {
    id: "sa-hr",
    name: "SA — HR",
    description: "HR portal: review face enrollments, monthly overview, mark decisions, export CSV.",
    permissions: withPermissions(
      "sa:hr", "sa:hr_decisions"
    ),
  },
]

// ─── Mock Projects ────────────────────────────────────────────────────────────

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
      "field-team-abm", "field-team-rbm", "field-team-zbm",
      "field-support", "collection-agent-ng", "marketing-agency",
    ],
  },
  {
    id: "ims",
    name: "IMS",
    icon: "receipt",
    description: "Invoice Management System — invoices and refunds across all countries.",
    modules: [
      { id: "invoices", label: "Invoices", requiredPermission: "ims_view_own_invoices" },
      { id: "refunds", label: "Refunds", requiredPermission: "ims_submit_refund" },
    ],
    allowedRoles: [
      "administrator", "wh-admin-staff", "mgt-snr-mgt", "finance",
      "field-team-abm", "field-team-rbm", "field-team-zbm",
      "agent", "mobile-cash-store",
    ],
  },
  {
    id: "shop-assistant",
    name: "Shop Assistant",
    icon: "fingerprint",
    description: "Face + GPS check-in system for field shop assistants.",
    modules: [
      { id: "sa-checkin", label: "My Check-In", requiredPermission: "sa:checkin" },
      { id: "sa-supervisor", label: "Team Attendance", requiredPermission: "sa:supervisor" },
      { id: "sa-hr", label: "HR Portal", requiredPermission: "sa:hr" },
    ],
    allowedRoles: ["administrator", "sa-assistant", "sa-supervisor", "sa-hr"],
  },
]

// ─── Helper Functions ─────────────────────────────────────────────────────────

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

export function getUserAccessibleModules(user: AppUser, projectId: string): ProjectConfig["modules"] {
  const project = mockProjects.find((p) => p.id === projectId)
  if (!project) return []
  const role = getRoleById(user.roleId)
  if (!role) return []
  return project.modules.filter((m) => hasPermission(role, m.requiredPermission))
}

export function getPermissionCategories(): { category: string; permissions: typeof ALL_PERMISSIONS }[] {
  const map = new Map<string, typeof ALL_PERMISSIONS>()
  for (const p of ALL_PERMISSIONS) {
    if (!map.has(p.category)) map.set(p.category, [])
    map.get(p.category)!.push(p)
  }
  return Array.from(map.entries()).map(([category, permissions]) => ({ category, permissions }))
}
