import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-provider"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  subscribeToMyInvoices, subscribeToAllInvoices,
  type Invoice, 
} from "@/lib/imsService"
import AnalyticsCards from "@/components/ims/analyticsCard"
import { useNavigate } from "react-router"
import Filter from "@/components/ims/filter"
import RequestRow from "@/components/ims/requestRow"
import FormatAmount from "@/components/formatAmount"
import FormatDate from "@/components/formatDate"
import EmptyState from "../../components/ims/emptystate"


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
            className="gap-2 bg-sk-orange hover:bg-sk-orange-hover text-white"
          >
            <Plus className="size-4" /> Submit Invoice
          </Button>
        )}
      </div>

      <AnalyticsCards items={invoices} label="Total Invoices" />
      <Filter
        search={search}
        setSearch={setSearch}
        filterTab={filterTab}
        setFilterTab={setFilterTab}
        filterTabs={filterTabs}
        placeholder="Search by ID, vendor..."
      />

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
          <EmptyState
            title="No invoices found"
            description={
              can("ims_submit_invoice")
                ? "Submit your first invoice to get started."
                : "No invoices match your filters."
            }
          />
        ) : (
          filtered.map((inv) => (
            <RequestRow
              key={inv.id}
              title={inv.vendor}
              id={inv.requestId}
              meta={[
                inv.department,
                FormatAmount(inv.amount, inv.currency),
                inv.country,
                FormatDate(inv.createdAt).toLocaleDateString(),
              ]}
              status={inv.status}
              onClick={() => navigate(`/ims/invoices/${inv.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
