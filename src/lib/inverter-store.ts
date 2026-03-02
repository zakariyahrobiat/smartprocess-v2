// Mock data and types for the Inverter Dashboard project

export type ProspectStatus = "pending" | "assigned" | "paid" | "delivered"

export interface Prospect {
  reqId: string
  productName: string
  id: string
  name: string
  contact: string
  address: string
  area: string
  approvalDate: string
  unitNumber: string
  isAssigned: boolean
  paymentConfirmed: boolean
  rowIndex: number
}

export interface Payment {
  timestamp: string
  email: string
  prospectName: string
  phoneNumber: string
  unitNumber: string
  area: string
  paymentType: string
  amountPaid: string
  proofOfPayment: string
  paymentPlatform: string
  paymentConfirmed: boolean
  rowIndex: number
}

export interface ComponentSearch {
  prospectId: string
  name: string
  unit: string
  location: string
  productName: string
  rowId: number
  primaryUnitForBattery: string
}

export interface ComponentConfig {
  batteries: number
  inverters: number
  panels: number
}

export interface AssignmentLog {
  timestamp: string
  prospectId: string
  unitNumber: string
  assignedBy: string
  status: string
  customerName: string
}

export interface ReassignmentLog {
  timestamp: string
  oldId: string
  newId: string
  unit: string
  by: string
  reason: string
}

export interface AnalyticsSummary {
  totalPending: number
  totalUnpaid: number
  totalOverdue: number
  totalUnmatched: number
  totalPaidNotDelivered: number
}

export interface CategoryBreakdown {
  category: string
  count: number
  items: Prospect[]
}

// Product component matrix from the GAS codebase
export const PRODUCT_MATRIX: Record<string, ComponentConfig> = {
  "powerhub pro (5 kw): 5 kwh battery": { batteries: 1, inverters: 1, panels: 6 },
  "powerhub pro (5 kw): 10 kwh battery": { batteries: 2, inverters: 1, panels: 12 },
  "powerhub max (10 kw): 10 kwh battery": { batteries: 2, inverters: 2, panels: 12 },
  "powerhub max (10 kw): 20 kwh battery": { batteries: 4, inverters: 2, panels: 24 },
  "powerhub ultra (15 kw): 15 kwh battery": { batteries: 3, inverters: 3, panels: 18 },
  "powerhub ultra (15 kw): 30 kwh battery": { batteries: 6, inverters: 3, panels: 36 },
  "powerhub ultra (20 kw): 20 kwh battery": { batteries: 4, inverters: 4, panels: 24 },
  "powerhub ultra (20 kw): 40 kwh battery": { batteries: 8, inverters: 4, panels: 48 },
  "powerhub core (2 kw): 2.5 kwh battery": { batteries: 1, inverters: 1, panels: 4 },
  "powerhub plus (3.3 kw): 5 kwh battery": { batteries: 1, inverters: 1, panels: 4 },
  "powerplay pro": { batteries: 0, inverters: 1, panels: 1 },
  "powerfreeze pro": { batteries: 0, inverters: 1, panels: 2 },
}

export const DEFAULT_COMPONENT_CONFIG: ComponentConfig = { batteries: 1, inverters: 1, panels: 6 }

// Mock prospects data
export const mockProspects: Prospect[] = [
  {
    reqId: "REQ-4001",
    productName: "PowerHub Pro (5 kW): 5 kWh Battery, 2.7 kWp Solar",
    id: "PID-90123",
    name: "Adebayo Ogundimu",
    contact: "+234 812 345 6789",
    address: "12 Akinola St, Ikeja",
    area: "Lagos",
    approvalDate: "28/02/2026",
    unitNumber: "",
    isAssigned: false,
    paymentConfirmed: false,
    rowIndex: 2,
  },
  {
    reqId: "REQ-4002",
    productName: "PowerHub Max (10 kW): 10 kWh Battery, 5.4 kWp Solar",
    id: "PID-90124",
    name: "Chinwe Eze",
    contact: "+234 803 456 7890",
    address: "5 Nnamdi Azikiwe Rd, Enugu",
    area: "Enugu",
    approvalDate: "27/02/2026",
    unitNumber: "",
    isAssigned: false,
    paymentConfirmed: false,
    rowIndex: 3,
  },
  {
    reqId: "REQ-4003",
    productName: "PowerHub Ultra (15 kW): 15 kWh Battery",
    id: "PID-90125",
    name: "Ibrahim Musa",
    contact: "+234 705 678 9012",
    address: "78 Sultan Rd, Sokoto",
    area: "Sokoto",
    approvalDate: "25/02/2026",
    unitNumber: "",
    isAssigned: false,
    paymentConfirmed: false,
    rowIndex: 4,
  },
  {
    reqId: "REQ-4004",
    productName: "PowerHub Pro (5 kW): 5 kWh Battery",
    id: "PID-90126",
    name: "Funke Adeyemi",
    contact: "+234 816 789 0123",
    address: "34 Oyo Rd, Ibadan",
    area: "Ibadan",
    approvalDate: "24/02/2026",
    unitNumber: "SKU-7890",
    isAssigned: true,
    paymentConfirmed: false,
    rowIndex: 5,
  },
  {
    reqId: "REQ-4005",
    productName: "PowerHub Core (2 kW): 2.5 kWh Battery",
    id: "PID-90127",
    name: "Samuel Okoro",
    contact: "+234 809 890 1234",
    address: "15 Aba-Owerri Rd, Aba",
    area: "Aba",
    approvalDate: "23/02/2026",
    unitNumber: "SKU-7891",
    isAssigned: true,
    paymentConfirmed: true,
    rowIndex: 6,
  },
  {
    reqId: "REQ-4006",
    productName: "PowerHub Plus (3.3 kW): 5 kWh Battery, 2.7 kWp Solar",
    id: "PID-90128",
    name: "Grace Nwankwo",
    contact: "+234 813 901 2345",
    address: "22 Azikiwe Rd, Awka",
    area: "Awka",
    approvalDate: "22/02/2026",
    unitNumber: "",
    isAssigned: false,
    paymentConfirmed: false,
    rowIndex: 7,
  },
  {
    reqId: "REQ-4007",
    productName: "PowerPlay Pro + Lighting Kit",
    id: "PID-90129",
    name: "Yusuf Bello",
    contact: "+234 706 012 3456",
    address: "9 Maitama Close, Abuja",
    area: "Abuja",
    approvalDate: "21/02/2026",
    unitNumber: "",
    isAssigned: false,
    paymentConfirmed: false,
    rowIndex: 8,
  },
  {
    reqId: "REQ-4008",
    productName: "PowerHub Max (10 kW): 20 kWh Battery, 10.8 kWp Solar",
    id: "PID-90130",
    name: "Amina Danjuma",
    contact: "+234 802 123 4567",
    address: "45 Ahmadu Bello Way, Kaduna",
    area: "Kaduna",
    approvalDate: "20/02/2026",
    unitNumber: "SKU-7892",
    isAssigned: true,
    paymentConfirmed: false,
    rowIndex: 9,
  },
]

// Mock pending payments
export const mockPayments: Payment[] = [
  {
    timestamp: "28/02/2026 14:30",
    email: "funke.adeyemi@email.com",
    prospectName: "Funke Adeyemi",
    phoneNumber: "+234 816 789 0123",
    unitNumber: "SKU-7890",
    area: "Ibadan",
    paymentType: "Down Payment",
    amountPaid: "350,000",
    proofOfPayment: "receipt_funke.pdf",
    paymentPlatform: "Bank Transfer",
    paymentConfirmed: false,
    rowIndex: 2,
  },
  {
    timestamp: "27/02/2026 10:15",
    email: "amina.d@email.com",
    prospectName: "Amina Danjuma",
    phoneNumber: "+234 802 123 4567",
    unitNumber: "SKU-7892",
    area: "Kaduna",
    paymentType: "Full Payment",
    amountPaid: "2,500,000",
    proofOfPayment: "receipt_amina.pdf",
    paymentPlatform: "Mobile Money",
    paymentConfirmed: false,
    rowIndex: 3,
  },
  {
    timestamp: "25/02/2026 09:00",
    email: "samuel.okoro@email.com",
    prospectName: "Samuel Okoro",
    phoneNumber: "+234 809 890 1234",
    unitNumber: "SKU-7891",
    area: "Aba",
    paymentType: "Down Payment",
    amountPaid: "150,000",
    proofOfPayment: "receipt_samuel.pdf",
    paymentPlatform: "Bank Transfer",
    paymentConfirmed: true,
    rowIndex: 4,
  },
]

// Mock assignment logs
export const mockAssignmentLogs: AssignmentLog[] = [
  {
    timestamp: "28/02/2026 15:45",
    prospectId: "PID-90126",
    unitNumber: "SKU-7890",
    assignedBy: "ops@sunking.com",
    status: "Assigned via Web App",
    customerName: "Funke Adeyemi",
  },
  {
    timestamp: "27/02/2026 11:20",
    prospectId: "PID-90127",
    unitNumber: "SKU-7891",
    assignedBy: "ops@sunking.com",
    status: "Assigned via Web App",
    customerName: "Samuel Okoro",
  },
  {
    timestamp: "26/02/2026 08:30",
    prospectId: "PID-90130",
    unitNumber: "SKU-7892",
    assignedBy: "warehouse@sunking.com",
    status: "Assigned via Web App",
    customerName: "Amina Danjuma",
  },
]

// Mock analytics summary
export const mockAnalyticsSummary: AnalyticsSummary = {
  totalPending: 5,
  totalUnpaid: 2,
  totalOverdue: 1,
  totalUnmatched: 0,
  totalPaidNotDelivered: 1,
}

// Areas for filtering
export const areas = ["Lagos", "Enugu", "Sokoto", "Ibadan", "Aba", "Awka", "Abuja", "Kaduna"]

export function getProductComponentConfig(productName: string): ComponentConfig {
  if (!productName) return DEFAULT_COMPONENT_CONFIG
  const key = productName.toLowerCase().trim()
  for (const k of Object.keys(PRODUCT_MATRIX)) {
    if (key.includes(k) || k.includes(key)) return PRODUCT_MATRIX[k]
  }
  return DEFAULT_COMPONENT_CONFIG
}
