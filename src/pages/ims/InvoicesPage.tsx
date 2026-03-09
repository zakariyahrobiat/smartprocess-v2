import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-provider"
import { Plus, Search, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  subscribeToMyInvoices, subscribeToAllInvoices,
  type Invoice, 
} from "@/lib/imsService"
import AnalyticsCards from "@/components/invoice/analyticsCard"
import { useNavigate } from "react-router"
import InvoiceRow from "@/components/invoice/invoiceRow"


type FilterTab = "all" | "pending" | "approved" | "paid" | "rejected"
export default function InvoicesPage() {
  const navigate = useNavigate()
  const { currentUser, can } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterTab, setFilterTab] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")

  const canViewAll = can("ims_view_all_invoices")

  useEffect(() => {
    if (!currentUser) return
    const unsub = canViewAll
      ? subscribeToAllInvoices(data => { setInvoices(data); setIsLoading(false) })
      : subscribeToMyInvoices(currentUser.email, data => { setInvoices(data); setIsLoading(false) })
    return () => unsub()
  }, [currentUser, canViewAll])

  const filtered = invoices.filter(inv => {
    const matchTab =
      filterTab === "all" ? true :
      filterTab === "pending" ? inv.status.startsWith("Pending") :
      filterTab === "approved" ? (inv.status === "Approved" || inv.status === "Processing") :
      filterTab === "paid" ? inv.status === "Paid" :
      inv.status === "Rejected"
    const matchSearch = search.length < 2 ? true :
      inv.requestId.toLowerCase().includes(search.toLowerCase()) ||
      inv.vendor.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "paid", label: "Paid" },
    { id: "rejected", label: "Rejected" },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Invoices</h2>
          <p className="text-sm text-muted-foreground">
            {canViewAll
              ? "All invoices across countries"
              : "Your submitted invoices"}
          </p>
        </div>
        {can("ims_submit_invoice") && (
          <Button
            onClick={() => navigate("/ims/invoices/new")}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="size-4" /> Submit Invoice
          </Button>
        )}
      </div>

      <AnalyticsCards invoices={invoices} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 h-9 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="Search by ID, vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 border border-border rounded-lg p-1 bg-card">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                filterTab === tab.id
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-border bg-card animate-pulse"
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <FileText className="size-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">
              No invoices found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {can("ims_submit_invoice")
                ? "Submit your first invoice to get started."
                : "No invoices match your filters."}
            </p>
          </div>
        ) : (
          filtered.map((inv) => (
            <InvoiceRow
              key={inv.id}
              invoice={inv}
              onClick={() => navigate(`/ims/invoices/${inv.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
