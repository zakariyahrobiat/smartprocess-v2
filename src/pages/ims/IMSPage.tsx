import { useState } from "react"
import { useAuth } from "@/context/auth-provider"
import { ShieldAlert, Receipt, RefreshCw } from "lucide-react"
import InvoicesPage from "./InvoicesPage"
import RefundsPage from "./RefundsPage"

type IMSTab = "invoices" | "refunds"

export default function IMSPage() {
  const { can } = useAuth()
  const [activeTab, setActiveTab] = useState<IMSTab>("invoices")

  const canViewInvoices = can("ims_view_own_invoices") || can("ims_view_all_invoices")
  const canViewRefunds = can("ims_submit_refund") || can("ims_view_all_refunds")

  if (!canViewInvoices && !canViewRefunds) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center gap-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h2 className="text-white text-xl font-semibold">Access Denied</h2>
        <p className="text-gray-400 text-sm">You don't have permission to access IMS.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Invoice Management System</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage invoices and refunds across all countries
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {canViewInvoices && (
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "invoices"
                ? "border-green-500 text-green-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="w-4 h-4" />
            Invoices
          </button>
        )}
        {canViewRefunds && (
          <button
            onClick={() => setActiveTab("refunds")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "refunds"
                ? "border-green-500 text-green-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Refunds
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === "invoices" && <InvoicesPage />}
      {activeTab === "refunds" && <RefundsPage />}
    </div>
  )
}
