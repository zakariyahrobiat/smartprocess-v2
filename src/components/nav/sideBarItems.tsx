import { ClipboardCheck, Clock, Fingerprint, LayoutDashboard, Receipt, Shield, ShieldCheck, UserCog, Users, Zap } from "lucide-react";

export const coreNavItems = [
  { id: "dashboard",       label: "Dashboard",       icon: LayoutDashboard, link: "/" },
  { id: "pending-actions", label: "Pending Actions", icon: ClipboardCheck,  link: "/pending" },
  { id: "history",         label: "History",         icon: Clock,           link: "/history" },
]

export const projectItems =  [
  { id: "inverter-dashboard", label: "Inverter Dashboard", link: "/inverter", icon: Zap },
  { id: "ims",                label: "IMS",    link: "/ims",            icon: Receipt, badge: "NEW" },
]

export const saItems = [
  { id: "sa-checkin", label: "My Check-In", icon: Fingerprint, permission: "sa:checkin", link: "/sa/checkin" },
  { id: "sa-supervisor", label: "Team Attendance", icon: Users, permission: "sa:supervisor", link: "/sa/supervisor" },
  { id: "sa-hr", label: "HR Portal", icon: ShieldCheck, permission: "sa:hr", link: "/sa/hr" },
]


export const adminItems = [
  { id: "admin-roles", label: "Roles & Permissions", icon: Shield, permission: "admin_manage_roles", link: "/admin/roles" },
  { id: "admin-users", label: "User Management", icon: UserCog, permission: "admin_manage_users", link: "/admin/users" },
]