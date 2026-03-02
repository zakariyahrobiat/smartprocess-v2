// IMS Refunds Page — scaffold ready for FastAPI integration
import { RefreshCw } from "lucide-react"

export default function RefundsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-cyan-900/30 border border-cyan-800 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-cyan-400" />
      </div>
      <h2 className="text-white text-xl font-semibold">Refunds</h2>
      <p className="text-gray-400 text-sm max-w-sm">
        Refund submissions, receivable approvals, and payment tracking.
        <br />
        <span className="text-cyan-500 font-medium">Coming in Week 4</span> — FastAPI backend + React UI.
      </p>
      <div className="mt-2 text-xs text-gray-600 space-y-1">
        <p>✓ TypeScript interfaces ready</p>
        <p>✓ RBAC permissions configured</p>
        <p>✓ 10-digit account validation logic mapped</p>
        <p>⏳ FastAPI endpoints — Track B</p>
        <p>⏳ React form + approval flow — Week 4</p>
      </div>
    </div>
  )
}
