
import { useState } from "react"
import { mockPayments, type Payment } from "@/lib/inverter-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Search,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  FileText,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function PaymentConfirmationTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [payments, setPayments] = useState(mockPayments)
  const [approveDialog, setApproveDialog] = useState<Payment | null>(null)

  const filteredPayments = payments.filter((p) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      p.prospectName.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.phoneNumber.includes(term) ||
      p.unitNumber.toLowerCase().includes(term)
    )
  })

  const stats = {
    total: payments.length,
    pending: payments.filter((p) => !p.paymentConfirmed).length,
    approved: payments.filter((p) => p.paymentConfirmed).length,
  }

  const handleApprove = () => {
    if (!approveDialog) return
    setPayments((prev) =>
      prev.map((p) =>
        p.rowIndex === approveDialog.rowIndex
          ? { ...p, paymentConfirmed: true }
          : p
      )
    )
    toast.success(`Payment approved for ${approveDialog.prospectName}`, {
      description: `Unit ${approveDialog.unitNumber} - OPS checkbox updated`,
    })
    setApproveDialog(null)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-info/15">
              <CreditCard className="size-4 text-[#0369A1] dark:text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Payments</p>
              <p className="text-lg font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-warning/15">
              <FileText className="size-4 text-[#92400E] dark:text-warning" />
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
              <CheckCircle2 className="size-4 text-[#065F46] dark:text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-lg font-bold text-foreground">{stats.approved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or unit number..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" aria-label="Refresh" onClick={() => toast.info("Data refreshed.")}>
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* Payment Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Timestamp</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Unit #</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Area</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Platform</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Proof</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    <CheckCircle2 className="mx-auto size-8 text-success" />
                    <p className="mt-2 text-sm font-medium">No pending payments found.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.rowIndex} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{payment.timestamp}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs font-medium text-foreground">{payment.prospectName}</p>
                        <p className="text-[10px] text-muted-foreground">{payment.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{payment.unitNumber}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">{payment.area}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">
                      NGN {payment.amountPaid}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">{payment.paymentType}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{payment.paymentPlatform}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary">
                        <ExternalLink className="size-3" />
                        View
                      </Button>
                    </td>
                    <td className="px-4 py-3">
                      {payment.paymentConfirmed ? (
                        <Badge className="bg-success/15 text-[#065F46] dark:text-success border-success/30 text-[10px]">
                          Approved
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="h-7 gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => setApproveDialog(payment)}
                        >
                          <CheckCircle2 className="size-3" />
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={!!approveDialog} onOpenChange={() => setApproveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Payment Approval</DialogTitle>
            <DialogDescription>
              This will mark the payment as approved and tick the OPS checkbox for this unit.
            </DialogDescription>
          </DialogHeader>
          {approveDialog && (
            <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium text-foreground">{approveDialog.prospectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit Number</span>
                <span className="font-mono font-medium text-foreground">{approveDialog.unitNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium text-foreground">NGN {approveDialog.amountPaid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform</span>
                <span className="text-foreground">{approveDialog.paymentPlatform}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(null)}>Cancel</Button>
            <Button onClick={handleApprove} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
