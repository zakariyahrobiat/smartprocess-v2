import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-provider"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnalyticsCards from "@/components/ims/analyticsCard"
import { useNavigate } from "react-router-dom"
import Filter from "@/components/ims/filter"
import RequestRow from "@/components/ims/requestRow"
import FormatAmount from "@/components/formatAmount"
import FormatDate from "@/components/formatDate"
import EmptyState from "../../components/ims/emptystate"
import { getAnalytics } from "@/services/ims.service"
import type { Refund } from "@/lib/imsTypes"

type FilterTab = "all" | "pending" | "approved" | "paid" | "rejected"

export default function RefundsPage() {
  const { currentUser, can } = useAuth()
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterTab, setFilterTab] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")
  const [analytics, setAnalytics] = useState({
    total: 0,
    pending_receivable: 0,
    pending_approval: 0,
    approved: 0,
    processing: 0,
    paid: 0,
    rejected: 0
  })
  const canViewAll = can("ims_view_all_refunds")
const navigate = useNavigate()
  useEffect(() => {
    const fetchRefunds = async () => {
      const data = await getAnalytics()
      setAnalytics(data.refunds)
    }
    fetchRefunds()
    // if (!currentUser) return
    // const unsub = canViewAll
    //   ? subscribeToAllRefunds(data => { setRefunds(data); setIsLoading(false) })
    //   : subscribeToMyRefunds(currentUser.email, data => { setRefunds(data); setIsLoading(false) })
    // return () => unsub()
  }, [currentUser, canViewAll])

  const filtered = refunds.filter(r => {
    const matchTab =
      filterTab === "all" ? true :
      filterTab === "pending" ? r.status.startsWith("Pending") :
      filterTab === "approved" ? (r.status === "Approved" || r.status === "Processing") :
      filterTab === "paid" ? r.status === "Paid" :
      r.status === "Rejected"
    const matchSearch = search.length < 2 ? true :
      r.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })


  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" }, { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" }, { id: "paid", label: "Paid" },
    { id: "rejected", label: "Rejected" },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Refunds</h2>
          <p className="text-sm text-muted-foreground">
            {canViewAll
              ? "All refund requests across countries"
              : "Your submitted refund requests"}
          </p>
        </div>
        {can("ims_submit_refund") && (
          <Button
            onClick={() => navigate("/ims/refunds/new")}
            className="gap-2 bg-sk-teal hover:bg-sk-teal-hover text-white"
          >
            <Plus className="size-4" /> Submit Refund
          </Button>
        )}
      </div>

      <AnalyticsCards stats={analytics} label="TotalRefunds" />
      <Filter
        search={search}
        setSearch={setSearch}
        filterTab={filterTab}
        setFilterTab={setFilterTab}
        filterTabs={filterTabs}
        placeholder="Search by ID, vendor..."
      />

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
            title="No refunds found"
            description={
              can("ims_submit_refund")
                ? "Submit your first refund request."
                : "No refunds match your filters."
            }
          />
        ) : (
          filtered.map((r) => (
            <RequestRow
              title={r.customerName}
              id={r.referenceNumber}
              key={r.id}
              meta={[
                r.bankName,
                FormatAmount(r.amount, r.currency),
                r.country,
                FormatDate(r.submissionDate).toLocaleDateString(),
              ]}
              status={r.status}
              iconColor="text-sk-teal"
              iconBg="bg-sk-teal/10 border-sk-teal/30"
              onClick={() => navigate(`/ims/refunds/${r.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
