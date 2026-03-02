
import { useState } from "react"
import {
  mockProspects,
  mockAssignmentLogs,
  areas,
  type Prospect,
} from "@/lib/inverter-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  RefreshCw,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 5

export function UnitAssignmentTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [areaFilter, setAreaFilter] = useState("all")
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [unitInput, setUnitInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set())

  const pendingProspects = mockProspects.filter((p) => {
    if (p.isAssigned || assignedIds.has(p.id)) return false
    if (areaFilter !== "all" && p.area.toLowerCase() !== areaFilter.toLowerCase()) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        p.name.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        p.contact.includes(term)
      )
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(pendingProspects.length / ITEMS_PER_PAGE))
  const paginatedProspects = pendingProspects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const stats = {
    total: mockProspects.length,
    pending: mockProspects.filter((p) => !p.isAssigned && !assignedIds.has(p.id)).length,
    assigned: mockProspects.filter((p) => p.isAssigned || assignedIds.has(p.id)).length,
  }

  const handleAssign = () => {
    if (!selectedProspect || !unitInput.trim()) {
      toast.error("Please enter a unit number.")
      return
    }
    toast.success(`Unit ${unitInput} assigned to ${selectedProspect.name}`, {
      description: `Prospect ID: ${selectedProspect.id}`,
    })
    setAssignedIds((prev) => new Set(prev).add(selectedProspect.id))
    setSelectedProspect(null)
    setUnitInput("")
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-info/15">
              <span className="text-sm font-bold text-[#0369A1] dark:text-info">{stats.total}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Requests</p>
              <p className="text-lg font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-warning/15">
              <span className="text-sm font-bold text-[#92400E] dark:text-warning">{stats.pending}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-foreground">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-success/15">
              <span className="text-sm font-bold text-[#065F46] dark:text-success">{stats.assigned}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assigned</p>
              <p className="text-lg font-bold text-foreground">{stats.assigned}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label className="text-foreground text-xs">Search Prospects</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or contact..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>
        <div className="w-full sm:w-44">
          <Label className="text-foreground text-xs">Area</Label>
          <Select
            value={areaFilter}
            onValueChange={(v) => {
              setAreaFilter(v)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {areas.map((a) => (
                <SelectItem key={a} value={a.toLowerCase()}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 self-end"
          aria-label="Refresh"
          onClick={() => toast.info("Data refreshed.")}
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* Split layout: Table + Assignment Panel */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Prospect Table */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                Pending Assignments
              </h3>
              <p className="text-xs text-muted-foreground">
                {pendingProspects.length} prospect(s) awaiting unit assignment
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Product</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Prospect ID</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Area</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProspects.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        <CheckCircle2 className="mx-auto size-8 text-success" />
                        <p className="mt-2 text-sm font-medium">No pending prospects</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedProspects.map((prospect) => (
                      <tr
                        key={prospect.id}
                        onClick={() => setSelectedProspect(prospect)}
                        className={cn(
                          "cursor-pointer border-b border-border transition-colors",
                          selectedProspect?.id === prospect.id
                            ? "bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <td className="px-4 py-3 text-xs text-foreground max-w-[200px] truncate">
                          {prospect.productName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-foreground">{prospect.id}</span>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-foreground">
                          {prospect.name}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px]">
                            {prospect.area}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                <p className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Assignment Panel */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Assign Unit Number</h3>
            {selectedProspect ? (
              <div className="space-y-4">
                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Prospect ID</dt>
                    <dd className="font-mono font-medium text-foreground">{selectedProspect.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="font-medium text-foreground">{selectedProspect.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Area</dt>
                    <dd className="text-foreground">{selectedProspect.area}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Product</dt>
                    <dd className="text-xs text-foreground max-w-[180px] text-right">{selectedProspect.productName}</dd>
                  </div>
                </dl>

                <div>
                  <Label className="text-foreground text-xs">
                    Enter Unit Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. SKU-1234"
                    maxLength={15}
                    value={unitInput}
                    onChange={(e) => setUnitInput(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAssign}
                    disabled={!unitInput.trim()}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Confirm Assignment
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedProspect(null)
                      setUnitInput("")
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
                <Search className="size-8" />
                <p className="mt-2 text-sm">Select a prospect from the list to proceed.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Log */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Recent Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Timestamp</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Prospect ID</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Unit #</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Assigned By</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Customer</th>
              </tr>
            </thead>
            <tbody>
              {mockAssignmentLogs.map((log, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{log.timestamp}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-foreground">{log.prospectId}</td>
                  <td className="px-4 py-2.5 font-mono text-xs font-medium text-foreground">{log.unitNumber}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{log.assignedBy}</td>
                  <td className="px-4 py-2.5">
                    <Badge className="bg-success/15 text-[#065F46] dark:text-success border-success/30 text-[10px]">
                      {log.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-foreground">{log.customerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
