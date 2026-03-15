// Mock data and types for SmartProcess

export type ProcessStatus = "pending" | "approved" | "rejected" | "needs-info" | "draft"

export interface ProcessFlow {
  id: string
  title: string
  description: string
  icon: string
  category: string
  link: string
}

export interface Submission {
  id: string
  requestId: string
  processType: string
  title: string
  status: ProcessStatus
  submittedBy: string
  submittedAt: Date
  currentStep: number
  totalSteps: number
  description: string
  priority: string
  department: string
  amount?: number
  attachments?: string[]
}

export interface AuditEntry {
  id: string
  actor: string
  action: string
  timestamp: Date
  isSystem: boolean
  comment?: string
}

export const processFlows: ProcessFlow[] = [
  {
    id: "laptop",
    title: "Request New Laptop",
    description: "Submit a request for new computing hardware with specs and justification.",
    icon: "laptop",
    category: "IT",
    link: '/request/laptop'
  },
  {
    id: "travel",
    title: "Travel Reimbursement",
    description: "Claim reimbursement for business travel expenses with receipts.",
    icon: "plane",
    category: "Finance",
    link: '/request/travel'
  },
  {
    id: "leave",
    title: "Leave Request",
    description: "Apply for annual, sick, or personal leave with manager approval.",
    icon: "calendar",
    category: "HR",
    link: '/request/leave'
  },
  {
    id: "software",
    title: "Software License",
    description: "Request new software licenses or renewals for team tools.",
    icon: "box",
    category: "IT",
    link: '/request/software'
  },
  {
    id: "vendor",
    title: "Vendor Onboarding",
    description: "Initiate a new vendor registration with compliance checks.",
    icon: "users",
    category: "Procurement",
    link: '/request/vendor'
  },
  {
    id: "budget",
    title: "Budget Approval",
    description: "Submit budget proposals for departmental spending approval.",
    icon: "wallet",
    category: "Finance",
    link: '/request/budget'
  },
]

export const mockSubmissions: Submission[] = [
  {
    id: "1",
    requestId: "REQ-1024",
    processType: "laptop",
    title: "MacBook Pro 16-inch for Engineering",
    status: "pending",
    submittedBy: "Alice Johnson",
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    currentStep: 2,
    totalSteps: 4,
    description: "Need a high-performance MacBook Pro for machine learning development and Docker workloads.",
    priority: "High",
    department: "Engineering",
    amount: 3499,
    attachments: ["specs.pdf", "justification.docx"],
  },
  {
    id: "2",
    requestId: "REQ-1025",
    processType: "travel",
    title: "Client Meeting - Nairobi Trip",
    status: "approved",
    submittedBy: "Bob Smith",
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    currentStep: 4,
    totalSteps: 4,
    description: "Three-day trip to Nairobi for Q2 client engagement and partnership discussions.",
    priority: "Medium",
    department: "Sales",
    amount: 1250,
    attachments: ["itinerary.pdf", "receipts.zip"],
  },
  {
    id: "3",
    requestId: "REQ-1026",
    processType: "software",
    title: "Figma Team License Renewal",
    status: "needs-info",
    submittedBy: "Carol Davis",
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    currentStep: 1,
    totalSteps: 4,
    description: "Annual renewal of Figma team plan for the design department (12 seats).",
    priority: "Medium",
    department: "Design",
    amount: 1800,
  },
  {
    id: "4",
    requestId: "REQ-1027",
    processType: "leave",
    title: "Annual Leave - December",
    status: "rejected",
    submittedBy: "Dan Wilson",
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    currentStep: 2,
    totalSteps: 4,
    description: "Two weeks of annual leave for December holiday season.",
    priority: "Low",
    department: "Marketing",
  },
  {
    id: "5",
    requestId: "REQ-1028",
    processType: "budget",
    title: "Q3 Marketing Campaign Budget",
    status: "pending",
    submittedBy: "Eve Martinez",
    submittedAt: new Date(Date.now() - 45 * 60 * 1000),
    currentStep: 1,
    totalSteps: 4,
    description: "Budget allocation request for Q3 digital marketing campaigns across social media.",
    priority: "High",
    department: "Marketing",
    amount: 15000,
  },
]

export const mockAuditTrail: AuditEntry[] = [
  {
    id: "a1",
    actor: "Alice Johnson",
    action: "submitted this request",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isSystem: false,
  },
  {
    id: "a2",
    actor: "System",
    action: "Budget validated against department limits",
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    isSystem: true,
  },
  {
    id: "a3",
    actor: "System",
    action: "Routed to manager for approval",
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    isSystem: true,
  },
  {
    id: "a4",
    actor: "Mark Thompson",
    action: "reviewed and forwarded to finance",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isSystem: false,
    comment: "Approved from my end. Hardware specs look reasonable for the ML workload.",
  },
  {
    id: "a5",
    actor: "System",
    action: "Awaiting Finance Review",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isSystem: true,
  },
]

export const stepLabels = ["Draft", "Manager Review", "Finance Review", "Complete"]
